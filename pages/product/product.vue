<template>
    <view class="container">
        <view class="carousel">
            <swiper indicator-dots circular="true" duration="400">
                <swiper-item class="swiper-item" v-for="(item,index) in imgList" :key="index">
                    <view class="image-wrapper">
                        <image :src="item.src" class="loaded" mode="aspectFill"></image>
                    </view>
                </swiper-item>
            </swiper>
        </view>

        <view class="introduce-section">
            <text class="title">{{product.name}}</text>
            <text class="title2" v-if="product.subTitle">{{product.subTitle}}</text>
            <view class="price-box">
                <text class="price-tip">¥</text>
                <text class="price">{{product.price}}</text>
                <text class="m-price" v-if="product.originalPrice > product.price">¥{{product.originalPrice}}</text>
            </view>
        </view>

        <view class="detail-desc">
            <view class="d-header">
                <text>图文详情</text>
            </view>
            <rich-text :nodes="desc"></rich-text>
        </view>

        <view class="page-bottom">
            <navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn">
                <text class="yticon icon-xiatubiao--copy"></text>
                <text>首页</text>
            </navigator>

            <navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
                <text class="yticon icon-gouwuche"></text>
                <text>购物车</text>
            </navigator>

            <view class="action-btn-group">
                <button type="primary" class="action-btn" @click="addToCart">加入购物车</button>
                <button type="primary" class="action-btn" @click="buy">立即下单</button>
            </view>
        </view>
    </view>
</template>

<script>
    import { fetchProductDetail } from '@/api/product.js';
    import { addCartItem } from '@/api/cart.js';
    import { createReadHistory } from '@/api/memberReadHistory.js';
    // 移除收藏相关 API 引用
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                imgList: [],
                desc: '',
                product: {},
                // 仅保留基础品牌容器，不进行逻辑加载
                brand: {},
                skuStockList: []
            };
        },
        async onLoad(options) {
            this.loadData(options.id);
        },
        computed: {
            ...mapState(['hasLogin'])
        },
        methods: {
            async loadData(id) {
                fetchProductDetail(id).then(response => {
                    const data = response.data;
                    this.product = data.product;
                    this.skuStockList = data.skuStockList;
                    this.brand = data.brand;

                    this.initImgList();
                    this.initProductDesc();
                    this.handleReadHistory();

                    // 默认展示第一个SKU的价格和库存
                    if (this.skuStockList && this.skuStockList.length > 0) {
                        const defaultSku = this.skuStockList[0];
                        this.product.stock = defaultSku.stock;
                        this.product.price = (this.product.promotionType == 1)
                            ? defaultSku.promotionPrice
                            : defaultSku.price;
                    }
                });
            },

            getSkuStock() {
                return (this.skuStockList && this.skuStockList.length > 0) ? this.skuStockList[0] : null;
            },

            // 公用加入购物车逻辑
            async performAddCart() {
                let productSkuStock = this.getSkuStock();
                if (!productSkuStock) {
                    uni.showToast({ title: '商品暂时无货', icon: 'none' });
                    return null;
                }

                let cartItem = {
                    productId: this.product.id,
                    productName: this.product.name,
                    productPic: this.product.pic,
                    productSkuId: productSkuStock.id,
                    productSkuCode: productSkuStock.skuCode,
                    productAttr: productSkuStock.spData,
                    price: this.product.price,
                    quantity: 1,
                    productBrand: this.product.brandName,
                    productSn: this.product.productSn,
                    productSubTitle: this.product.subTitle
                };

                return addCartItem(cartItem);
            },

            // 仅加入购物车
            addToCart() {
                if (!this.checkForLogin()) return;
                this.performAddCart().then(res => {
                    if(res) uni.showToast({ title: '已加入购物车', duration: 1500 });
                });
            },

            // 立即下单：加入并跳转
            buy() {
                if (!this.checkForLogin()) return;
                this.performAddCart().then(res => {
                    if(res) {
                        // 成功后直接跳转到购物车组件进行结算
                        uni.switchTab({
                            url: '/pages/cart/cart'
                        });
                    }
                });
            },

            initImgList() {
                let pics = this.product.albumPics ? this.product.albumPics.split(',') : [];
                pics.unshift(this.product.pic);
                this.imgList = pics.filter(t => t).map(src => ({ src }));
            },

            initProductDesc() {
                this.desc = this.product.detailMobileHtml;
            },

            handleReadHistory() {
                if (this.hasLogin) {
                    createReadHistory({
                        productId: this.product.id,
                        productName: this.product.name,
                        productPic: this.product.pic,
                        productPrice: this.product.price,
                        productSubTitle: this.product.subTitle,
                    });
                }
            },

            checkForLogin() {
                if (!this.hasLogin) {
                    uni.showModal({
                        title: '提示',
                        content: '下单前请先登录',
                        confirmText: '去登录',
                        success: (res) => { if (res.confirm) uni.navigateTo({ url: '/pages/public/login' }) }
                    });
                    return false;
                }
                return true;
            }
        }
    }
</script>

<style lang='scss'>
    page {
       background: $page-color-base;
       padding-bottom: 160upx;
    }

    .icon-you {
       font-size: $font-base + 2upx;
       color: #888;
    }

    /* 轮播图保持原样 */
    .carousel {
       height: 722upx;
       position: relative;
       swiper { height: 100%; }
       .image-wrapper { width: 100%; height: 100%; }
       .swiper-item {
          display: flex;
          justify-content: center;
          align-content: center;
          height: 750upx;
          overflow: hidden;
          image { width: 100%; height: 100%; }
       }
    }

    /* 标题简介优化：移除多余的 bot-row（销量等） */
    .introduce-section {
       background: #fff;
       padding: 20upx 30upx;
       .title {
          font-size: 32upx;
          color: $font-color-dark;
          line-height: 50upx;
       }
       .title2 {
          font-size: 28upx;
          color: $font-color-light;
          line-height: 46upx;
       }
       .price-box {
          display: flex;
          align-items: baseline;
          height: 64upx;
          padding: 10upx 0;
          font-size: 26upx;
          color: $uni-color-primary;
       }
       .price { font-size: $font-lg + 2upx; }
       .m-price {
          margin: 0 12upx;
          color: $font-color-light;
          text-decoration: line-through;
       }
    }

    /* 图文详情：增加间距，补足移除品牌后的空白 */
    .detail-desc {
       background: #fff;
       margin-top: 20upx; // 稍微加大间距
       .d-header {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80upx;
          font-size: $font-base + 2upx;
          color: $font-color-dark;
          position: relative;
          text {
             padding: 0 20upx;
             background: #fff;
             position: relative;
             z-index: 1;
          }
          &:after {
             position: absolute;
             left: 50%;
             top: 50%;
             transform: translateX(-50%);
             width: 300upx;
             height: 0;
             content: '';
             border-bottom: 1px solid #ccc;
          }
       }
    }

    .detail-desc ::v-deep img {
       width: 100%;
       height: auto;
       display: block; // 防止图片下方出现间隙
    }

    /* 底部操作菜单优化 */
    .page-bottom {
       position: fixed;
       left: 30upx;
       bottom: 30upx;
       z-index: 95;
       display: flex;
       justify-content: space-between; // 改为两端对齐
       align-items: center;
       width: 690upx;
       height: 100upx;
       background: rgba(255, 255, 255, .9);
       box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .3); // 阴影调淡一点
       border-radius: 16upx;

       .p-b-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: $font-sm;
          color: $font-color-base;
          width: 96upx;
          height: 80upx;
          .yticon {
             font-size: 40upx;
             line-height: 48upx;
             color: $font-color-light;
          }
       }

       .action-btn-group {
          display: flex;
          height: 76upx;
          border-radius: 100px;
          overflow: hidden;
          background: linear-gradient(to right, #ffac30, #fa436a); // 简化渐变色
          margin-right: 20upx; // 靠右对齐
          position: relative;

          &:after {
             content: '';
             position: absolute;
             top: 50%;
             right: 50%;
             transform: translateY(-50%);
             height: 28upx;
             width: 0;
             border-right: 1px solid rgba(255, 255, 255, .5);
          }

          .action-btn {
             display: flex;
             align-items: center;
             justify-content: center;
             width: 180upx;
             height: 100%;
             font-size: $font-base;
             padding: 0;
             border-radius: 0;
             background: transparent;
             color: #fff; // 明确按钮文字颜色
          }
       }
    }

    /* 彻底移除 .brand-info, .share-section, .eva-section 等无用样式以减小包体积 */
</style>