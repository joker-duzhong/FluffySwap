<template>
  <view class="profile-view">
    <view class="top-glow"></view>
    <AppStatusBar />
    <view class="header">
      <view class="balance-pill" @click="goRecharge">
        <image :src="ASSETS.iconSpark" mode="aspectFit" />
        <text>{{ balance }}</text>
        <view class="divider"></view>
        <text>充值</text>
      </view>
      <AppCapsule />
    </view>

    <view class="profile-card">
      <view v-if="isLoggedIn" class="logged-user">
        <view class="avatar-wrap">
          <image class="avatar" :src="avatar" mode="aspectFill" />
          <view class="edit-dot">✎</view>
        </view>
        <text class="nickname">{{ nickname }}</text>
        <text class="phone">{{ phoneText }}</text>
      </view>
      <view v-else class="login-entry" @click="showLoginSheet = true">
        <image class="login-logo" :src="ASSETS.logoSymbol" mode="aspectFit" />
        <text>立即登录</text>
      </view>
    </view>

    <view class="vip-card" @click="goRecharge">
      <view>
        <text class="vip-title">会员中心·VIP</text>
        <text class="vip-desc">每月超多灵感值，限时优惠</text>
      </view>
      <view class="vip-action">立即开通</view>
    </view>

    <view class="works-section">
      <view class="section-header">
        <text>我的作品</text>
        <view class="more" @click="goHistory">
          <text>更多</text>
          <text class="chevron">›</text>
        </view>
      </view>
      <view v-if="works.length > 0" class="works-row">
        <image
          v-for="item in works.slice(0, 3)"
          :key="item.task_id"
          :src="item.image_url || ASSETS.vipHero"
          mode="aspectFill"
          @click="openWork(item.task_id)"
        />
      </view>
      <view v-else class="empty-work">
        <image :src="ASSETS.sparkLarge" mode="aspectFit" />
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goAssetLogs">
        <view class="menu-left">
          <image :src="ASSETS.iconWallet" mode="aspectFit" />
          <text>积分明细</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goInvite">
        <view class="menu-left">
          <image :src="ASSETS.iconGift" mode="aspectFit" />
          <text>邀请好友</text>
        </view>
        <view class="menu-right">
          <text>邀请好友双方各得</text>
          <text class="highlight">10积分</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="menu-item" @click="showAgreement('user')">
        <view class="menu-left">
          <text class="line-icon"></text>
          <text>用户协议</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="logout">
        <view class="menu-left">
          <image :src="ASSETS.iconLogout" mode="aspectFit" />
          <text>退出登录</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppCapsule from '@/components/AppCapsule.vue'
import AppStatusBar from '@/components/AppStatusBar.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { aurakeyApi } from '@/services/aurakey'
import LoginSheet from './LoginSheet.vue'

const authStore = useAuthStore()
const historyStore = useHistoryStore()
const showLoginSheet = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const balance = computed(() => authStore.balance)
const avatar = computed(() => authStore.userProfile?.avatar || ASSETS.defaultAvatar)
const nickname = computed(() => authStore.userProfile?.nickname || 'UserName_111')
const phoneText = computed(() => authStore.userProfile?.phone || '13143214321')
const works = computed(() => historyStore.items)

const goRecharge = () => uni.navigateTo({ url: '/pages/recharge/recharge' })
const goHistory = () => uni.navigateTo({ url: '/pages/history/history' })
const goAssetLogs = () => uni.navigateTo({ url: '/pages/asset-logs/asset-logs' })
const goInvite = () => uni.navigateTo({ url: '/pages/invite/invite' })
const openWork = (taskId: string) => uni.navigateTo({ url: `/pages/task-result/task-result?taskId=${taskId}` })

const showAgreement = (type: 'user' | 'privacy') => {
  uni.showModal({
    title: type === 'user' ? '用户协议' : '隐私政策',
    content: '请以正式协议页面内容为准。',
    showCancel: false,
  })
}

const logout = () => {
  if (!authStore.isLoggedIn) {
    showLoginSheet.value = true
    return
  }
  authStore.clearAuth()
  historyStore.reset()
  uni.showToast({ title: '已退出登录', icon: 'none' })
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
  loadData()
}

const loadData = async () => {
  if (!authStore.isLoggedIn) return
  try {
    const [profile, history] = await Promise.all([
      aurakeyApi.user.profile(),
      aurakeyApi.user.history(1, 6),
    ])
    authStore.setUserProfile(profile)
    historyStore.setItems(history.items)
  } catch (error) {
    console.error('加载我的页面失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.profile-view {
  position: relative;
  min-height: 100vh;
  background: #050506;
  padding-bottom: 166rpx;
  overflow: hidden;
}

.top-glow {
  position: absolute;
  left: 0;
  top: 0;
  width: 360rpx;
  height: 260rpx;
  background: radial-gradient(circle at 0 0, rgba(31, 111, 255, 0.22), transparent 68%);
}

.header {
  position: relative;
  z-index: 1;
  height: 82rpx;
  padding: 0 24rpx 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.balance-pill {
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: #fff;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.13);

  image {
    width: 22rpx;
    height: 22rpx;
  }

  .divider {
    width: 1rpx;
    height: 28rpx;
    background: rgba(255, 255, 255, 0.22);
  }
}

.profile-card {
  min-height: 310rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-entry,
.logged-user {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  width: 148rpx;
  height: 148rpx;
  margin-bottom: 28rpx;
  border-radius: 50%;
  box-shadow: 0 0 0 1rpx rgba(255, 255, 255, 0.16), 0 0 42rpx rgba(88, 88, 255, 0.38);
}

.login-entry text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
}

.avatar-wrap {
  position: relative;
}

.avatar {
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
}

.edit-dot {
  position: absolute;
  right: -5rpx;
  bottom: 8rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22rpx;
  background: rgba(36, 36, 44, 0.92);
  border: 2rpx solid rgba(255, 255, 255, 0.42);
}

.nickname {
  margin-top: 26rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
}

.phone {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.34);
  font-size: 24rpx;
}

.vip-card {
  height: 132rpx;
  margin: 0 34rpx 38rpx;
  padding: 30rpx 36rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(65, 76, 155, 0.8), rgba(111, 65, 109, 0.82));
  border: 1rpx solid rgba(221, 201, 255, 0.3);
}

.vip-title,
.vip-desc {
  display: block;
}

.vip-title {
  color: #eee6ff;
  font-size: 30rpx;
  font-weight: 700;
}

.vip-desc {
  margin-top: 12rpx;
  color: #c8c1e5;
  font-size: 24rpx;
}

.vip-action {
  width: 126rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #442c86;
  font-size: 24rpx;
  font-weight: 700;
  background: #eadbff;
}

.works-section {
  margin: 0 34rpx 38rpx;
}

.section-header {
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 28rpx;
}

.more {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: rgba(255, 255, 255, 0.68);
  font-size: 26rpx;
}

.chevron,
.arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 40rpx;
  line-height: 1;
}

.works-row {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;

  image {
    width: 100%;
    height: 156rpx;
    border-radius: 12rpx;
    background: #11131a;
  }
}

.empty-work {
  height: 236rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  image {
    width: 112rpx;
    height: 112rpx;
    opacity: 0.45;
  }
}

.menu-list {
  margin: 0 34rpx;
  padding: 28rpx 0;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.07);
}

.menu-item {
  height: 86rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
}

.menu-left {
  gap: 20rpx;
  color: rgba(255, 255, 255, 0.84);
  font-size: 28rpx;

  image {
    width: 30rpx;
    height: 30rpx;
  }
}

.line-icon {
  width: 24rpx;
  height: 32rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.82);
  border-radius: 3rpx;
}

.menu-right {
  gap: 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 22rpx;
}

.highlight {
  color: #52f7ff;
}
</style>
