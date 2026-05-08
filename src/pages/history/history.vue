<template>
  <view class="history-page">
    <AppStatusBar />
    <AppNavBar :title="selecting ? '我的作品' : '我的作品'" back @back="goBack">
      <template #right>
        <button class="manage-btn" @click="toggleSelect">{{ selecting ? '取消' : '管理' }}</button>
      </template>
    </AppNavBar>
    <view class="count">{{ selecting ? `已选择${selectedIds.length}个` : `共计${total || items.length}个` }}</view>

    <scroll-view class="history-scroll" scroll-y @scrolltolower="loadMore">
      <view class="grid" :class="{ selecting }">
        <view
          v-for="item in items"
          :key="item.task_id"
          class="work-item"
          @click="handleItemClick(item)"
        >
          <image v-if="item.image_url" :src="item.image_url" mode="aspectFill" />
          <view v-else class="placeholder">{{ statusText(item.status) }}</view>
          <view v-if="selecting" class="check">
            <image
              :src="selectedIds.includes(item.task_id) ? ASSETS.iconCheckSmall : ASSETS.iconRadioEmpty"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>
      <EmptyState v-if="items.length === 0 && !loading" title="暂无作品" description="生成完成的作品会保存在这里。" />
      <view v-if="loading" class="loading">加载中...</view>
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
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppStatusBar from '@/components/AppStatusBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ASSETS } from '@/config/assets'
import { aurakeyApi, type TaskHistoryItem } from '@/services/aurakey'

const items = ref<TaskHistoryItem[]>([])
const page = ref(1)
const pageSize = 30
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const selecting = ref(false)
const selectedIds = ref<string[]>([])

const goBack = () => uni.navigateBack()

const loadHistory = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return
  loading.value = true
  try {
    const current = reset ? 1 : page.value
    const data = await aurakeyApi.user.history(current, pageSize)
    items.value = current === 1 ? data.items : items.value.concat(data.items)
    total.value = data.total || items.value.length
    page.value = current + 1
    hasMore.value = data.items.length >= pageSize
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
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
        for (const taskId of selectedIds.value) {
          await aurakeyApi.user.deleteHistory(taskId)
        }
        items.value = items.value.filter((item) => !selectedIds.value.includes(item.task_id))
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

onMounted(() => {
  loadHistory(true)
})
</script>

<style scoped lang="scss">
.history-page {
  min-height: 100vh;
  background: #050506;
  color: #fff;
}

.manage-btn {
  width: 100rpx;
  height: 62rpx;
  border-radius: 14rpx;
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
  height: calc(100vh - 190rpx);
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
</style>
