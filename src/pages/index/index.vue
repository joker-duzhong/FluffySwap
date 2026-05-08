<template>
  <view class="page">
    <TemplateView v-show="currentTab === 'template'" />
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
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore, type TabName } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { ASSETS } from '@/config/assets'
import TemplateView from './components/TemplateView.vue'
import ProfileView from './components/ProfileView.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const currentTab = computed(() => appStore.currentTab)

const tabItems: Array<{ name: TabName; label: string; icon: string; activeIcon: string }> = [
  {
    name: 'template',
    label: '模板',
    icon: ASSETS.tabTemplateInactive,
    activeIcon: ASSETS.tabTemplateActive,
  },
  {
    name: 'profile',
    label: '我的',
    icon: ASSETS.tabProfileInactive,
    activeIcon: ASSETS.tabProfileActive,
  },
]

const switchTab = (tab: TabName) => {
  appStore.setTab(tab)
}

onMounted(() => {
  authStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background: #050506;
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(122rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(17, 18, 22, 0.92);
  backdrop-filter: blur(28rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 -16rpx 52rpx rgba(0, 0, 0, 0.48);

  .tab-item {
    width: 230rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;

    .tab-text {
      font-size: 24rpx;
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
  width: 46rpx;
  height: 46rpx;
}
</style>
