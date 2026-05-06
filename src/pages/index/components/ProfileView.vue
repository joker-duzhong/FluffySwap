<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image :src="userAvatar" class="avatar" />
        <view class="info">
          <view class="name-row">
            <text class="nickname">{{ userNickname }}</text>
            <view v-if="isVip" class="vip-badge">
              <text>👑 {{ vipType }}</text>
            </view>
          </view>
          <text class="motto">用 AI，创造无限可能 ✨</text>
        </view>
      </view>
    </view>

    <!-- 资产中心 -->
    <view class="asset-card">
      <view class="asset-header">
        <text class="title">资产中心</text>
        <view class="icon">👁️</view>
      </view>
      <view class="balance-section">
        <view class="balance-info">
          <text class="label">当前剩余：</text>
          <text class="value">{{ balance }}</text>
          <text class="unit">算力</text>
        </view>
        <button class="recharge-btn" @click="goRecharge">
          <text>充值/升级</text>
        </button>
      </view>
    </view>

    <!-- 我的画廊预览 -->
    <view class="gallery-preview">
      <view class="section-header">
        <text class="title">我的画廊</text>
        <view class="more" @click="goHistory">
          <text>管理</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view v-if="historyItems.length > 0" class="preview-grid">
        <image
          v-for="item in historyItems.slice(0, 6)"
          :key="item.task_id"
          :src="item.image_url"
          class="preview-item"
          mode="aspectFill"
          @click="goHistory"
        />
      </view>
      <view v-else class="empty-gallery">
        <text class="empty-text">还没有作品，快去创作吧～</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="goAssetLogs">
        <view class="menu-left">
          <text class="menu-icon">📊</text>
          <text class="menu-text">算力明细</text>
        </view>
        <view class="menu-right">
          <text class="menu-desc">查看消费充值记录</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="menu-item" @click="goInvite">
        <view class="menu-left">
          <text class="menu-icon">🎁</text>
          <text class="menu-text">邀请好友</text>
        </view>
        <view class="menu-right">
          <text class="menu-desc">邀请得算力</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="menu-item" @click="handleSignIn">
        <view class="menu-left">
          <text class="menu-icon">📅</text>
          <text class="menu-text">每日签到</text>
        </view>
        <view class="menu-right">
          <text class="menu-desc">{{ signInText }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="menu-item" @click="contactService">
        <view class="menu-left">
          <text class="menu-icon">💬</text>
          <text class="menu-text">联系客服</text>
        </view>
        <view class="menu-right">
          <text class="menu-desc">在线客服/问题反馈</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于我们</text>
        </view>
        <view class="menu-right">
          <text class="menu-desc">版本信息及免责声明</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { client } from '@/services/uniClient'

const authStore = useAuthStore()
const historyStore = useHistoryStore()

const userAvatar = computed(() => authStore.userProfile?.avatar || '/static/default-avatar.png')
const userNickname = computed(() => authStore.userProfile?.nickname || '未登录')
const isVip = computed(() => authStore.isVip)
const vipType = computed(() => authStore.userProfile?.type || '普通会员')
const balance = computed(() => authStore.balance)
const historyItems = computed(() => historyStore.items)

const signInText = ref('签到领算力')
const hasSignedToday = ref(false)

const goRecharge = () => {
  uni.navigateTo({ url: '/pages/recharge/recharge' })
}

const goHistory = () => {
  uni.navigateTo({ url: '/pages/history/history' })
}

const goAssetLogs = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const goInvite = () => {
  uni.navigateTo({ url: '/pages/invite/invite' })
}

const handleSignIn = async () => {
  if (hasSignedToday.value) {
    uni.showToast({ title: '今日已签到', icon: 'none' })
    return
  }

  try {
    const res = await client.POST('/aurakey/user/sign-in')
    if (res.data?.code === 200 && res.data.data) {
      const { reward_points, continuous_days } = res.data.data
      hasSignedToday.value = true
      signInText.value = '今日已签到'

      uni.showToast({
        title: `签到成功！获得 ${reward_points} 算力`,
        icon: 'success',
      })

      // 更新余额
      authStore.updateBalance(balance.value + reward_points)
    }
  } catch (error: any) {
    if (error.message?.includes('已签到')) {
      hasSignedToday.value = true
      signInText.value = '今日已签到'
    }
    uni.showToast({ title: error.message || '签到失败', icon: 'none' })
  }
}

const contactService = () => {
  uni.showModal({
    title: '联系客服',
    content: '请添加客服微信：aurakey_service',
    showCancel: false,
  })
}

const showAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: 'AI 魔法师 v1.0.0\n\n本应用使用 AI 技术生成图像，生成内容仅供参考。',
    showCancel: false,
  })
}

// 加载用户信息和历史记录
const loadUserData = async () => {
  try {
    // 加载用户信息
    const profileRes = await client.GET('/aurakey/user/profile')
    if (profileRes.data?.code === 200 && profileRes.data.data) {
      authStore.setUserProfile(profileRes.data.data)
    }

    // 加载历史记录（前6条）
    const historyRes = await client.GET('/aurakey/user/history', {
      params: {
        query: {
          page: 1,
          pageSize: 6,
        },
      },
    })
    if (historyRes.data?.code === 200 && historyRes.data.data) {
      historyStore.setItems(historyRes.data.data.items || [])
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    loadUserData()
  }
})
</script>

<style scoped lang="scss">
.profile-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
  padding: 80rpx 32rpx 32rpx;
}

.user-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .user-info {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      border: 4rpx solid rgba(0, 212, 255, 0.3);
    }

    .info {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 12rpx;

        .nickname {
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
        }

        .vip-badge {
          padding: 4rpx 12rpx;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 8rpx;
          font-size: 20rpx;
          color: #000;
          font-weight: bold;
        }
      }

      .motto {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

.asset-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .asset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .title {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }

    .icon {
      font-size: 32rpx;
    }
  }

  .balance-section {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .balance-info {
      display: flex;
      align-items: baseline;
      gap: 8rpx;

      .label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }

      .value {
        font-size: 56rpx;
        font-weight: bold;
        background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .unit {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .recharge-btn {
      padding: 16rpx 32rpx;
      background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
      border-radius: 24rpx;
      border: none;
      font-size: 28rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

.gallery-preview {
  margin-bottom: 24rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }

    .more {
      display: flex;
      align-items: center;
      gap: 4rpx;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);

      .arrow {
        font-size: 32rpx;
      }
    }
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;

    .preview-item {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12rpx;
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .empty-gallery {
    padding: 80rpx 0;
    text-align: center;

    .empty-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.menu-list {
  .menu-item {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20rpx);
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .menu-left {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .menu-icon {
        font-size: 40rpx;
      }

      .menu-text {
        font-size: 28rpx;
        color: #fff;
      }
    }

    .menu-right {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .menu-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.4);
      }

      .arrow {
        font-size: 32rpx;
        color: rgba(255, 255, 255, 0.3);
      }
    }
  }
}
</style>
