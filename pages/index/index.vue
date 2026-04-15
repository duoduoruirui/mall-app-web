<template>
	<view class="container">
		<view class="guess-section">
			<view v-for="(item, index) in recommendProductList"
				:key="index"
				class="guess-item"
				@click="navToDetailPage(item)">

				<view class="image-wrapper">
					<image :src="item.pic" mode="aspectFill"></image>
				</view>

				<view class="content-box">
					<text class="title clamp">{{item.name}}</text>
					<text class="title2 clamp">{{item.subTitle}}</text>
					<view class="price-box">
						<text class="price">￥{{item.price}}</text>
						<text class="sales" v-if="item.sale">销量: {{item.sale}}</text>
					</view>
				</view>
			</view>
		</view>

		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import { fetchRecommendProductList } from '@/api/home.js';
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';

	export default {
		components: {
			uniLoadMore
		},
		data() {
			return {
				recommendProductList: [],
				recommendParams: {
					pageNum: 1,
					pageSize: 10
				},
				loadingType: 'more'
			};
		},
		onLoad() {
			this.loadData();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.recommendParams.pageNum = 1;
			this.loadData();
		},
		// 触底加载更多
		onReachBottom() {
			if (this.loadingType === 'nomore') return;

			this.recommendParams.pageNum++;
			this.loadingType = 'loading';
			fetchRecommendProductList(this.recommendParams).then(res => {
				if (res.data.length === 0) {
					this.loadingType = 'nomore';
				} else {
					this.recommendProductList = this.recommendProductList.concat(res.data);
					this.loadingType = 'more';
				}
			});
		},
		methods: {
			async loadData() {
				fetchRecommendProductList(this.recommendParams).then(res => {
					this.recommendProductList = res.data;
					uni.stopPullDownRefresh();
					// 如果初始化数据不满一屏，状态设为没有更多
					if (res.data.length < this.recommendParams.pageSize) {
						this.loadingType = 'nomore';
					}
				});
			},
			navToDetailPage(item) {
				uni.navigateTo({
					url: `/pages/product/product?id=${item.id}`
				});
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #f8f8f8;
	}

	.container {
		padding-top: 20upx;
	}

	.guess-section {
		display: flex;
		flex-wrap: wrap;
		padding: 0 30upx;
		background: #f8f8f8;

		.guess-item {
			display: flex;
			flex-direction: column;
			width: 48%;
			padding-bottom: 30upx;
			margin-bottom: 20upx;
			background: #fff;
			border-radius: 16upx;
			overflow: hidden;

			&:nth-child(2n+1) {
				margin-right: 4%;
			}
		}

		.image-wrapper {
			width: 100%;
			height: 330upx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}

		.content-box {
			padding: 20upx;
			display: flex;
			flex-direction: column;

			.title {
				font-size: 28upx;
				color: #303133;
				line-height: 40upx;
				height: 40upx;
			}

			.title2 {
				font-size: 24upx;
				color: #909399;
				line-height: 34upx;
				height: 34upx;
				margin-top: 6upx;
			}

			.price-box {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 16upx;

				.price {
					font-size: 32upx;
					color: #fa436a;
					font-weight: bold;
					&:before {
						content: '￥';
						font-size: 24upx;
					}
				}

				.sales {
					font-size: 22upx;
					color: #999;
				}
			}
		}
	}

	/* 文字超过一行显示省略号 */
	.clamp {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}
</style>