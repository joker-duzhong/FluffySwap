<template>
  <view class="recharge-webview">
    <web-view v-if="webviewUrl" :src="webviewUrl" @message="handleMessage" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi } from '@/services/aurakey'

const authStore = useAuthStore()

const webviewUrl = computed(() => {
  // const baseUrl = 'http://192.168.31.93:5173/miniapp/h5/aurakey/pricing'
  const baseUrl = 'https://tool.lxyy.fun/miniapp/h5/aurakey/pricing'

  const token = authStore.token

  if (!token) {
    return baseUrl
  }

  return `${baseUrl}#token=${encodeURIComponent(token)}`
})

const handleMessage = async (event: any) => {
  console.log('handleMessage', event)
  const messages = event.detail.data
  if (!messages || messages.length === 0) return

  const latestMessage = messages[messages.length - 1]
  const { type } = latestMessage

  if (type === 'AURAKEY_PAYMENT_SUCCESS') {
    await handlePaymentSuccess()
  } else if (type === 'AURAKEY_MEMBERSHIP_AGREEMENT_CLICK') {
    handleAgreementClick()
  }
}

const handlePaymentSuccess = async () => {
  try {
    authStore.setProfileLoading(true)
    const profile = await aurakeyApi.user.profile()
    authStore.setUserProfile(profile)
    uni.showToast({ title: '支付成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    uni.showToast({ title: error.message || '刷新用户信息失败', icon: 'none' })
  } finally {
    authStore.setProfileLoading(false)
  }
}

const handleAgreementClick = () => {
  uni.navigateTo({ url: '/pages/agreement/agreement?type=user' })
}
</script>

<style scoped lang="scss">
.recharge-webview {
  width: 100%;
  height: 100vh;
}
</style>
