<template>
  <view class="invite-page">
    <AppStatusBar />
    <AppNavBar title="邀请好友" back @back="goBack" />

    <view class="poster">
      <view class="poster-bg"></view>
      <view class="headline">
        <view class="headline-row">
          <text class="send">送你</text>
          <text class="number">10</text>
          <text class="send">枚灵感值</text>
        </view>
        <view class="swirl"></view>
      </view>
      <view class="sub-title">
        <text>体验 </text>
        <text class="brand">Image-2</text>
        <text> 引擎</text>
        <text>驱动的精准创作</text>
      </view>

      <view class="qr-card">
        <view class="user-row">
          <image class="avatar" :src="avatar" mode="aspectFill" />
          <text>{{ nickname }}</text>
        </view>
        <text class="invite-text">邀请你体验新一代创作引擎</text>
        <QrCodeGrid :value="qrValue" :size="350" />
      </view>

      <view class="steps">
        <view class="step">
          <view class="step-icon">
            <text>▤</text>
          </view>
          <text>1.扫描二维码</text>
        </view>
        <view class="dots">⋯›</view>
        <view class="step">
          <view class="step-icon">
            <text>◕</text>
          </view>
          <text>2.注册登录</text>
        </view>
        <view class="dots">⋯›</view>
        <view class="step">
          <view class="step-icon">
            <text>✦</text>
          </view>
          <text>3.获得积分</text>
        </view>
      </view>
    </view>

    <view class="actions">
      <button @click="copyInviteCode">复制邀请码</button>
      <button class="primary" @click="savePoster">保存海报</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppStatusBar from '@/components/AppStatusBar.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi, type InviteInfo } from '@/services/aurakey'
import QrCodeGrid from '@/components/QrCodeGrid.vue'

const authStore = useAuthStore()
const inviteInfo = ref<InviteInfo | null>(null)

const avatar = computed(() => authStore.userProfile?.avatar || ASSETS.defaultAvatar)
const nickname = computed(() => authStore.userProfile?.nickname || '用户昵称111')
const inviteCode = computed(() => inviteInfo.value?.invite_code || 'AURAKEY')
const qrValue = computed(() => `aurakey://invite?code=${encodeURIComponent(inviteCode.value)}`)

const goBack = () => uni.navigateBack()

const loadInviteInfo = async () => {
  try {
    inviteInfo.value = await aurakeyApi.user.inviteInfo()
  } catch (error: any) {
    uni.showToast({ title: error.message || '邀请信息加载失败', icon: 'none' })
  }
}

const copyInviteCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => uni.showToast({ title: '已复制邀请码', icon: 'success' }),
  })
}

const savePoster = () => {
  uni.showToast({ title: '海报保存能力待接入小程序画布', icon: 'none' })
}

onMounted(() => {
  loadInviteInfo()
})
</script>

<style scoped lang="scss">
.invite-page {
  min-height: 100vh;
  padding-bottom: 52rpx;
  background: #202020;
  color: #16122f;
}

.poster {
  position: relative;
  margin: 18rpx 24rpx 0;
  min-height: 1298rpx;
  border-radius: 44rpx;
  overflow: hidden;
  background: linear-gradient(155deg, #f2d7ff 0%, #fbf8ff 36%, #d9f6ff 100%);
}

.poster-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0 88%, rgba(144, 98, 255, 0.24), transparent 24%),
    radial-gradient(circle at 100% 58%, rgba(111, 160, 255, 0.2), transparent 28%);
}

.headline {
  position: relative;
  padding-top: 92rpx;
  text-align: center;
}

.headline-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
}

.send {
  color: #16122f;
  font-size: 54rpx;
  font-weight: 900;
}

.number {
  color: #965fff;
  font-size: 146rpx;
  line-height: 0.86;
  font-weight: 900;
  font-style: italic;
  text-shadow: 0 10rpx 24rpx rgba(113, 81, 255, 0.18);
}

.swirl {
  width: 620rpx;
  height: 36rpx;
  margin: -10rpx auto 0;
  border-bottom: 12rpx solid rgba(139, 97, 255, 0.65);
  border-radius: 0 0 50% 50%;
}

.sub-title {
  position: relative;
  z-index: 1;
  width: 520rpx;
  margin: 34rpx auto 0;
  color: #282044;
  font-size: 40rpx;
  line-height: 1.45;
  text-align: center;
  font-weight: 800;

  text {
    display: inline;
  }

  .brand {
    color: #8c62ff;
    font-style: italic;
  }
}

.qr-card {
  position: relative;
  z-index: 1;
  width: 554rpx;
  min-height: 620rpx;
  margin: 42rpx auto 0;
  padding: 48rpx 0;
  border-radius: 34rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 22rpx 50rpx rgba(118, 87, 182, 0.12);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  color: #8a8a91;
  font-size: 28rpx;
}

.avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
}

.invite-text {
  margin: 22rpx 0 28rpx;
  color: #b0aeb7;
  font-size: 26rpx;
}

.steps {
  position: relative;
  z-index: 1;
  margin: 42rpx 56rpx 0;
  display: grid;
  grid-template-columns: 1fr 50rpx 1fr 50rpx 1fr;
  align-items: start;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  color: #25243b;
  font-size: 24rpx;
}

.step-icon {
  width: 86rpx;
  height: 86rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9368ff;
  font-size: 42rpx;
  background: rgba(255, 255, 255, 0.58);
  border: 3rpx solid rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 0 22rpx rgba(146, 102, 255, 0.18);
}

.dots {
  padding-top: 34rpx;
  color: #9368ff;
  font-size: 38rpx;
  letter-spacing: 3rpx;
}

.actions {
  margin: 24rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;

  button {
    height: 82rpx;
    border-radius: 18rpx;
    color: #fff;
    font-size: 28rpx;
    background: rgba(255, 255, 255, 0.12);
  }

  .primary {
    background: linear-gradient(180deg, #5a64ff, #3e98ff);
  }
}
</style>
