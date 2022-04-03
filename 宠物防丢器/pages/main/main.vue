<template>
	<view class="content">
		<view v-if="hasLogin" class="hello">
			<view class="title">
				您好 {{userName}}，欢迎回来！
			</view>
			<view>
			    <view class="page-body">
			        <view class="page-section page-section-gap">
			           <map style="width: 100%; height:1300rpx;" :latitude="latitude[0]" :longitude="longitude[0]" :markers="covers" @markertap="showdetail(longitude[0],latitude[0])">
			            </map>
			        </view>
			    </view>
			</view>
		</view>
		<view v-if="!hasLogin" class="hello">
			<view class="title">
				你好 憨憨。
			</view>
			<view class="ul">
				<view>瞧啥呢，赶紧登录去看你的宠物去</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import {
		univerifyLogin
	} from '@/common/univerify.js'
	let that = null;
	export default {
		computed: mapState(['forcedLogin', 'hasLogin', 'userName']),
		data() {
			return {
				id: 0,
				latitude: [29.53147,29.53147],
				longitude: [106.609028,106.609028],
				covers: [
				//模拟宠物位置
				{	id:'1',
					
				    latitude: 29.530238,
				    longitude: 106.60854,
					width:22,
					height:22,
				    iconPath: '../../static/img/hanhan.jpg',
					label:{
						content: '您家崽崽在这嘞',  //文本
						color: '#ef390a',  //文本颜色
						borderRadius: 3,  //边框圆角
						borderWidth: 1,  //边框宽度
						borderColor: '#FF0202',  //边框颜色
						bgColor: '#9debe2',  //背景色
						padding: 5,  //文本边缘留白
						textAlign: 'center'  //文本对齐方式。有效值: left, right, center
						},
					callout:{
						content:"宝宝",
						color:"#4bff09",
						fontSize:23,
					},
				   }],			
			}
		},
		onLoad() {
			that = this;
			
			const loginType = uni.getStorageSync('login_type')
			if (loginType === 'local') {
				this.login(uni.getStorageSync('username'))
				return
			}
			let uniIdToken = uni.getStorageSync('uni_id_token')
			if (uniIdToken) {
				this.login(uni.getStorageSync('username'))
				uniCloud.callFunction({
					name: 'user-center',
					data: {
						action: 'checkToken',
					},
					success: (e) => {

						console.log('checkToken success', e);

						if (e.result.code > 0) {
							//token过期或token不合法，重新登录
							if (this.forcedLogin) {
								uni.reLaunch({
									url: '../login/login'
								});
							} else {
								uni.navigateTo({
									url: '../login/login'
								});
							}
						}
					},
					fail(e) {
						uni.showModal({
							content: JSON.stringify(e),
							showCancel: false
						})
					}
				})
			} else {
				this.guideToLogin()
			}
			// uni.getLocation({
			//     type: 'gcj02',
			//     success: (res)=> {
			// 		// this.longitude = res.longitude;
			// 		// this.latitude = res.latitude;
			// 		//this.$forceUpdate();
			// 		alert(res.data);
			//         console.log('当前位置的经度：' + res.longitude);
			//         console.log('当前位置的纬度：' + res.latitude);
			// 		this.$set(this.longitude, 0, res.longitude);
			// 		this.$set(this.latitude, 0, res.latitude);
			// 		console.log("what");
			//     }
			// });
			
			uni.request({
			    url: 'http://www.ruqiuvy.work:3335/query', 
			    success: (res) => {
					var position = res.data;
					//alert(position);
					var log = parseFloat(position[0].longitude.toFixed(6)).toFixed(6);
					var lat = parseFloat(position[0].latitude.toFixed(6)).toFixed(6);
					console.log(typeof log,log);
					console.log(typeof lat);
					// console.log(this.covers[0].longitude);
					// console.log(this.covers[0].id);
					this.covers[0].longitude = log;
					this.covers[0].latitude = lat;
					// this.longitude[0] = log;
					// this.latitude[0] = lat;
					this.$set(this.longitude, 0, log);
					this.$set(this.latitude, 0, lat);
					
					//alert(this.longitude[1]);
					this.$forceUpdate();
					// console.log(this.covers[0].longitude);
					// console.log(this.covers[0].latitude);
					
			        this.text = 'request success';
			    }
			});
		},
		methods: {
			...mapMutations(['login']),
			
			showdetail(longitude,latitude) {
				//var id=e.detail.markerId;
				//console.log(longitude,latitude);
				//console.log(JSON.stringify(e));//什么属性都能取到
				uni.openLocation({
					longitude: parseFloat(longitude),
				    latitude: parseFloat(latitude),
				    success: function () {
				        //console.log(latitude,longitude);
						//alert("fhk");
				    },
					fail:res=>{
						console.log("WHAT!!!")
						},
				});
			},
			
			guideToLogin() {
				uni.showModal({
					title: '未登录',
					content: '您未登录，需要登录后才能继续',
					/**
					 * 如果需要强制登录，不显示取消按钮
					 */
					showCancel: !this.forcedLogin,
					success: (res) => {
						if (res.confirm) {
							univerifyLogin().catch((err) => {
								if (err === false) return;
								/**
								 * 如果需要强制登录，使用reLaunch方式
								 */
								if (this.forcedLogin) {
									uni.reLaunch({
										url: '../login/login'
									});
								} else {
									uni.navigateTo({
										url: '../login/login'
									});
								}
							})
						}
					}
				});
			}
		}

	}
</script>

<style>
	.hello {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.title {
		font-size: 35rpx;
		color: #1dadb2;
		margin-top: 25px;
		margin-bottom: 20rpx;
	}

	.ul {
		font-size: 37rpx;
		color: #2e7b11;
		margin-top: 25px;
	}

	.ul>view {
		line-height: 38rpx;
	}
</style>
