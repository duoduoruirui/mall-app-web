<template>  
    <view class="container">  
       <view class="user-section">
          <image class="bg" src="/static/user-bg.jpg"></image>
          <view class="user-info-box">
             <view class="portrait-box" @click="navToLogin">
                <image class="portrait" :src="userInfo.icon || '/static/missing-face.png'"></image>
             </view>
             <view class="info-box">
                <text class="username" @click="navToLogin">
                    {{hasLogin ? (userInfo.nickname || '已登录') : '点击登录'}}
                </text>
             </view>
          </view>
          </view>

       <view
          class="cover-container"
          :style="[{
             transform: coverTransform,
             transition: coverTransition
          }]"
          @touchstart="coverTouchstart"
          @touchmove="coverTouchmove"
          @touchend="coverTouchend"
       >
          <image class="arc" src="/static/arc.png"></image>



          <view class="order-section">
             <view class="order-item" @click="navTo('/pages/order/order?state=0')" hover-class="common-hover" :hover-stay-time="50">
                <text class="yticon icon-shouye"></text>
                <text>全部订单</text>
             </view>
             <view class="order-item" @click="navTo('/pages/order/order?state=1')" hover-class="common-hover" :hover-stay-time="50">
                <text class="yticon icon-daifukuan"></text>
                <text>待付款</text>
             </view>
             <view class="order-item" @click="navTo('/pages/order/order?state=2')" hover-class="common-hover" :hover-stay-time="50">
                <text class="yticon icon-yishouhuo"></text>
                <text>待收货</text>
             </view>
             <view class="order-item" @click="navTo('/pages/order/order?state=4')" hover-class="common-hover" :hover-stay-time="50">
                <text class="yticon icon-shouhoutuikuan"></text>
                <text>退款/售后</text>
             </view>
          </view>

          <view class="history-section icon">
             <list-cell icon="icon-dizhi" iconColor="#5fcda2" title="收货地址" @eventClick="navTo('/pages/address/address')"></list-cell>
             <list-cell icon="icon-shezhi1" iconColor="#e07472" title="设置" border="" @eventClick="navTo('/pages/set/set')"></list-cell>
          </view>
       </view>
    </view>
</template>

<script>
    import listCell from '@/components/mix-list-cell';
    import { fetchMemberCouponList } from '@/api/coupon.js';
    import { mapState } from 'vuex';

    let startY = 0, moveY = 0, pageAtTop = true;

    export default {
       components: {
          listCell
       },
       data(){
          return {
             coverTransform: 'translateY(0px)',
             coverTransition: '0s',
             moving: false,
             couponCount: 0
          }
       },
       onShow(){
          if(this.hasLogin){
             fetchMemberCouponList(0).then(response=>{
                if(response.data && response.data.length > 0){
                   this.couponCount = response.data.length;
                }
             });
          } else {
             this.couponCount = 0;
          }
       },

       /**
        * 核心修复：监听原生标题栏按钮点击
        */
       onNavigationBarButtonTap(e) {
          const index = e.index;
          if (index === 0) {
             // 对应 pages.json 中 user 路径下的第一个 button (齿轮)
             uni.navigateTo({ url: '/pages/set/set' });
          } else if (index === 1) {
             // 对应第二个 button (消息)
             uni.navigateTo({ url: '/pages/notice/notice' });
          }
       },

       computed: {
          ...mapState(['hasLogin','userInfo'])
       },

       methods: {
          /**
           * 专门处理登录跳转
           */
          navToLogin(){
             if(!this.hasLogin){
                uni.navigateTo({ url: '/pages/public/login' });
             }
          },

          /**
           * 统一跳转接口
           */
          navTo(url){
             if(!this.hasLogin){
                url = '/pages/public/login';
             }
             uni.navigateTo({ url });
          },

          /**
           * 会员卡下拉回弹逻辑 (保持不变)
           */
          coverTouchstart(e){
             if(pageAtTop === false) return;
             this.coverTransition = 'transform .1s linear';
             startY = e.touches[0].clientY;
          },
          coverTouchmove(e){
             moveY = e.touches[0].clientY;
             let moveDistance = moveY - startY;
             if(moveDistance < 0){
                this.moving = false;
                return;
             }
             this.moving = true;
             if(moveDistance >= 80 && moveDistance < 100) moveDistance = 80;
             if(moveDistance > 0 && moveDistance <= 80){
                this.coverTransform = `translateY(${moveDistance}px)`;
             }
          },
          coverTouchend(){
             if(this.moving === false) return;
             this.moving = false;
             this.coverTransition = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
             this.coverTransform = 'translateY(0px)';
          }
       }
    }
</script>

<style lang='scss'>
    /* 样式部分保持你提供的原样，确保 UI 布局不崩 */
    %flex-center {
       display:flex;
       flex-direction: column;
       justify-content: center;
       align-items: center;
    }
    %section {
       display:flex;
       justify-content: space-around;
       align-content: center;
       background: #fff;
       border-radius: 10upx;
    }
    .user-section{
       height: 520upx;
       padding: 100upx 30upx 0;
       position:relative;
       .bg{
          position:absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          filter: blur(1px);
          opacity: .7;
       }
    }
    .user-info-box{
       height: 180upx;
       display:flex;
       align-items:center;
       position:relative;
       z-index: 1;
       .portrait{
          width: 130upx;
          height: 130upx;
          border:5upx solid #fff;
          border-radius: 50%;
       }
       .username{
          font-size: $font-lg + 6upx;
          color: $font-color-dark;
          margin-left: 20upx;
       }
    }
    .cover-container{
       background: $page-color-base;
       margin-top: -150upx;
       padding: 0 30upx;
       position:relative;
       background: #f5f5f5;
       padding-bottom: 20upx;
       .arc{
          position:absolute;
          left: 0;
          top: -34upx;
          width: 100%;
          height: 36upx;
       }
    }
    .tj-sction{
       @extend %section;
       .tj-item{
          @extend %flex-center;
          flex-direction: column;
          height: 140upx;
          font-size: $font-sm;
          color: #75787d;
       }
       .num{
          font-size: $font-lg;
          color: $font-color-dark;
          margin-bottom: 8upx;
       }
    }
    .order-section{
       @extend %section;
       padding: 28upx 0;
       margin-top: 20upx;
       .order-item{
          @extend %flex-center;
          width: 120upx;
          height: 120upx;
          border-radius: 10upx;
          font-size: $font-sm;
          color: $font-color-dark;
       }
       .yticon{
          font-size: 48upx;
          margin-bottom: 18upx;
          color: #fa436a;
       }
    }
    .history-section{
       padding: 30upx 0 0;
       margin-top: 20upx;
       background: #fff;
       border-radius:10upx;
    }
</style>