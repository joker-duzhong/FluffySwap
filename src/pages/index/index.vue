<template>
  <view class="page" :class="{ locked: appLocked }">
    <view v-if="appLocked" class="startup-mask">
      <image :src="ASSETS.logoSymbol" mode="aspectFit" />
      <text>正在加载</text>
    </view>
    <template v-else>
      <TemplateView v-show="currentTab === 'template'" @create="openCreatePage()" />
      <ProfileView v-show="currentTab === 'profile'" />
    </template>
    <view class="custom-tabbar">
      <view v-for="tab in tabItems" :key="tab.name" class="tab-item" :class="{ active: currentTab === tab.name }"
        @click="switchTab(tab.name)">
        <image class="tab-icon" :src="currentTab === tab.name ? tab.activeIcon : tab.icon" mode="aspectFit" />
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAppStore, type TabName } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useInviteStore } from '@/stores/inviteStore'
import { ASSETS } from '@/config/assets'
import { handleMiniProgramEntryQuery } from '@/utils/miniProgramEntry'
import LoginSheet from './components/LoginSheet.vue'
import TemplateView from './components/TemplateView.vue'
import ProfileView from './components/ProfileView.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const inviteStore = useInviteStore()
const showLoginSheet = ref(false)

const currentTab = computed(() => appStore.currentTab)
const appLocked = computed(() => appStore.appInitializing || (!authStore.isLoggedIn && authStore.profileLoading))

const SHARE_CONFIG = () => ({
  title: '灵钥(AuraKey) AI',
  path: '/pages/index/index',
  imageUrl: appStore.customJSON?.miniapp_share_cover || "",
} as const)

const tabItems: Array<{ name: TabName; label: string; icon: string; activeIcon: string }> = [
  {
    name: 'template',
    label: '模板',
    icon: ASSETS.tabTemplateActive,
    activeIcon: ASSETS.tabTemplateInactive,
  },
  {
    name: 'profile',
    label: '我的',
    icon: ASSETS.tabProfileActive,
    activeIcon: ASSETS.tabProfileInactive,
  },
]

const switchTab = (tab: TabName) => {
  if (appLocked.value) return
  appStore.setTab(tab)
}

const openCreatePage = () => {
  if (appLocked.value) return
  uni.navigateTo({ url: '/pages/history/record?openCreate=1' })
}

const syncInviteEntry = (query?: Record<string, unknown>) => {
  const handledEntry = handleMiniProgramEntryQuery(query)
  if (handledEntry && !authStore.hasPhone) {
    showLoginSheet.value = true
  }
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

onMounted(() => {
  authStore.loadFromStorage()
  uni.$on('auth:login-required', handleLoginRequired)
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})

onLoad((query) => {
  syncInviteEntry(query)
})

onShow(() => {
  if (inviteStore.hasPendingInvite && !authStore.hasPhone) {
    showLoginSheet.value = true
  }

  console.log('App Show', SHARE_CONFIG());
})

watch(
  () => [inviteStore.hasPendingInvite, authStore.hasPhone, authStore.profileLoading, appStore.appInitializing],
  ([hasPendingInvite, hasPhone, profileLoading, appInitializing]) => {
    if (hasPhone) {
      showLoginSheet.value = false
      inviteStore.discardPendingInviteForBoundUser()
      return
    }

    if (hasPendingInvite && !profileLoading && !appInitializing) {
      showLoginSheet.value = true
    }
  },
  { immediate: true },
)

onShareAppMessage(() => {
  return SHARE_CONFIG()
})

onShareTimeline(() => {
  const data = SHARE_CONFIG();
  return {
    title: data.title,
    query: '',
    imageUrl: data.imageUrl,
  }
})
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #050506;

  &.locked {
    pointer-events: none;
  }
}

.startup-mask {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  color: rgba(255, 255, 255, 0.78);
  font-size: 26rpx;
  background: #050506;
  pointer-events: auto;

  image {
    width: 110rpx;
    height: 110rpx;
  }
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(110rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 34rpx 34rpx 0 0;
  background: rgba(18, 19, 22, 0.74);
  backdrop-filter: blur(38rpx);
  -webkit-backdrop-filter: blur(38rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1000;
  box-shadow: 0 -22rpx 60rpx rgba(0, 0, 0, 0.56), inset 0 1rpx 0 rgba(255, 255, 255, 0.08);

  .tab-item {
    width: 180rpx;
    height: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6rpx;

    .tab-text {
      font-size: 22rpx;
      line-height: 30rpx;
      color: rgba(255, 255, 255, 0.64);
    }

    &.active {
      .tab-text {
        color: #fff;
      }
    }
  }
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
}
</style>
