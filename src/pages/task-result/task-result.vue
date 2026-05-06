<template>
  <view class="result-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="nav-title">{{ navTitle }}</text>
      <view class="nav-btn" style="opacity: 0"></view>
    </view>

    <!-- 生成中状态 -->
    <view v-if="isGenerating" class="generating-section">
      <!-- 流光骨架屏 -->
      <view class="skeleton-image">
        <view class="shimmer"></view>
      </view>

      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress }}%</text>
      </view>

      <!-- 动态提示 -->
      <view class="tips-section">
        <text class="tip-text">{{ currentTip }}</text>
      </view>
    </view>

    <!-- 生成失败 -->
    <view v-else-if="isFailed" class="failed-section">
      <text class="failed-icon">😢</text>
      <text class="failed-title">生成失败</text>
      <text class="failed-reason">{{ failedReason }}</text>
      <button class="retry-btn" @click="goBack">
        <text>返回重试</text>
      </button>
    </view>

    <!-- 生成成功 -->
    <view v-else-if="isSuccess" class="success-section">
      <!-- 图片展示 -->
      <view class="image-wrapper">
        <image
          :src="imageUrl"
          mode="widthFix"
          class="result-image"
          @click="previewImage"
        />
      </view>

      <!-- 操作按钮 -->
      <view class="actions-section">
        <view class="action-row">
          <button class="action-btn secondary" @click="handleDownload">
            <text class="btn-icon">⬇️</text>
            <text class="btn-text">保存</text>
            <text class="btn-desc">{{ isVip ? '高清无水印' : '带水印' }}</text>
          </button>
          <button class="action-btn secondary" @click="handleRegenerate">
            <text class="btn-icon">🔄</text>
            <text class="btn-text">重新生成</text>
            <text class="btn-desc">再抽一张</text>
          </button>
        </view>

        <button class="action-btn primary" @click="handleShare">
          <text class="btn-text">📤 生成分享海报</text>
        </button>

        <button class="action-btn outline" @click="handlePublish">
          <text class="btn-text">发布到广场</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { LOADING_TIPS } from '@/config'
import { client } from '@/services/uniClient'

const authStore = useAuthStore()

const taskId = ref('')
const status = ref<'pending' | 'processing' | 'success' | 'failed'>('pending')
const progress = ref(0)
const imageUrl = ref('')
const failedReason = ref('')
const currentTip = ref('')

let pollTimer: any = null
let tipTimer: any = null

const isGenerating = computed(() => status.value === 'pending' || status.value === 'processing')
const isSuccess = computed(() => status.value === 'success')
const isFailed = computed(() => status.value === 'failed')
const isVip = computed(() => authStore.isVip)

const navTitle = computed(() => {
  if (isGenerating.value) return 'AI 正在创作中'
  if (isSuccess.value) return '生成成功'
  if (isFailed.value) return '生成失败'
  return ''
})

const goBack = () => {
  uni.navigateBack()
}

const previewImage = () => {
  if (imageUrl.value) {
    uni.previewImage({
      urls: [imageUrl.value],
      current: 0,
    })
  }
}

const handleDownload = () => {
  if (!imageUrl.value) return

  uni.showLoading({ title: '保存中...' })
  uni.downloadFile({
    url: imageUrl.value,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading()
            uni.showToast({ title: '保存成功', icon: 'success' })
          },
          fail: () => {
            uni.hideLoading()
            uni.showToast({ title: '保存失败，请授权相册权限', icon: 'none' })
          },
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    },
  })
}

const handleRegenerate = () => {
  uni.showModal({
    title: '重新生成',
    content: '将消耗算力重新生成一张图片，是否继续？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '功能开发中', icon: 'none' })
      }
    },
  })
}

const handleShare = () => {
  uni.showToast({ title: '分享海报功能开发中', icon: 'none' })
}

const handlePublish = async () => {
  try {
    const res = await client.POST('/aurakey/user/history/{task_id}/publish', {
      params: {
        path: {
          task_id: taskId.value,
        },
      },
    })

    if (res.data?.code === 200) {
      uni.showToast({ title: '发布成功', icon: 'success' })
    }
  } catch (error) {
    console.error('发布失败:', error)
    uni.showToast({ title: '发布失败', icon: 'none' })
  }
}

// 轮询任务状态
const pollTaskStatus = async () => {
  try {
    const res = await client.GET('/aurakey/task/status/{task_id}', {
      params: {
        path: {
          task_id: taskId.value,
        },
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      const { status: taskStatus, progress: taskProgress, image_url, failed_reason } = res.data.data

      status.value = taskStatus
      progress.value = taskProgress || 0

      if (taskStatus === 'success' && image_url) {
        imageUrl.value = image_url
        stopPolling()
      } else if (taskStatus === 'failed') {
        failedReason.value = failed_reason || '生成失败，请重试'
        stopPolling()
      }
    }
  } catch (error) {
    console.error('轮询失败:', error)
  }
}

const startPolling = () => {
  pollTaskStatus()
  pollTimer = setInterval(() => {
    pollTaskStatus()
  }, 2000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 切换提示语
const startTipRotation = () => {
  const updateTip = () => {
    const randomIndex = Math.floor(Math.random() * LOADING_TIPS.length)
    currentTip.value = LOADING_TIPS[randomIndex]
  }

  updateTip()
  tipTimer = setInterval(updateTip, 3000)
}

const stopTipRotation = () => {
  if (tipTimer) {
    clearInterval(tipTimer)
    tipTimer = null
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  taskId.value = currentPage.options?.taskId || ''

  if (taskId.value) {
    startPolling()
    startTipRotation()
  }
})

onUnmounted(() => {
  stopPolling()
  stopTipRotation()
})
</script>

<style scoped lang="scss">
.result-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
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

.generating-section {
  padding-top: calc(88rpx + env(safe-area-inset-top) + 80rpx);
  padding-left: 32rpx;
  padding-right: 32rpx;

  .skeleton-image {
    width: 100%;
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 24rpx;
    position: relative;
    overflow: hidden;

    .shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 212, 255, 0.2) 50%,
        transparent 100%
      );
      animation: shimmer 2s infinite;
    }
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  .progress-section {
    margin-top: 48rpx;
    display: flex;
    align-items: center;
    gap: 24rpx;

    .progress-bar {
      flex: 1;
      height: 8rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4rpx;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
        transition: width 0.3s;
      }
    }

    .progress-text {
      font-size: 28rpx;
      color: #00D4FF;
      font-weight: 500;
      min-width: 80rpx;
      text-align: right;
    }
  }

  .tips-section {
    margin-top: 48rpx;
    text-align: center;

    .tip-text {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
    }
  }
}

.failed-section {
  padding-top: calc(88rpx + env(safe-area-inset-top) + 120rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  padding-left: 32rpx;
  padding-right: 32rpx;

  .failed-icon {
    font-size: 120rpx;
  }

  .failed-title {
    font-size: 40rpx;
    color: #fff;
    font-weight: bold;
  }

  .failed-reason {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    line-height: 1.6;
  }

  .retry-btn {
    margin-top: 32rpx;
    padding: 24rpx 64rpx;
    background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
    border-radius: 48rpx;
    border: none;
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
  }
}

.success-section {
  padding-top: calc(88rpx + env(safe-area-inset-top) + 32rpx);
  padding-bottom: 32rpx;

  .image-wrapper {
    width: 100%;
    padding: 0 32rpx;

    .result-image {
      width: 100%;
      border-radius: 24rpx;
      display: block;
    }
  }

  .actions-section {
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .action-row {
      display: flex;
      gap: 16rpx;
    }

    .action-btn {
      flex: 1;
      padding: 24rpx;
      border-radius: 24rpx;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      &.primary {
        background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);

        .btn-text {
          color: #fff;
          font-size: 32rpx;
          font-weight: 500;
        }
      }

      &.secondary {
        background: rgba(255, 255, 255, 0.08);

        .btn-icon {
          font-size: 40rpx;
        }

        .btn-text {
          color: #fff;
          font-size: 28rpx;
        }

        .btn-desc {
          color: rgba(255, 255, 255, 0.4);
          font-size: 20rpx;
        }
      }

      &.outline {
        background: transparent;
        border: 2rpx solid rgba(255, 255, 255, 0.2);

        .btn-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 28rpx;
        }
      }
    }
  }
}
</style>
