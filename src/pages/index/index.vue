<template>
  <view class="page" :class="{ locked: appLocked }">
    <TemplateView v-show="currentTab === 'template'" @create="openCreateSheet()" />
    <ProfileView v-show="currentTab === 'profile'" />

    <view class="custom-tabbar">
      <view
        v-for="tab in tabItems"
        :key="tab.name"
        class="tab-item"
        :class="{ active: currentTab === tab.name }"
        @click="switchTab(tab.name)"
      >
        <image class="tab-icon" :src="currentTab === tab.name ? tab.activeIcon : tab.icon" mode="aspectFit" />
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <CreateTaskSheet
      v-if="showCreateSheet"
      @close="showCreateSheet = false"
      @login-required="handleLoginRequired"
      @submitted="handleTaskSubmitted"
    />
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
    <view v-if="appLocked" class="startup-mask">
      <image :src="ASSETS.logoSymbol" mode="aspectFit" />
      <text>正在加载</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import { useAppStore, type TabName } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useTaskStore } from '@/stores/taskStore'
import { ASSETS } from '@/config/assets'
import CreateTaskSheet from '@/components/CreateTaskSheet.vue'
import LoginSheet from './components/LoginSheet.vue'
import TemplateView from './components/TemplateView.vue'
import ProfileView from './components/ProfileView.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const historyStore = useHistoryStore()
const taskStore = useTaskStore()
const showCreateSheet = ref(false)
const showLoginSheet = ref(false)

const currentTab = computed(() => appStore.currentTab)
const appLocked = computed(() => appStore.appInitializing || (!authStore.isLoggedIn && authStore.profileLoading))

const SHARE_CONFIG = {
  title: 'AuraKey AI 魔法师',
  path: '/pages/index/index',
  imageUrl: ASSETS.logoWordmark,
} as const

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

const openCreateSheet = () => {
  if (appLocked.value) return
  showCreateSheet.value = true
}

const handleLoginRequired = () => {
  if (appLocked.value) return
  showLoginSheet.value = true
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
}

const handleTaskSubmitted = (taskId: string) => {
  showCreateSheet.value = false
  historyStore.trackSubmittedTask(taskId, {
    prompt: taskStore.prompt || '生成中',
    model_name: taskStore.selectedModel,
    aspect_ratio: taskStore.selectedRatio,
  })
  uni.navigateTo({ url: `/pages/history/history?taskId=${taskId}` })
}

onMounted(() => {
  authStore.loadFromStorage()
})

onShareAppMessage(() => ({
  title: SHARE_CONFIG.title,
  path: SHARE_CONFIG.path,
  imageUrl: SHARE_CONFIG.imageUrl,
}))

onShareTimeline(() => ({
  title: SHARE_CONFIG.title,
  query: '',
  imageUrl: SHARE_CONFIG.imageUrl,
}))
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
