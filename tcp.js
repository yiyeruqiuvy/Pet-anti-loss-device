const net = require("net");
const mysql = require("mysql");
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
 
//连接数据库
const db = mysql.createConnection({
	host     : '1.116.219.206',       
	user     : 'pet_position',              
	password : 'ruqiu116vy',       
	  // port: '3306',                   
	database: 'pet_position' 
})
db.connect( (err) => {
    if(err) throw err;
    console.log('连接成功');
})

//上传到sql
function insert_sql(log,lat){
	var  sql = 'INSERT INTO position SET ?';
	//var  value = [log,lat];
	var value = {
		longitude: log,
		latitude: lat
	};
	db.query(sql,value,function (err, result) {
		if(err){
			console.log('[INSERT ERROR] - ',err.message);
			return;
			}        
	 
		console.log('--------------------------INSERT----------------------------');
		//console.log('INSERT ID:',result.insertId);        
		console.log('INSERT ID:',result);        
		console.log('-----------------------------------------------------------------\n\n');  
	});
	//db.end();
}

//转化坐标为高德地图
function httpGetAsync(log, lat)
{	
	var xhr = new XMLHttpRequest();
	var url = 'https://restapi.amap.com/v3/assistant/coordinate/convert?locations='+log+','+lat+'&coordsys=gps&key=c322c129f40c801a86f6b70ef641c364';
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200){
			var res = xhr.responseText;
			var logg = res.substring(58,74);
			var latt = res.substring(75,90);
			insert_sql(parseFloat(logg),parseFloat(latt));
			}	
    };
    xhr.open("GET", url, true); // true 为异步
    xhr.send(null);
}

let server = net.createServer(function(socket){
	let address = socket.address();
	console.log('socket端口对象的地址信息为%j', address);
	socket.on("data",function(data){
		console.log("客户端传输数据为："+data);
		
		if(parseInt(String.fromCharCode(data[0]).toString()) == 2){
			var lat_1 = parseInt(String.fromCharCode(data[0]).toString()) * 10 + parseInt(String.fromCharCode(data[1]).toString());
			var lat_2 = (parseInt(String.fromCharCode(data[2]).toString())*100000 + parseInt(String.fromCharCode(data[3]).toString()) * 10000 + parseInt(String.fromCharCode(data[5]).toString()) * 1000 + parseInt(String.fromCharCode(data[6]).toString()) * 100 + parseInt(String.fromCharCode(data[7]).toString()) * 10 + parseInt(String.fromCharCode(data[8]).toString()))/10000; 
			var lat = (lat_1 + lat_2/60).toFixed(6);
			
			var log_1 = parseInt(String.fromCharCode(data[12]).toString()) * 100 + parseInt(String.fromCharCode(data[13]).toString()) * 10 + parseInt(String.fromCharCode(data[14]).toString());
			var log_2 = (parseInt(String.fromCharCode(data[15]).toString())*100000 + parseInt(String.fromCharCode(data[16]).toString()) * 10000 + parseInt(String.fromCharCode(data[18]).toString()) * 1000 + parseInt(String.fromCharCode(data[19]).toString()) * 100 + parseInt(String.fromCharCode(data[20]).toString()) * 10 + parseInt(String.fromCharCode(data[21]).toString()))/10000;
			var log = (log_1 + log_2/60).toFixed(6);
			
			console.log("经纬度是:");
			console.log(log,lat);
			httpGetAsync(log,lat);
		
		}

	});
});

let address = server.address();
console.log("address："+address);

server.listen(3333, function () {
    console.log('服务器开始监听');
});