<template>
  <view class="detail-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-btn" @click="goBack">
        <text>‹</text>
      </view>
      <view class="nav-btn" @click="showMore">
        <text>⋯</text>
      </view>
    </view>

    <!-- 图片展示 -->
    <view class="image-section">
      <image
        v-if="detail"
        :src="detail.image_url"
        mode="widthFix"
        class="main-image"
        @click="previewImage"
      />
    </view>

    <!-- 作者信息 -->
    <view v-if="detail" class="author-section">
      <view class="author-info">
        <image :src="detail.author.avatar" class="avatar" />
        <view class="info">
          <text class="nickname">{{ detail.author.nickname }}</text>
          <text class="stats">{{ detail.view_count }} 浏览</text>
        </view>
      </view>
      <button class="follow-btn" @click="handleFollow">
        <text>+ 关注</text>
      </button>
    </view>

    <!-- 提示词 -->
    <view v-if="detail" class="prompt-section">
      <view class="section-header">
        <text class="title">提示词 (Prompt)</text>
        <view class="copy-btn" @click="copyPrompt">
          <text>📋 复制</text>
        </view>
      </view>
      <text class="prompt-text">{{ detail.prompt }}</text>
    </view>

    <!-- 参数信息 -->
    <view v-if="detail" class="params-section">
      <view class="section-header">
        <text class="title">参数 (Parameters)</text>
      </view>
      <view class="params-grid">
        <view class="param-item">
          <text class="param-label">模型</text>
          <text class="param-value">{{ detail.model_name }}</text>
        </view>
        <view class="param-item">
          <text class="param-label">比例</text>
          <text class="param-value">{{ detail.aspect_ratio }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-left">
        <view class="action-btn" @click="handleLike">
          <text class="icon">{{ detail?.is_liked ? '❤️' : '🤍' }}</text>
          <text class="text">{{ detail?.like_count || 0 }}</text>
        </view>
        <view class="action-btn" @click="handleDownload">
          <text class="icon">⬇️</text>
          <text class="text">保存</text>
        </view>
        <view class="action-btn" @click="handleShare">
          <text class="icon">📤</text>
          <text class="text">分享</text>
        </view>
      </view>
      <button class="create-same-btn" @click="createSame">
        <text>🪄 做一张同款</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/galleryStore'
import { useTaskStore } from '@/stores/taskStore'
import { useAppStore } from '@/stores/appStore'
import type { GalleryDetail } from '@/stores/galleryStore'
import { client } from '@/services/uniClient'

const galleryStore = useGalleryStore()
const taskStore = useTaskStore()
const appStore = useAppStore()

const detail = ref<GalleryDetail | null>(null)
const itemId = ref('')

const goBack = () => {
  uni.navigateBack()
}

const showMore = () => {
  uni.showActionSheet({
    itemList: ['举报', '屏蔽作者'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showToast({ title: '举报功能开发中', icon: 'none' })
      } else if (res.tapIndex === 1) {
        uni.showToast({ title: '屏蔽功能开发中', icon: 'none' })
      }
    },
  })
}

const previewImage = () => {
  if (detail.value?.image_url) {
    uni.previewImage({
      urls: [detail.value.image_url],
      current: 0,
    })
  }
}

const handleFollow = () => {
  uni.showToast({ title: '关注功能开发中', icon: 'none' })
}

const copyPrompt = () => {
  if (detail.value?.prompt) {
    uni.setClipboardData({
      data: detail.value.prompt,
      success: () => {
        uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
      },
    })
  }
}

const handleLike = async () => {
  if (!detail.value) return

  try {
    const res = await client.POST('/aurakey/gallery/{id}/like', {
      params: {
        path: {
          id: itemId.value,
        },
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      const { is_liked, like_count } = res.data.data
      detail.value.is_liked = is_liked
      detail.value.like_count = like_count
      galleryStore.updateLikeStatus(itemId.value, is_liked, like_count)
    }
  } catch (error) {
    console.error('点赞失败:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleDownload = () => {
  if (!detail.value?.image_url) return

  uni.showLoading({ title: '保存中...' })
  uni.downloadFile({
    url: detail.value.image_url,
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
            uni.showToast({ title: '保存失败', icon: 'none' })
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

const handleShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

const createSame = () => {
  if (!detail.value) return

  // 将提示词和参数带入创作台
  taskStore.setPrompt(detail.value.prompt)
  taskStore.setRatio(detail.value.aspect_ratio)

  // 返回首页并打开创作面板
  uni.navigateBack()
  setTimeout(() => {
    appStore.showCreatePanel()
  }, 300)
}

const loadDetail = async () => {
  try {
    const res = await client.GET('/aurakey/gallery/{id}', {
      params: {
        path: {
          id: itemId.value,
        },
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      detail.value = res.data.data
      galleryStore.setSelectedItem(res.data.data)
    }
  } catch (error) {
    console.error('加载详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  itemId.value = currentPage.options?.id || ''

  if (itemId.value) {
    loadDetail()
  }
})
</script>

<style scoped lang="scss">
.detail-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 160rpx;
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
}

.image-section {
  width: 100%;
  padding-top: calc(88rpx + env(safe-area-inset-top));

  .main-image {
    width: 100%;
    display: block;
  }
}

.author-section {
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .author-info {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .nickname {
        font-size: 28rpx;
        color: #fff;
        font-weight: 500;
      }

      .stats {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .follow-btn {
    padding: 12rpx 32rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 24rpx;
    border: none;
    font-size: 24rpx;
    color: #fff;
  }
}

.prompt-section,
.params-section {
  padding: 0 32rpx 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .title {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .copy-btn {
      padding: 8rpx 16rpx;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 16rpx;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .prompt-text {
    display: block;
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    font-size: 26rpx;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
  }

  .params-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;

    .param-item {
      padding: 24rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .param-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }

      .param-value {
        font-size: 28rpx;
        color: #fff;
        font-weight: 500;
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 32rpx;
  padding-right: 32rpx;
  z-index: 100;

  .action-left {
    display: flex;
    gap: 32rpx;

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4rpx;

      .icon {
        font-size: 40rpx;
      }

      .text {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .create-same-btn {
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
    border-radius: 24rpx;
    border: none;
    font-size: 28rpx;
    color: #fff;
    font-weight: 500;
  }
}
</style>
