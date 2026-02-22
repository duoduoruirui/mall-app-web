<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view>

		<view class="wrapper">
			<view class="left-top-sign">LOGIN</view>
			<view class="welcome">
				欢迎回来！
			</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">用户名</text>
					<input type="text" v-model="username" placeholder="请输入用户名" maxlength="11"/>
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input type="text" v-model="password" placeholder="请输入密码" placeholder-class="input-empty" maxlength="20"
					 password @confirm="toLogin" />
				</view>
			</view>

			<button class="confirm-btn" @click="toLogin" :disabled="logining">登录</button>




			<view class="forget-section" @click="toUpdatePassword">
				忘记密码?
			</view>
		</view>

		<view class="register-section">
			还没有账号?
			<text @click="toRegist">马上注册</text>
		</view>
	</view>
</template>

<script>
	import { mapMutations } from 'vuex';
	import { memberLogin, memberInfo } from '@/api/member.js';

	export default {
		data() {
			return {
				username: '',
				password: '',
				logining: false
			}
		},
		onLoad() {
			// 初始化时尝试从本地获取记住的账号
			this.username = uni.getStorageSync('username') || '';
			this.password = uni.getStorageSync('password') || '';
		},
		methods: {
			...mapMutations(['login']),

			navBack() {
				uni.navigateBack();
			},

			// 跳转注册页
			toRegist() {
				uni.navigateTo({
					url: '/pages/public/register'
				});
			},

			// 跳转修改密码页（需确保你有对应的 forget.vue 页面）
			toUpdatePassword() {
				uni.navigateTo({
					url: '/pages/public/forget'
				});
			},

			// 解决之前的引流痛点：直接填入测试号，不跳二维码
			fillTestAccount() {
				this.username = 'test'; // 这里可以改成你数据库里的真实测试号
				this.password = '123456';
				uni.showToast({
					title: '已填入体验账号',
					icon: 'none'
				});
			},

			async toLogin() {
				if(!this.username || !this.password){
					uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
					return;
				}

				this.logining = true;

				// 1. 执行登录逻辑
				memberLogin({
					username: this.username,
					password: this.password
				}).then(response => {
					// 拼接 Token 并存储
					const tokenHead = response.data.tokenHead || '';
					const token = response.data.token;
					uni.setStorageSync('token', tokenHead + token);

					// 记住账号密码（可选，建议只记用户名）
					uni.setStorageSync('username', this.username);
					uni.setStorageSync('password', this.password);

					// 2. 获取会员详细信息
					memberInfo().then(infoRes => {
						// 更新 Vuex 状态
						this.login(infoRes.data);
						uni.showToast({ title: '登录成功' });

						// 延迟返回，让用户看到提示
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					}).catch(() => {
						this.logining = false;
					});

				}).catch(() => {
					this.logining = false;
				});
			},
		},
	}
</script>

<style lang='scss'>
	/* 保持原有的样式不变，确保视觉统一 */
	page {
		background: #fff;
	}

	.container {
		padding-top: 115px;
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}

	.wrapper {
		position: relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;
	}

	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}

	.left-top-sign {
		font-size: 120upx;
		color: $page-color-base;
		position: relative;
		left: -16upx;
	}

	.right-top-sign {
		position: absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;

		&:before,
		&:after {
			display: block;
			content: "";
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}

		&:before {
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}

		&:after {
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
		}
	}

	.left-bottom-sign {
		position: absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}

	.welcome {
		position: relative;
		left: 50upx;
		top: -90upx;
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0, 0, 0, .3);
	}

	.input-content {
		padding: 0 60upx;
	}

	.input-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 30upx;
		background: $page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;

		&:last-child {
			margin-bottom: 0;
		}

		.tit {
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}

		input {
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}
	}

	.confirm-btn {
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 70upx;
		background: $uni-color-primary;
		color: #fff;
		font-size: $font-lg;
		&:after { border-radius: 100px; }
	}

	.confirm-btn2 {
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 40upx;
		background: #f8f8f8; /* 改浅色区分登录按钮 */
		color: $font-color-base;
		font-size: $font-lg;
		&:after { border-radius: 100px; }
	}

	.forget-section {
		font-size: $font-sm+2upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 40upx;
	}

	.register-section {
		position: absolute;
		left: 0;
		bottom: 50upx;
		width: 100%;
		font-size: $font-sm+2upx;
		color: $font-color-base;
		text-align: center;
		text {
			color: $font-color-spec;
			margin-left: 10upx;
		}
	}
</style>