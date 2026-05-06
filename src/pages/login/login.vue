<template>
  <view class="login-container">
    <!-- Logo 和标题 -->
    <view class="header">
      <text class="logo">✨</text>
      <text class="title">AI 魔法师</text>
      <text class="subtitle">用 AI，创造无限可能</text>
    </view>

    <!-- 登录按钮 -->
    <view class="login-section">
      <button class="login-btn" @click="handleWechatLogin">
        <text class="btn-text">微信一键登录</text>
      </button>
      <text class="agreement">
        登录即表示同意
        <text class="link" @click="showAgreement('user')">《用户协议》</text>
        和
        <text class="link" @click="showAgreement('privacy')">《隐私政策》</text>
      </text>
    </view>

    <!-- 装饰元素 -->
    <view class="decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { WECHAT_CONFIG } from '@/config'
import { client } from '@/services/uniClient'

const authStore = useAuthStore()

const handleWechatLogin = () => {
  uni.showLoading({ title: '登录中...' })

  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      try {
        // 调用后端登录接口
        const res = await client.POST('/auth/miniapp/login', {
          body: {
            appid: WECHAT_CONFIG.APPID,
            code: loginRes.code,
          },
        })

        if (res.data?.code === 200 && res.data.data) {
          const { access_token } = res.data.data
          authStore.setToken(access_token)

          // 获取用户信息
          await loadUserProfile()

          uni.hideLoading()
          uni.showToast({ title: '登录成功', icon: 'success' })

          // 返回上一页或跳转到首页
          setTimeout(() => {
            const pages = getCurrentPages()
            if (pages.length > 1) {
              uni.navigateBack()
            } else {
              uni.reLaunch({ url: '/pages/index/index' })
            }
          }, 1000)
        } else {
          throw new Error(res.data?.message || '登录失败')
        }
      } catch (error: any) {
        uni.hideLoading()
        console.error('登录失败:', error)
        uni.showToast({ title: error.message || '登录失败', icon: 'none' })
      }
    },
    fail: (err) => {
      uni.hideLoading()
      console.error('微信登录失败:', err)
      uni.showToast({ title: '登录失败', icon: 'none' })
    },
  })
}

const loadUserProfile = async () => {
  try {
    const res = await client.GET('/aurakey/user/profile')
    if (res.data?.code === 200 && res.data.data) {
      authStore.setUserProfile(res.data.data)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const showAgreement = (type: 'user' | 'privacy') => {
  const title = type === 'user' ? '用户协议' : '隐私政策'
  const content = type === 'user'
    ? '这里是用户协议内容...'
    : '这里是隐私政策内容...'

  uni.showModal({
    title,
    content,
    showCancel: false,
  })
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 64rpx;
  position: relative;
  overflow: hidden;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 120rpx;

  .logo {
    font-size: 160rpx;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20rpx);
    }
  }

  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

.login-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;

  .login-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
    border-radius: 48rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.3);

    .btn-text {
      font-size: 32rpx;
      font-weight: 500;
      color: #fff;
    }
  }

  .agreement {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    line-height: 1.6;

    .link {
      color: #00D4FF;
    }
  }
}

.decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;

    &.circle-1 {
      width: 400rpx;
      height: 400rpx;
      top: 10%;
      left: -100rpx;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 300rpx;
      height: 300rpx;
      bottom: 20%;
      right: -80rpx;
      animation-delay: 1s;
    }

    &.circle-3 {
      width: 200rpx;
      height: 200rpx;
      top: 50%;
      right: 10%;
      animation-delay: 2s;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.5;
    }
  }
}
</style>
