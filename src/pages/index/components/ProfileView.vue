<template>
  <view class="profile-view">
    <view class="top-glow"></view>
    <AppTopNav>
      <template #left>
        <view class="balance-pill" @click="goRecharge">
          <image :src="ASSETS.iconSpark" mode="aspectFit" />
          <text>{{ balance }}</text>
          <view class="divider"></view>
          <text>充值</text>
        </view>
      </template>
    </AppTopNav>

    <view class="profile-card" :class="{ guest: !isLoggedIn }">
      <view v-if="isLoggedIn" class="logged-user">
        <view class="avatar-wrap" @click="showEditSheet = true">
          <image class="avatar" :src="avatar" mode="aspectFill" />
          <view class="edit-dot">✎</view>
        </view>
        <text class="nickname">{{ nickname }}</text>
        <text class="phone">{{ phoneText }}</text>
      </view>
      <view v-else class="login-entry" @click="openLoginSheet">
        <image class="login-logo" :src="ASSETS.logoSymbol" mode="aspectFit" />
        <text>立即登录</text>
      </view>
    </view>

    <view class="vip-card" @click="goRecharge">
      <view>
        <text class="vip-title">{{ vipTitle }}</text>
        <text class="vip-desc">{{ vipDesc }}</text>
      </view>
      <view class="vip-action">{{ vipActionText }}</view>
    </view>

    <view class="works-section">
      <view class="section-header">
        <text>我的作品</text>
        <view class="more" @click="goHistory">
          <text>更多</text>
          <text class="chevron">›</text>
        </view>
      </view>
      <PageSkeleton v-if="worksLoading" variant="grid" :rows="3" />
      <view v-else-if="works.length > 0" class="works-row">
        <view
          v-for="item in works.slice(0, 3)"
          :key="item.task_id"
          class="work-preview"
          @click="openWork(item.task_id)"
        >
          <image v-if="item.image_url" :src="item.image_url" mode="aspectFill" />
          <view v-else class="work-placeholder" :class="{ polling: historyStore.isRunningItem(item.task_id) }">
            <text>{{ progressText(item) }}</text>
          </view>
        </view>
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
          <text class="highlight">{{ inviteRewardPoints }}积分</text>
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
    <ProfileEditSheet
      v-if="showEditSheet"
      :nickname="nickname"
      :avatar="avatar"
      @close="showEditSheet = false"
      @saved="handleProfileSaved"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import ProfileEditSheet from '@/components/ProfileEditSheet.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useHistoryStore } from '@/stores/historyStore'
import { aurakeyApi, type TaskHistoryItem } from '@/services/aurakey'
import LoginSheet from './LoginSheet.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const historyStore = useHistoryStore()
const showLoginSheet = ref(false)
const showEditSheet = ref(false)
const worksLoading = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const balance = computed(() => authStore.balance)
const avatar = computed(() => authStore.userProfile?.avatar || ASSETS.defaultAvatar)
const nickname = computed(() => authStore.userProfile?.nickname || 'UserName_111')
const phoneText = computed(() => authStore.userProfile?.phone || '13143214321')
const works = computed(() => historyStore.items)
const inviteRewardPoints = computed(() => appStore.inviteRewardPoints)
const vipTitle = computed(() => authStore.isVip ? authStore.membershipType : '会员中心·VIP')
const vipDesc = computed(() => {
  if (!authStore.isVip) return '每月超多灵感值，限时优惠'
  if (!authStore.vipExpireTime) return '会员权益生效中'
  return `有效期至 ${formatExpireDate(authStore.vipExpireTime)}`
})
const vipActionText = computed(() => authStore.isVip ? '续费' : '立即开通')

const goRecharge = () => uni.navigateTo({ url: '/pages/recharge/recharge' })
const goHistory = () => uni.navigateTo({ url: '/pages/history/history' })
const goAssetLogs = () => uni.navigateTo({ url: '/pages/asset-logs/asset-logs' })
const goInvite = () => uni.navigateTo({ url: '/pages/invite/invite' })
const openWork = (taskId: string) => uni.navigateTo({ url: `/pages/task-result/task-result?taskId=${taskId}` })

const formatExpireDate = (timestamp: number) => {
  const milliseconds = timestamp > 100000000000 ? timestamp : timestamp * 1000
  const date = new Date(milliseconds)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
}

const statusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '排队中',
    processing: '生成中',
    failed: '生成失败',
  }
  return map[status] || '暂无预览'
}

const progressText = (item: TaskHistoryItem) => {
  if (historyStore.isRunningItem(item.task_id)) return `${item.progress || historyStore.pollingProgress || 1}% AI绘图中...`
  return statusText(item.status)
}

const showAgreement = (type: 'user' | 'privacy') => {
  uni.navigateTo({ url: `/pages/agreement/agreement?type=${type}` })
}

const openLoginSheet = () => {
  if (authStore.profileLoading) return
  showLoginSheet.value = true
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

const handleProfileSaved = () => {
  showEditSheet.value = false
  loadData()
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

const loadData = async () => {
  if (appStore.appInitializing || !authStore.isLoggedIn || authStore.profileLoading || worksLoading.value) return
  worksLoading.value = historyStore.items.length === 0
  authStore.setProfileLoading(true)
  try {
    const [profile] = await Promise.all([
      aurakeyApi.user.profile(),
      historyStore.loadHistory({ reset: true }),
    ])
    authStore.setUserProfile(profile)
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载我的页面失败', icon: 'none' })
  } finally {
    authStore.setProfileLoading(false)
    worksLoading.value = false
  }
}

onMounted(() => {
  uni.$on('auth:login-required', handleLoginRequired)
  loadData()
})

watch(
  () => [appStore.currentTab, appStore.appInitializing, authStore.isLoggedIn],
  () => {
    if (appStore.currentTab === 'profile' && !appStore.appInitializing) {
      loadData()
    }
  },
)

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})
</script>

<style scoped lang="scss">
.profile-view {
  position: relative;
  height: 100vh;
  background: #050506;
  padding-bottom: calc(136rpx + env(safe-area-inset-bottom));
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

.balance-pill {
  height: 56rpx;
  padding: 0 20rpx;
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
  min-height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.guest {
    min-height: 336rpx;
  }
}

.login-entry,
.logged-user {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  width: 152rpx;
  height: 152rpx;
  margin-bottom: 30rpx;
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
  width: 134rpx;
  height: 134rpx;
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
  margin-top: 24rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 44rpx;
}

.phone {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.34);
  font-size: 24rpx;
  line-height: 32rpx;
}

.vip-card {
  position: relative;
  height: 132rpx;
  margin: 0 28rpx 34rpx;
  padding: 28rpx 38rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(65, 74, 142, 0.86) 0%, rgba(75, 53, 108, 0.88) 58%, rgba(117, 67, 109, 0.9) 100%);
  border: 1rpx solid rgba(221, 201, 255, 0.3);

  &::after {
    content: '';
    position: absolute;
    right: 92rpx;
    top: -42rpx;
    width: 160rpx;
    height: 220rpx;
    transform: rotate(42deg);
    background: rgba(255, 255, 255, 0.06);
  }
}

.vip-title,
.vip-desc {
  display: block;
}

.vip-title {
  color: #eee6ff;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.vip-desc {
  margin-top: 8rpx;
  color: #c8c1e5;
  font-size: 24rpx;
  line-height: 34rpx;
}

.vip-action {
  position: relative;
  z-index: 1;
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
  margin: 0 28rpx 34rpx;
}

.section-header {
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 28rpx;
  line-height: 38rpx;
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

.works-row,
.works-section :deep(.page-skeleton.grid) {
  margin-top: 18rpx;
}

.works-section :deep(.page-skeleton) {
  padding: 18rpx 0 0;
}

.works-section :deep(.skeleton-row) {
  height: 220rpx;
  border-radius: 12rpx;
}

.works-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.work-preview {
  height: 220rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #11131a;

  image {
    width: 100%;
    height: 220rpx;
    display: block;
  }
}

.work-placeholder {
  width: 100%;
  height: 100%;
  padding: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.46);
  font-size: 22rpx;
  line-height: 30rpx;
  text-align: center;

  &.polling {
    align-items: flex-start;
    justify-content: flex-end;
    text-align: left;
    background: linear-gradient(135deg, #26262c, #1a1a20);
  }
}

.empty-work {
  height: 220rpx;
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
  margin: 0 28rpx;
  padding: 22rpx 0;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.065);
}

.menu-item {
  height: 82rpx;
  padding: 0 34rpx;
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
  line-height: 38rpx;

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
  line-height: 32rpx;
}

.highlight {
  color: #52f7ff;
}
</style>
