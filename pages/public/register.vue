<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view>

		<view class="wrapper">
			<view class="left-top-sign">REGISTER</view>
			<view class="welcome">
				注 册 账 号
			</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">用户名</text>
					<input type="text" v-model="username" placeholder="请输入用户名" />
				</view>
				<view class="input-item">
					<text class="tit">手机号</text>
					<input type="number" v-model="telephone" placeholder="请输入手机号" maxlength="11" />
				</view>
				<view class="input-item">
					<text class="tit">验证码</text>
					<view class="code-wrapper">
						<input type="number" v-model="authCode" placeholder="请输入验证码" maxlength="6" />
						<button class="sms-btn" :disabled="sending" @click="getVerifyCode">
							{{ sending ? timer + 's' : '获取验证码' }}
						</button>
					</view>
				</view>
				<view class="input-item">
					<text class="tit">设置密码</text>
					<input type="text" v-model="password" placeholder="8-18位数字、字母组合" password @confirm="toRegister" />
				</view>
			</view>
			<button class="confirm-btn" @click="toRegister" :disabled="registering">立即注册</button>
		</view>
	</view>
</template>

<script>
	import { getAuthCode, memberRegister } from '@/api/member.js';

	export default {
		data() {
			return {
				username: '',
				password: '',
				telephone: '',
				authCode: '',
				registering: false,
				sending: false,
				timer: 60,
				interval: null
			}
		},
		methods: {
			navBack() {
				uni.navigateBack();
			},
			async getVerifyCode() {
				if (!/^1[3-9]\d{9}$/.test(this.telephone)) {
					uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
					return;
				}
				this.sending = true;
				// 调用 API
				getAuthCode(this.telephone).then(res => {
					uni.showToast({ title: '验证码已发送' });
					this.startTimer();
				}).catch(() => {
					this.sending = false;
				});
			},
			startTimer() {
				this.interval = setInterval(() => {
					this.timer--;
					if (this.timer <= 0) {
						clearInterval(this.interval);
						this.sending = false;
						this.timer = 60;
					}
				}, 1000);
			},
			async toRegister() {
				if (this.registering) return;
				if (!this.username || !this.password || !this.authCode) {
					uni.showToast({ title: '请填写完整信息', icon: 'none' });
					return;
				}

				this.registering = true;
				memberRegister({
					username: this.username,
					password: this.password,
					telephone: this.telephone,
					authCode: this.authCode
				}).then(res => {
					uni.showToast({ title: '注册成功！' });
					setTimeout(() => { this.navBack(); }, 1500);
				}).catch(() => {
					this.registering = false;
				});
			}
		},
		beforeDestroy() {
			if (this.interval) clearInterval(this.interval);
		}
	}
</script>

<style lang='scss'>
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

	.code-wrapper {
		display: flex;
		align-items: center;
		width: 100%;
		input { flex: 1; }
		.sms-btn {
			background: none;
			color: $uni-color-primary;
			font-size: 26upx;
			padding: 0;
			margin: 0;
			width: auto;
			height: auto;
			line-height: 1;
			&::after { border: none; }
			&:disabled { color: $font-color-disabled; }
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
		&:after {
			border-radius: 100px;
		}
	}
</style>