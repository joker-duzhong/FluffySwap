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
      <text class="desc">首次注册需要授权手机号进行登录</text>
      <button class="login-btn" @click="handleLogin">授权登录</button>
      <view class="agreement" @click="agreed = !agreed">
        <view class="radio" :class="{ active: agreed }"></view>
        <text>已阅读并同意</text>
        <text class="link" @click.stop="showAgreement('user')">《用户协议》</text>
        <text>和</text>
        <text class="link" @click.stop="showAgreement('privacy')">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import { ASSETS } from '@/config/assets'
import { WECHAT_CONFIG } from '@/config'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi } from '@/services/aurakey'

const authStore = useAuthStore()
const agreed = ref(false)

const showAgreement = (type: 'user' | 'privacy') => {
  uni.navigateTo({ url: `/pages/agreement/agreement?type=${type}` })
}

const handleLogin = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意协议', icon: 'none' })
    return
  }
  uni.showLoading({ title: '登录中...' })
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      try {
        const tokenRes = await aurakeyApi.auth.miniappLogin(WECHAT_CONFIG.APPID, loginRes.code)
        authStore.setToken(tokenRes.access_token)
        authStore.setUserProfile(await aurakeyApi.user.profile())
        uni.hideLoading()
        uni.navigateBack()
      } catch (error: any) {
        uni.hideLoading()
        uni.showToast({ title: error.message || '登录失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '登录失败', icon: 'none' })
    },
  })
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

.desc {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.48);
  font-size: 24rpx;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  margin-top: 44rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 96rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  background: #5660ff;
}

.agreement {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8rpx;
  color: rgba(255, 255, 255, 0.48);
  font-size: 22rpx;
}

.radio {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.56);
  border-radius: 50%;

  &.active {
    border-color: #54e9ff;
    background: #54e9ff;
    box-shadow: inset 0 0 0 7rpx #1d1e29;
  }
}

.link {
  color: #52eaff;
}
</style>
