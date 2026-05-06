<template>
  <view class="container">
    <!-- 发现页 -->
    <DiscoverView v-show="currentTab === 'discover'" />

    <!-- 创作页（实际上是个空页面，点击中间按钮弹出创作面板） -->
    <view v-show="currentTab === 'create'" class="empty-create">
      <text class="tip">点击下方创作按钮开始创作</text>
    </view>

    <!-- 我的页 -->
    <ProfileView v-show="currentTab === 'profile'" />

    <!-- 创作面板（毛玻璃抽屉） -->
    <CreatePanel v-if="isCreating" @close="hideCreatePanel" />

    <!-- 底部导航栏 -->
    <view class="custom-tabbar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'discover' }"
        @click="switchTab('discover')"
      >
        <view class="tab-icon">🔍</view>
        <text class="tab-text">发现</text>
      </view>

      <view class="tab-item tab-create" @click="showCreatePanel">
        <view class="create-btn">
          <text class="create-icon">✨</text>
        </view>
        <text class="tab-text">创作</text>
      </view>

      <view
        class="tab-item"
        :class="{ active: currentTab === 'profile' }"
        @click="switchTab('profile')"
      >
        <view class="tab-icon">👤</view>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import DiscoverView from './components/DiscoverView.vue'
import ProfileView from './components/ProfileView.vue'
import CreatePanel from './components/CreatePanel.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const currentTab = computed(() => appStore.currentTab)
const isCreating = computed(() => appStore.isCreating)

const switchTab = (tab: 'discover' | 'create' | 'profile') => {
  appStore.setTab(tab)
}

const showCreatePanel = () => {
  // 检查登录状态
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
  padding-bottom: 120rpx;
}

.empty-create {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;

  .tip {
    color: rgba(255, 255, 255, 0.3);
    font-size: 28rpx;
  }
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
  z-index: 1000;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;

    .tab-icon {
      font-size: 44rpx;
      opacity: 0.6;
      transition: all 0.3s;
    }

    .tab-text {
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s;
    }

    &.active {
      .tab-icon {
        opacity: 1;
      }

      .tab-text {
        color: #00D4FF;
      }
    }
  }

  .tab-create {
    .create-btn {
      width: 96rpx;
      height: 96rpx;
      border-radius: 48rpx;
      background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.3);

      .create-icon {
        font-size: 48rpx;
      }
    }

    .tab-text {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
