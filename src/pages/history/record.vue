<template>
  <view class="record-page">
    <AppTopNav title="历史记录" back @back="goBack" />

    <scroll-view class="record-scroll" scroll-y :scroll-into-view="scrollIntoView" :upper-threshold="80"
      @scrolltoupper="loadPrevious">
      <view class="top-loading">
        <text v-if="loading && items.length > 0">加载中...</text>
        <text v-else-if="!hasMore && items.length > 0">没有更早的记录了</text>
      </view>

      <PageSkeleton v-if="loading && items.length === 0" variant="list" :rows="4" />
      <view v-else-if="recordItems.length > 0" class="record-list">
        <view v-for="item in recordItems" :key="item.task_id" :id="itemAnchor(item.task_id)" class="record-item">
          <text class="prompt">{{ item.prompt || '生成记录' }}</text>
          <view class="meta-row">
            <view v-if="getReferenceThumb(item)" class="tag thumb-tag">
              <image :src="getReferenceThumb(item)" mode="aspectFill" @click="previewImage(getReferenceThumb(item))" />
              <text>参考图</text>
            </view>
            <view class="tag" v-if="item.model_name">{{ item.model_name }}</view>
            <view v-if="item.aspect_ratio" class="tag">{{ item.aspect_ratio }}</view>
            <!-- <view class="tag">{{ item.cost || 0 }}</view> -->
          </view>

          <view class="image-card" @click="previewImage(item.resource?.url)">
            <GeneratingTaskCard v-if="isRunningItem(item)" :progress="item.progress || historyStore.pollingProgress" />
            <view class="image-watermark-wrap" v-else-if="item.resource?.url">
              <image :src="item.resource.url" mode="heightFix" />
              <view class="watermark">AI生成</view>
            </view>
            <view v-else class="failed-card">
              <image class="icon" :src="ASSETS.iconImageError" mode="widthFix" />
              <text class="failed-status">{{ statusText(item.status) }}</text>
              <text v-if="item.failed_reason" class="failed-reason">{{ item.failed_reason }}</text>
            </view>
          </view>

          <view v-if="item.status == 'success' || item.status == 'failed'" class="actions">
            <button @click="editSame(item)" v-if="item.status == 'success'">
              <image class="icon" :src="ASSETS.iconEdit1" mode="aspectFit" />
              重新编辑
            </button>
            <button @click="regenerate(item)" v-if="item.status == 'failed'">
              <image class="icon" :src="ASSETS.iconReload" mode="aspectFit" />
              再次生成
            </button>
            <button @click="saveImage(item)" v-if="item.resource?.url">
              <image class="icon" :src="ASSETS.iconDownload" mode="aspectFit" />
              保存
            </button>
          </view>
        </view>
      </view>
      <view v-if="loading && items.length > 0" class="loading">加载中...</view>
      <EmptyState v-if="recordItems.length === 0 && !loading" title="暂无历史记录" description="生成任务会在这里按时间沉淀。" />
      <view id="record-bottom-anchor" class="bottom-anchor"></view>
    </scroll-view>

    <view class="composer-bar" @click.stop="openCreateSheet">
      <view class="upload-icon">
        <image :src="ASSETS.createUploadImage" mode="aspectFit" />
      </view>
      <text class="placeholder">请输入提示词</text>
      <view class="send-icon">
        <image :src="ASSETS.createSend" mode="aspectFit" />
      </view>
    </view>

    <CreateTaskSheet v-if="showCreateSheet" :preset-prompt="taskStore.prompt" :preset-ratio="taskStore.selectedRatio"
      :preset-model="taskStore.selectedModel" :reference-images="taskStore.referenceImages"
      @close="showCreateSheet = false" @login-required="showLoginSheet = true" @submitted="handleTaskSubmitted" />

    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import CreateTaskSheet from '@/components/CreateTaskSheet.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { ASSETS } from '@/config/assets'
import type { TaskHistoryItem } from '@/services/aurakey'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useTaskStore } from '@/stores/taskStore'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'
import GeneratingTaskCard from './components/GeneratingTaskCard.vue'

const authStore = useAuthStore()
const historyStore = useHistoryStore()
const taskStore = useTaskStore()
const showCreateSheet = ref(false)
const showLoginSheet = ref(false)
const scrollIntoView = ref('')
const pendingOpenCreate = ref(false)

const items = computed(() => historyStore.items)
const loading = computed(() => historyStore.loading)
const hasMore = computed(() => historyStore.hasMore)
const recordItems = computed(() => items.value.slice().reverse())

const goBack = () => uni.navigateBack()

const getPageOption = (key: string) => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  return currentPage?.options?.[key] || ''
}

const itemAnchor = (taskId: string) => `record-item-${taskId.replace(/[^A-Za-z0-9_-]/g, '-')}`


const scrollToAnchor = (anchorId: string) => {
  scrollIntoView.value = ''
  nextTick(() => {
    scrollIntoView.value = anchorId
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollToAnchor('record-bottom-anchor')
  })
}

const loadHistory = async (reset = false) => {
  if (!authStore.isLoggedIn) {
    showLoginSheet.value = true
    return false
  }

  try {
    await historyStore.loadHistory({ reset })
    if (reset) scrollToBottom()
    return true
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
    return false
  }
}

const loadPrevious = async () => {
  if (loading.value || !hasMore.value) return
  const firstItemId = recordItems.value[0]?.task_id || ''
  await loadHistory()
  if (firstItemId) scrollToAnchor(itemAnchor(firstItemId))
}

const isRunningItem = (item: TaskHistoryItem) => {
  return historyStore.isRunningItem(item.task_id) || item.status === 'pending' || item.status === 'processing'
}

const statusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '排队中',
    processing: '生成中',
    failed: '图片生成失败',
  }
  return map[status] || '暂无预览'
}

const getReferenceThumb = (item: TaskHistoryItem) => {
  const reference = item.reference_images?.[0]
  return reference?.thumb_url || reference?.url || ''
}

const openWork = (item: TaskHistoryItem) => {
  if (isRunningItem(item)) return
  uni.navigateTo({ url: `/pages/task-result/task-result?taskId=${item.task_id}` })
}

const previewImage = (resultImage?: string) => {
  if (resultImage) uni.previewImage({ urls: [resultImage] })
}

const openCreateSheet = () => {
  if (!authStore.isLoggedIn) {
    pendingOpenCreate.value = true
    showLoginSheet.value = true
    return
  }
  showCreateSheet.value = true
}

const editSame = (item: TaskHistoryItem) => {
  taskStore.applyPreset(item.prompt || '', item.aspect_ratio, item.model_name, item.reference_images || [])
  showCreateSheet.value = true
}

const regenerate = (item: TaskHistoryItem) => {
  taskStore.applyPreset(item.prompt || '', item.aspect_ratio, item.model_name, item.reference_images || [])
  showCreateSheet.value = true
}

const saveImage = (item: TaskHistoryItem) => {
  if (!item.resource?.url) return
  uni.downloadFile({
    url: item.resource.url,
    success: (res) => {
      if (res.statusCode !== 200) {
        uni.showToast({ title: '下载失败', icon: 'none' })
        return
      }
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败，请授权相册', icon: 'none' }),
      })
    },
    fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
  })
}

const handleTaskSubmitted = (taskId: string) => {
  showCreateSheet.value = false
  historyStore.trackSubmittedTask(taskId, {
    prompt: taskStore.prompt || '生成中',
    model_name: taskStore.selectedModel,
    aspect_ratio: taskStore.selectedRatio,
    reference_images: taskStore.referenceImages,
    reference_images_ids: taskStore.referenceImages.map((item) => item.id),
  })
  void loadHistory(true)
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
  loadHistory(true).then(() => {
    if (!pendingOpenCreate.value) return
    pendingOpenCreate.value = false
    showCreateSheet.value = true
  })
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

onMounted(() => {
  uni.$on('auth:login-required', handleLoginRequired)
  const taskId = getPageOption('taskId')
  if (taskId) {
    historyStore.trackSubmittedTask(taskId, {
      prompt: taskStore.prompt || '生成中',
      model_name: taskStore.selectedModel,
      aspect_ratio: taskStore.selectedRatio,
      reference_images: taskStore.referenceImages,
      reference_images_ids: taskStore.referenceImages.map((item) => item.id),
    })
  }
  if (getPageOption('openCreate') === '1') {
    pendingOpenCreate.value = true
  }
  loadHistory(true).then((loaded) => {
    if (!loaded || !pendingOpenCreate.value) return
    pendingOpenCreate.value = false
    nextTick(() => {
      showCreateSheet.value = true
    })
  })
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})
</script>

<style scoped lang="scss">
.record-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
  background: #050506;
}

.record-scroll {
  flex: 1;
  min-height: 0;
  height: auto;
  padding: 0 28rpx calc(148rpx + env(safe-area-inset-bottom));
}

.top-loading {
  min-height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.36);
  font-size: 22rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 72rpx;
  padding-bottom: 36rpx;
}

.bottom-anchor {
  height: 1rpx;
}

.record-item {
  display: flex;
  flex-direction: column;
}

.prompt {
  color: #fff;
  font-size: 28rpx;
  line-height: 20px;
  margin-bottom: 12rpx;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  height: 38rpx;
  max-width: 220rpx;
  padding: 0 12rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumb-tag image {
  width: 30rpx;
  height: 30rpx;
  border-radius: 5rpx;
}

.image-card {
  width: 100%;
  margin-top: 24rpx;
  border-radius: 12rpx;
  position: relative;
  // background: rgba(255, 255, 255, 0.08);

  .image-watermark-wrap {
    position: relative;
    display: inline-block;
    line-height: 0;
  }

  image {
    height: 200px;
    display: block;
  }

  .watermark {
    position: absolute;
    right: 12px;
    bottom: 12px;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid #FFFFFF66;
    color: #FFFFFF66;
    font-size: 12px;
    line-height: 16px;
  }
}

.failed-card {
  width: 400rpx;
  height: 400rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  color: rgba(255, 255, 255, 0.78);
  font-size: 28rpx;
  background: linear-gradient(135deg, #24252b, #17181e);

  .icon {
    width: 20px;
    height: 20px;
  }
}

.failed-status {
  width: fit-content;
  font-size: 24rpx;
  color: #FFFFFF66;
}

.failed-reason {
  width: fit-content;
  color: rgba(255, 255, 255, 0.46);
  font-size: 24rpx;
  line-height: 34rpx;
}

.actions {
  margin-top: 18rpx;
  display: flex;
  gap: 10rpx;

  .icon {
    width: 12px;
    height: 12px;
  }

  button {
    height: 50rpx;
    padding: 0 18rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 50rpx;
    color: #fff;
    font-size: 22rpx;
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
}

.loading {
  padding: 24rpx 0;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
  text-align: center;
}

.composer-bar {
  position: fixed;
  left: 14rpx;
  right: 14rpx;
  bottom: calc(14rpx + env(safe-area-inset-bottom));
  height: 96rpx;
  padding: 12rpx 12rpx 12rpx 18rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #1b1b20;
  box-shadow: 0 -18rpx 42rpx rgba(0, 0, 0, 0.48);
}

.upload-icon {
  width: 58rpx;
  height: 58rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.2);

  image {
    width: 34rpx;
    height: 34rpx;
  }
}

.placeholder {
  flex: 1;
  color: rgba(255, 255, 255, 0.34);
  font-size: 24rpx;
}

.send-icon {
  width: 58rpx;
  height: 58rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f2ff;

  image {
    width: 34rpx;
    height: 34rpx;
  }
}
</style>
