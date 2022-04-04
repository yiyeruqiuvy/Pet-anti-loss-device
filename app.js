const express = require("express");
const app = express();
const mysql = require("mysql");

var position = {
    longitude: 106.607907,
    latitude : 29.531372,
};

// 创建连接
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

// 查询单条内容
app.get("/gets/:id",(req,res) => {
    let sql = `SELECT * FROM position WHERE id = ${req.params.id}`;
    db.query(sql,(err,result) => {
        if(err){
            console.log(err);
        }else{
            console.log("查询了一条数据如下：");
            console.log(result);
            res.json(result)
        }
    })
})
// 查询最新的定位数据
app.get("/query",(req,res) => {
    let sql = `SELECT * from position where id=(SELECT MAX(id) from position)`;
    db.query(sql,(err,result) => {
        if(err){
            console.log(err);
        }else{
            console.log(result);
            res.json(result);
        }
    })
})

app.listen(3335, () => {
    console.log("服务器开启在3335端口....");
})