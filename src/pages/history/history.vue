<template>
  <view class="history-page">
    <AppTopNav title="我的作品" back @back="goBack" />
    <view class="summary-row">
      <view class="count">{{ selecting ? `已选择${selectedIds.length}个` : `共计${total || items.length}个` }}</view>
      <button class="manage-btn" @click="toggleSelect">{{ selecting ? '取消' : '管理' }}</button>
    </view>

    <scroll-view class="history-scroll" scroll-y @scrolltolower="loadMore">
      <PageSkeleton v-if="loading && items.length === 0" variant="grid" :rows="6" />
      <view v-else class="grid" :class="{ selecting }">
        <view v-for="item in items" :key="item.task_id" class="work-item" @click="handleItemClick(item)">
          <GeneratingTaskCard v-if="isPollingItem(item.task_id) || isGeneratingStatus(item.status)"
            :progress="item.progress || historyStore.pollingProgress" size="compact" />
          <image v-else-if="item.resource?.thumb_url" :src="item.resource.thumb_url" mode="aspectFill" />
          <view v-else class="placeholder">
            <text>{{ progressText(item) }}</text>
          </view>
          <view v-if="selecting" class="check">
            <image :src="selectedIds.includes(item.task_id) ? ASSETS.iconCheckSmall : ASSETS.iconRadioEmpty"
              mode="aspectFit" />
          </view>
        </view>
      </view>
      <EmptyState v-if="items.length === 0 && !loading" title="暂无作品" description="生成完成的作品会保存在这里。" />
      <view v-if="loading && items.length > 0" class="loading">加载中...</view>
    </scroll-view>

    <view v-if="selecting" class="batch-bar">
      <view class="batch-action" @click="selectAll">
        <image :src="ASSETS.iconSelectAll" mode="aspectFit" class="icon" />
        <text>全选</text>
      </view>
      <view class="batch-action" @click="deleteSelected">
        <image :src="ASSETS.iconDelete" mode="aspectFit" class="icon" />
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { ASSETS } from '@/config/assets'
import type { TaskHistoryItem } from '@/services/aurakey'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useTaskStore } from '@/stores/taskStore'
import GeneratingTaskCard from './components/GeneratingTaskCard.vue'

const authStore = useAuthStore()
const historyStore = useHistoryStore()
const taskStore = useTaskStore()
const selecting = ref(false)
const selectedIds = ref<string[]>([])
const showLoginSheet = ref(false)

const items = computed(() => historyStore.items)
const total = computed(() => historyStore.total)
const loading = computed(() => historyStore.loading)

const goBack = () => uni.navigateBack()

const getPageOption = (key: string) => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  return currentPage?.options?.[key] || ''
}


const loadHistory = async (reset = false) => {
  if (!authStore.isLoggedIn) {
    showLoginSheet.value = true
    return
  }
  try {
    await historyStore.loadHistory({ reset })
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  }
}

const loadMore = () => loadHistory()

const toggleSelect = () => {
  selecting.value = !selecting.value
  if (!selecting.value) selectedIds.value = []
}

const handleItemClick = (item: TaskHistoryItem) => {
  if (selecting.value) {
    const index = selectedIds.value.indexOf(item.task_id)
    if (index >= 0) selectedIds.value.splice(index, 1)
    else selectedIds.value.push(item.task_id)
    return
  }
  uni.navigateTo({ url: `/pages/task-result/task-result?taskId=${item.task_id}` })
}

const selectAll = () => {
  selectedIds.value = selectedIds.value.length === items.value.length ? [] : items.value.map((item) => item.task_id)
}

const downloadSelected = () => {
  uni.showToast({ title: '请逐张打开后保存高清图', icon: 'none' })
}

const deleteSelected = () => {
  if (selectedIds.value.length === 0) return
  uni.showModal({
    title: '删除作品',
    content: `确认删除选中的 ${selectedIds.value.length} 个作品？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        await historyStore.deleteItems(selectedIds.value)
        selectedIds.value = []
        selecting.value = false
      } catch (error: any) {
        uni.showToast({ title: error.message || '删除失败', icon: 'none' })
      }
    },
  })
}

const statusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '排队中',
    processing: '生成中',
    failed: '生成失败',
  }
  return map[status] || '暂无预览'
}

const isGeneratingStatus = (status: string) => status === 'pending' || status === 'processing'

const isPollingItem = (taskId: string) => historyStore.isRunningItem(taskId)

const progressText = (item: TaskHistoryItem) => {
  if (isPollingItem(item.task_id)) return `${item.progress || historyStore.pollingProgress || 1}% AI绘图中...`
  return statusText(item.status)
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
    })
  }
  void loadHistory(true)
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})
</script>

<style scoped lang="scss">
.history-page {
  height: 100vh;
  background: #050506;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-row {
  padding: 16rpx 28rpx 20rpx 34rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.manage-btn {
  min-width: 100rpx;
  height: 62rpx;
  padding: 0 18rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 62rpx;
  color: #fff;
  font-size: 26rpx;
  background: rgba(255, 255, 255, 0.1);
}

.count {
  color: #fff;
  font-size: 28rpx;
}

.history-scroll {
  flex: 1;
  min-height: 0;
  height: auto;
  padding-bottom: calc(134rpx + env(safe-area-inset-bottom));
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 0 34rpx 40rpx;
}

.work-item {
  position: relative;
  height: 204rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #12141b;

  image {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.42);
  font-size: 24rpx;

  text {
    display: block;
  }
}

.check {
  position: absolute;
  right: 12rpx;
  top: 12rpx;
  width: 38rpx;
  height: 38rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.batch-bar {
  position: fixed;
  left: 50%;
  bottom: calc(46rpx + env(safe-area-inset-bottom));
  width: 420rpx;
  height: 112rpx;
  transform: translateX(-50%);
  border-radius: 999rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: #0F0F1299;
  border: 1px solid #FFFFFF33;
  backdrop-filter: blur(40px)
}

.batch-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: #fff;
  font-size: 24rpx;

  .icon {
    width: 40rpx;
    height: 40rpx;
  }
}

.loading {
  padding: 34rpx 0;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
  text-align: center;
}
</style>
