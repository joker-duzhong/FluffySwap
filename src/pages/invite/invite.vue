<template>
  <view class="invite-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="nav-title">邀请好友</text>
      <view class="nav-btn" style="opacity: 0"></view>
    </view>

    <!-- 邀请卡片 -->
    <view class="invite-card">
      <text class="card-title">邀请好友，双方得算力</text>
      <text class="card-desc">{{ ruleText }}</text>

      <!-- 邀请码 -->
      <view class="invite-code-section">
        <text class="code-label">我的邀请码</text>
        <view class="code-box">
          <text class="code">{{ inviteCode }}</text>
          <view class="copy-btn" @click="copyInviteCode">
            <text>复制</text>
          </view>
        </view>
      </view>

      <!-- 统计数据 -->
      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-value">{{ invitedCount }}</text>
          <text class="stat-label">已邀请人数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ totalRewardPoints }}</text>
          <text class="stat-label">累计获得算力</text>
        </view>
      </view>
    </view>

    <!-- 邀请步骤 -->
    <view class="steps-section">
      <text class="section-title">邀请步骤</text>
      <view class="steps-list">
        <view class="step-item">
          <view class="step-number">1</view>
          <view class="step-content">
            <text class="step-title">分享邀请码</text>
            <text class="step-desc">将邀请码分享给好友</text>
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">2</view>
          <view class="step-content">
            <text class="step-title">好友注册</text>
            <text class="step-desc">好友使用邀请码注册</text>
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">3</view>
          <view class="step-content">
            <text class="step-title">双方得算力</text>
            <text class="step-desc">双方各得 50 点算力奖励</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 输入邀请码 -->
    <view v-if="!hasBoundInvite" class="bind-section">
      <text class="section-title">输入邀请码</text>
      <view class="bind-card">
        <input
          v-model="inputInviteCode"
          class="invite-input"
          placeholder="请输入好友的邀请码"
          maxlength="6"
        />
        <button class="bind-btn" @click="handleBindInvite">
          <text>绑定</text>
        </button>
      </view>
      <text class="bind-tip">每个账号只能绑定一次邀请码</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { client } from '@/services/uniClient'

const inviteCode = ref('')
const invitedCount = ref(0)
const totalRewardPoints = ref(0)
const ruleText = ref('每邀请1位新用户注册，双方各得 50 点算力')
const hasBoundInvite = ref(false)
const inputInviteCode = ref('')

const goBack = () => {
  uni.navigateBack()
}

const copyInviteCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '邀请码已复制', icon: 'success' })
    },
  })
}

const handleBindInvite = async () => {
  if (!inputInviteCode.value.trim()) {
    uni.showToast({ title: '请输入邀请码', icon: 'none' })
    return
  }

  if (inputInviteCode.value === inviteCode.value) {
    uni.showToast({ title: '不能绑定自己的邀请码', icon: 'none' })
    return
  }

  try {
    const res = await client.POST('/aurakey/user/bind-invite', {
      body: {
        invite_code: inputInviteCode.value,
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      const { is_success, reward_points } = res.data.data
      if (is_success) {
        uni.showToast({
          title: `绑定成功！获得 ${reward_points} 算力`,
          icon: 'success',
        })
        hasBoundInvite.value = true
        inputInviteCode.value = ''
      } else {
        uni.showToast({ title: '绑定失败，请检查邀请码', icon: 'none' })
      }
    }
  } catch (error: any) {
    console.error('绑定邀请码失败:', error)
    uni.showToast({ title: error.message || '绑定失败', icon: 'none' })
  }
}

const loadInviteInfo = async () => {
  try {
    const res = await client.GET('/aurakey/user/invite-info')
    if (res.data?.code === 200 && res.data.data) {
      const { invite_code, invited_count, total_reward_points, rule_text } = res.data.data
      inviteCode.value = invite_code
      invitedCount.value = invited_count
      totalRewardPoints.value = total_reward_points
      if (rule_text) ruleText.value = rule_text
    }
  } catch (error) {
    console.error('加载邀请信息失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onMounted(() => {
  loadInviteInfo()
})
</script>

<style scoped lang="scss">
.invite-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 32rpx;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 32rpx;
  padding-right: 32rpx;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20rpx);
  z-index: 100;

  .nav-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 32rpx;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #fff;
  }

  .nav-title {
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
  }
}

.invite-card {
  margin-top: calc(88rpx + env(safe-area-inset-top) + 32rpx);
  margin-left: 32rpx;
  margin-right: 32rpx;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(181, 55, 255, 0.1) 100%);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;

  .card-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    text-align: center;
    margin-bottom: 16rpx;
  }

  .card-desc {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    margin-bottom: 32rpx;
  }

  .invite-code-section {
    margin-bottom: 32rpx;

    .code-label {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      margin-bottom: 16rpx;
    }

    .code-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24rpx;

      .code {
        font-size: 56rpx;
        font-weight: bold;
        color: #fff;
        letter-spacing: 8rpx;
        font-family: 'Courier New', monospace;
      }

      .copy-btn {
        padding: 12rpx 24rpx;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 24rpx;
        font-size: 24rpx;
        color: #00D4FF;
      }
    }
  }

  .stats-section {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-top: 32rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.1);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .stat-value {
        font-size: 48rpx;
        font-weight: bold;
        background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .stat-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.steps-section,
.bind-section {
  margin-top: 48rpx;
  padding: 0 32rpx;

  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 24rpx;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 24rpx;

      .step-number {
        width: 64rpx;
        height: 64rpx;
        border-radius: 32rpx;
        background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        font-weight: bold;
        color: #fff;
        flex-shrink: 0;
      }

      .step-content {
        flex: 1;
        padding-top: 8rpx;

        .step-title {
          display: block;
          font-size: 28rpx;
          color: #fff;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .step-desc {
          display: block;
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }

  .bind-card {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;

    .invite-input {
      flex: 1;
      height: 88rpx;
      padding: 0 24rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      font-size: 32rpx;
      color: #fff;
      text-align: center;
      letter-spacing: 4rpx;
    }

    .bind-btn {
      width: 160rpx;
      height: 88rpx;
      background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
      border-radius: 16rpx;
      border: none;
      font-size: 28rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  .bind-tip {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
  }
}
</style>
