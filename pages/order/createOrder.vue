<template>
	<view>
		<navigator url="/pages/address/address?source=1" class="address-section">
			<view class="order-content">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen" v-if="currentAddress && currentAddress.id">
					<view class="top">
						<text class="name">{{currentAddress.name}}</text>
						<text class="mobile">{{currentAddress.phoneNumber}}</text>
					</view>
					<text class="address">{{currentAddress.province}} {{currentAddress.city}} {{currentAddress.region}} {{currentAddress.detailAddress}}</text>
				</view>
				<view class="cen" v-else>
					<text class="address" style="color: #fa436a;">请选择收货地址</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>
		</navigator>

		<view class="goods-section">
			<view class="g-header b-b">
				<text class="name">商品信息</text>
			</view>
			<view class="g-item" v-for="item in cartPromotionItemList" :key="item.id">
				<image :src="item.productPic"></image>
				<view class="right">
					<text class="title clamp">{{item.productName}}</text>
					<text class="spec">{{item.productAttr | formatProductAttr}}</text>
					<text class="promotion clamp">{{item.promotionMessage}}</text>
					<view class="price-box">
						<text class="price">￥{{item.price}}</text>
						<text class="number">x {{item.quantity}}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="yt-list">
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">商品合计</text>
				<text class="cell-tip">￥{{calcAmount.totalAmount || 0}}</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">运费</text>
				<text class="cell-tip">￥{{calcAmount.freightAmount || 0}}</text>
			</view>
            <view class="yt-list-cell desc-cell">
				<text class="cell-tit clamp">备注</text>
				<input class="desc" type="text" v-model="desc" placeholder="请填写备注信息" />
			</view>
		</view>

		<view class="footer">
			<view class="price-content">
				<text>实付款</text>
				<text class="price-tip">￥</text>
				<text class="price">{{calcAmount.payAmount || 0}}</text>
			</view>
			<text class="submit" @click="submit">提交订单</text>
		</view>
	</view>
</template>

<script>
	import { generateConfirmOrder, generateOrder } from '@/api/order.js';
	import { formatDate } from '@/utils/date';

	export default {
		data() {
			return {
				desc: '',
				payType: 1,
				currentAddress: {},
				memberReceiveAddressList: [],
				cartPromotionItemList: [],
				calcAmount: {
					totalAmount: 0,
					payAmount: 0,
					freightAmount: 0
				},
				cartIds: []
			}
		},
		onLoad(option) {
			if(option.cartIds) {
				this.cartIds = JSON.parse(option.cartIds);
				this.loadData();
			}
		},
		filters: {
			formatProductAttr(jsonAttr) {
				if (!jsonAttr) return '';
				try {
					let attrArr = JSON.parse(jsonAttr);
					return attrArr.map(attr => `${attr.key}:${attr.value}`).join('; ');
				} catch (e) {
					return '';
				}
			}
		},
		methods: {
			async loadData() {
				uni.showLoading({ title: '加载中...' });
				generateConfirmOrder(JSON.stringify(this.cartIds)).then(res => {
					uni.hideLoading();
					if (res.data) {
						this.memberReceiveAddressList = res.data.memberReceiveAddressList || [];
						this.currentAddress = this.getDefaultAddress();
						this.cartPromotionItemList = res.data.cartPromotionItemList || [];
						this.calcAmount = res.data.calcAmount || {};
					}
				}).catch(() => uni.hideLoading());
			},
			getDefaultAddress() {
				if (!this.memberReceiveAddressList.length) return {};
				let res = this.memberReceiveAddressList.find(item => item.defaultStatus == 1);
				return res ? res : this.memberReceiveAddressList[0];
			},
			submit() {
				if (!this.currentAddress.id) {
					uni.showToast({ title: '请选择收货地址', icon: 'none' });
					return;
				}

				const orderParam = {
					payType: this.payType,
					memberReceiveAddressId: this.currentAddress.id,
					cartIds: this.cartIds,
					couponId: null,
					useIntegration: 0,
					note: this.desc
				};

				uni.showLoading({ title: '正在提交...' });
				generateOrder(orderParam).then(res => {
					uni.hideLoading();
					const orderId = res.data.order.id;
					uni.showModal({
						title: '提示',
						content: '订单创建成功，去支付吗？',
						success: (modalRes) => {
							if (modalRes.confirm) {
								uni.redirectTo({ url: `/pages/money/pay?orderId=${orderId}` });
							} else {
								uni.redirectTo({ url: '/pages/order/order?state=0' });
							}
						}
					});
				}).catch(() => uni.hideLoading());
			}
		}
	}
</script>

<style lang="scss">
	page { background: $page-color-base; padding-bottom: 100upx; }
	.address-section { padding: 30upx 0; background: #fff; position: relative; }
	.order-content { display: flex; align-items: center; }
	.icon-shouhuodizhi { width: 90upx; color: #888; font-size: 44upx; text-align: center; }
	.cen { flex: 1; display: flex; flex-direction: column; font-size: 28upx; color: $font-color-dark; }
	.name { font-size: 34upx; margin-right: 24upx; }
	.address { margin-top: 16upx; color: $font-color-light; }
	.icon-you { font-size: 32upx; color: $font-color-light; margin-right: 30upx; }
	.goods-section { margin-top: 16upx; background: #fff; padding-bottom: 1px;
		.g-header { display: flex; align-items: center; height: 84upx; padding: 0 30upx; }
		.name { font-size: 30upx; color: $font-color-base; margin-left: 24upx; }
		.g-item { display: flex; margin: 20upx 30upx;
			image { width: 140upx; height: 140upx; border-radius: 4upx; flex-shrink: 0; }
			.right { flex: 1; padding-left: 24upx; overflow: hidden; }
			.title { font-size: 30upx; color: $font-color-dark; }
			.spec { font-size: 26upx; color: $font-color-light; }
			.price-box { display: flex; align-items: center; font-size: 32upx; color: $font-color-dark; padding-top: 10upx;
				.number { font-size: 26upx; color: $font-color-base; margin-left: 20upx; }
			}
		}
	}
	.yt-list { margin-top: 16upx; background: #fff; }
	.yt-list-cell { display: flex; align-items: center; padding: 10upx 30upx 10upx 40upx; line-height: 70upx;
		.cell-tit { flex: 1; font-size: 26upx; color: $font-color-light; }
		.cell-tip { font-size: 26upx; color: $font-color-dark; }
		.desc { flex: 1; font-size: 28upx; }
	}
	.footer { position: fixed; left: 0; bottom: 0; z-index: 998; display: flex; align-items: center; width: 100%; height: 90upx; justify-content: space-between; background: #fff; box-shadow: 0 -1px 5px rgba(0,0,0,.1);
		.price-content { padding-left: 30upx; }
		.price-tip { color: $base-color; margin-left: 8upx; }
		.price { font-size: 36upx; color: $base-color; }
		.submit { display: flex; align-items: center; justify-content: center; width: 280upx; height: 100%; color: #fff; font-size: 32upx; background: $base-color; }
	}
</style>