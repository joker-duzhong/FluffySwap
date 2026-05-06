<template>
  <view class="container">
    <DiscoverView v-show="currentTab === 'discover'" />
    <DiscoverView v-show="currentTab === 'create'" />
    <WorksView v-show="currentTab === 'works'" />
    <ProfileView v-show="currentTab === 'profile'" />

    <CreatePanel v-if="isCreating" @close="hideCreatePanel" />

    <view class="custom-tabbar">
      <view
        v-for="tab in tabItems"
        :key="tab.name"
        class="tab-item"
        :class="{ active: currentTab === tab.name, 'tab-create': tab.name === 'create' }"
        @click="handleTabClick(tab.name)"
      >
        <view v-if="tab.name === 'create'" class="create-btn">
          <AuraIcon name="create" :size="58" glow />
        </view>
        <view v-else class="icon-wrap">
          <AuraIcon :name="tab.icon" :size="44" :glow="currentTab === tab.name" />
        </view>
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AuraIcon from '@/components/AuraIcon.vue'
import { useAppStore, type TabName } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import type { AuraIconName } from '@/config/icons'
import DiscoverView from './components/DiscoverView.vue'
import WorksView from './components/WorksView.vue'
import ProfileView from './components/ProfileView.vue'
import CreatePanel from './components/CreatePanel.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const currentTab = computed(() => appStore.currentTab)
const isCreating = computed(() => appStore.isCreating)

const tabItems: Array<{ name: TabName; label: string; icon: AuraIconName }> = [
  { name: 'discover', label: '发现', icon: 'discover' },
  { name: 'create', label: '创作', icon: 'create' },
  { name: 'works', label: '作品', icon: 'works' },
  { name: 'profile', label: '我的', icon: 'profile' },
]

const switchTab = (tab: TabName) => {
  appStore.setTab(tab)
}

const handleTabClick = (tab: TabName) => {
  if (tab === 'create') {
    switchTab('create')
    showCreatePanel()
    return
  }
  switchTab(tab)
}

const showCreatePanel = () => {
  if (!authStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  appStore.showCreatePanel()
}

const hideCreatePanel = () => {
  appStore.hideCreatePanel()
}

// 页面加载时从本地存储恢复用户信息
onMounted(() => {
  authStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 138rpx;
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 124rpx;
  background: rgba(20, 22, 29, 0.82);
  backdrop-filter: blur(32rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: calc(8rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
  box-shadow: 0 -18rpx 50rpx rgba(0, 0, 0, 0.35);

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9rpx;

    .icon-wrap {
      opacity: 0.6;
      transform: translateY(0);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .tab-text {
      font-size: 21rpx;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s;
    }

    &.active {
      .icon-wrap {
        opacity: 1;
        transform: translateY(-2rpx);
      }

      .tab-text {
        color: #DFF4FF;
      }
    }
  }

  .tab-create {
    transform: translateY(-12rpx);

    .create-btn {
      width: 104rpx;
      height: 104rpx;
      border-radius: 52rpx;
      background: radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.3), transparent 34%),
        linear-gradient(135deg, #14B8FF 0%, #8B5CF6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 8rpx rgba(255, 255, 255, 0.06), 0 14rpx 36rpx rgba(20, 184, 255, 0.34);
    }

    .tab-text {
      color: rgba(255, 255, 255, 0.78);
    }
  }
}
</style>
