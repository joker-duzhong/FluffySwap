<template>
  <view class="history-page">
    <AppTopNav :title="selecting ? '我的作品' : '我的作品'" back @back="goBack">
      <template #right>
        <button class="manage-btn" @click="toggleSelect">{{ selecting ? '取消' : '管理' }}</button>
      </template>
    </AppTopNav>
    <view class="count">{{ selecting ? `已选择${selectedIds.length}个` : `共计${total || items.length}个` }}</view>

    <scroll-view class="history-scroll" scroll-y @scrolltolower="loadMore">
      <PageSkeleton v-if="loading && items.length === 0" variant="grid" :rows="6" />
      <view v-else class="grid" :class="{ selecting }">
        <view
          v-for="item in items"
          :key="item.task_id"
          class="work-item"
          @click="handleItemClick(item)"
        >
          <image v-if="item.image_url" :src="item.image_url" mode="aspectFill" />
          <view v-else class="placeholder" :class="{ polling: isPollingItem(item.task_id) }">
            <text>{{ progressText(item) }}</text>
          </view>
          <view v-if="selecting" class="check">
            <image
              :src="selectedIds.includes(item.task_id) ? ASSETS.iconCheckSmall : ASSETS.iconRadioEmpty"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>
      <EmptyState v-if="items.length === 0 && !loading" title="暂无作品" description="生成完成的作品会保存在这里。" />
      <view v-if="loading && items.length > 0" class="loading">加载中...</view>
    </scroll-view>

    <view v-if="selecting" class="batch-bar">
      <view class="batch-action" @click="selectAll">
        <text>✓</text>
        <text>全选</text>
      </view>
      <view class="batch-action" @click="downloadSelected">
        <text>↓</text>
        <text>下载</text>
      </view>
      <view class="batch-action" @click="deleteSelected">
        <text>□</text>
        <text>删除</text>
      </view>
    </view>
    <view v-else class="create-entry" @click="showCreateSheet = true">创作</view>
    <CreateTaskSheet
      v-if="showCreateSheet"
      @close="showCreateSheet = false"
      @login-required="showLoginSheet = true"
      @submitted="handleTaskSubmitted"
    />
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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

const authStore = useAuthStore()
const historyStore = useHistoryStore()
const taskStore = useTaskStore()
const selecting = ref(false)
const selectedIds = ref<string[]>([])
const showLoginSheet = ref(false)
const showCreateSheet = ref(false)

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

const handleTaskSubmitted = (taskId: string) => {
  showCreateSheet.value = false
  historyStore.trackSubmittedTask(taskId, {
    prompt: taskStore.prompt || '生成中',
    model_name: taskStore.selectedModel,
    aspect_ratio: taskStore.selectedRatio,
  })
  loadHistory(true)
}

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

const isPollingItem = (taskId: string) => historyStore.isRunningItem(taskId)

const progressText = (item: TaskHistoryItem) => {
  if (isPollingItem(item.task_id)) return `${item.progress || historyStore.pollingProgress || 1}% AI绘图中...`
  return statusText(item.status)
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
  loadHistory(true)
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
  loadHistory(true)
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

.manage-btn {
  width: 100rpx;
  height: 62rpx;
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
  padding: 28rpx 34rpx 20rpx;
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

  &.polling {
    align-items: flex-start;
    justify-content: flex-end;
    padding: 24rpx;
    text-align: left;
    background: linear-gradient(135deg, #26262c, #1a1a20);
  }

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
  width: 430rpx;
  height: 104rpx;
  transform: translateX(-50%);
  border-radius: 999rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #12345a;
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.36);
}

.batch-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #fff;
  font-size: 24rpx;
}

.loading {
  padding: 34rpx 0;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
  text-align: center;
}

.create-entry {
  position: fixed;
  left: 50%;
  bottom: calc(36rpx + env(safe-area-inset-bottom));
  width: 430rpx;
  height: 88rpx;
  transform: translateX(-50%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  background: linear-gradient(180deg, #5a64ff 0%, #3e98ff 100%);
  box-shadow: 0 18rpx 44rpx rgba(45, 108, 255, 0.45);
}
</style>
