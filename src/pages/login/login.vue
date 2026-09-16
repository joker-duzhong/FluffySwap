<template>
  <view class="login-page">
    <AppTopNav />
    <view class="center">
      <image class="logo" :src="ASSETS.logoSymbol" mode="aspectFit" />
      <text class="title">立即登录</text>
    </view>
    <view class="sheet">
      <image class="sheet-logo" :src="ASSETS.logoSymbol" mode="aspectFit" />
      <text class="sheet-title">欢迎使用灵钥</text>
      <IdentityLoginForm @logged-in="handleLoggedIn" />
    </view>
  </view>
</template>

<script setup lang="ts">
import AppTopNav from '@/components/AppTopNav.vue'
import IdentityLoginForm from '@/components/IdentityLoginForm.vue'
import { ASSETS } from '@/config/assets'
const handleLoggedIn = () => {
  if (getCurrentPages().length > 1) uni.navigateBack()
  else uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  min-height: 100vh;
  background: #050506;
}

.center {
  height: 330rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 146rpx;
  height: 146rpx;
  border-radius: 50%;
  box-shadow: 0 0 42rpx rgba(88, 88, 255, 0.38);
}

.title {
  margin-top: 30rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 92vh;
  overflow-y: auto;
  min-height: 548rpx;
  padding: 48rpx 38rpx calc(34rpx + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, rgba(29, 30, 41, 0.98), rgba(18, 18, 24, 0.98));
}

.sheet-logo {
  width: 110rpx;
  height: 110rpx;
}

.sheet-title {
  margin-top: 38rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

</style>
