<template>
  <view class="history-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="nav-title">我的画廊</text>
      <text class="nav-action" :class="{ active: isSelecting }" @click="toggleSelect">
        {{ isSelecting ? '取消' : '多选' }}
      </text>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <text
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </text>
    </view>

    <!-- 历史列表 -->
    <scroll-view
      class="history-scroll"
      scroll-y
      @scrolltolower="loadMore"
      :lower-threshold="100"
    >
      <view class="history-grid">
        <view
          v-for="item in items"
          :key="item.task_id"
          class="history-item"
          :class="{ selected: selectedIds.includes(item.task_id) }"
          @click="handleItemClick(item)"
        >
          <!-- 选择框 -->
          <view v-if="isSelecting" class="checkbox">
            <text v-if="selectedIds.includes(item.task_id)">✓</text>
          </view>

          <!-- 图片 -->
          <image
            v-if="item.image_url"
            :src="item.image_url"
            mode="aspectFill"
            class="item-image"
          />
          <view v-else class="item-placeholder">
            <text class="placeholder-text">{{ getStatusText(item.status) }}</text>
          </view>

          <!-- 信息 -->
          <view class="item-info">
            <text class="prompt">{{ item.prompt }}</text>
            <text class="cost">消耗 {{ item.cost }} 算力</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      <view v-if="!hasMore && items.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
      <view v-if="items.length === 0 && !loading" class="empty">
        <text class="empty-icon">🎨</text>
        <text class="empty-text">还没有作品，快去创作吧～</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏（多选模式） -->
    <view v-if="isSelecting" class="action-bar">
      <text class="selected-count">已选 {{ selectedIds.length }} 项</text>
      <button class="delete-btn" :disabled="selectedIds.length === 0" @click="handleDelete">
        <text>删除</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import type { HistoryItem } from '@/stores/historyStore'
import { client } from '@/services/uniClient'

const historyStore = useHistoryStore()

const tabs = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '灵感', value: 'inspiration' },
]

const currentTab = ref('all')
const loading = ref(false)
const hasMore = ref(true)
const isSelecting = ref(false)
const selectedIds = ref<string[]>([])

const items = computed(() => historyStore.items)

const goBack = () => {
  uni.navigateBack()
}

const switchTab = (tab: string) => {
  currentTab.value = tab
  historyStore.reset()
  loadHistory()
}

const toggleSelect = () => {
  isSelecting.value = !isSelecting.value
  if (!isSelecting.value) {
    selectedIds.value = []
  }
}

const handleItemClick = (item: HistoryItem) => {
  if (isSelecting.value) {
    // 多选模式：切换选中状态
    const index = selectedIds.value.indexOf(item.task_id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(item.task_id)
    }
  } else {
    // 普通模式：查看详情
    if (item.status === 'success' && item.image_url) {
      uni.navigateTo({
        url: `/pages/task-result/task-result?taskId=${item.task_id}`,
      })
    } else {
      uni.showToast({ title: '该作品生成失败', icon: 'none' })
    }
  }
}

const loadHistory = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const res = await client.GET('/aurakey/user/history', {
      params: {
        query: {
          page: historyStore.currentPage,
          pageSize: historyStore.pageSize,
        },
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      const { items: newItems, page } = res.data.data
      if (page === 1) {
        historyStore.setItems(newItems || [])
      } else {
        historyStore.appendItems(newItems || [])
      }
      historyStore.currentPage = page + 1
      hasMore.value = (newItems?.length || 0) >= historyStore.pageSize
    }
  } catch (error) {
    console.error('加载历史失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadHistory()
}

const handleDelete = () => {
  if (selectedIds.value.length === 0) return

  uni.showModal({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedIds.value.length} 项吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          // 批量删除
          for (const taskId of selectedIds.value) {
            await client.DELETE('/aurakey/user/history/{task_id}', {
              params: {
                path: {
                  task_id: taskId,
                },
              },
            })
            historyStore.removeItem(taskId)
          }

          uni.showToast({ title: '删除成功', icon: 'success' })
          selectedIds.value = []
          isSelecting.value = false
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '排队中',
    processing: '生成中',
    failed: '失败',
  }
  return statusMap[status] || '未知'
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.history-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 120rpx;
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

  .nav-action {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);

    &.active {
      color: #00D4FF;
    }
  }
}

.filter-tabs {
  position: fixed;
  top: calc(88rpx + env(safe-area-inset-top));
  left: 0;
  right: 0;
  height: 88rpx;
  background: #0A0A0A;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 32rpx;
  z-index: 99;

  .tab {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
    padding: 8rpx 0;
    position: relative;

    &.active {
      color: #00D4FF;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4rpx;
        background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
        border-radius: 2rpx;
      }
    }
  }
}

.history-scroll {
  height: calc(100vh - 176rpx - env(safe-area-inset-top));
  margin-top: calc(176rpx + env(safe-area-inset-top));
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 24rpx;

  .history-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    overflow: hidden;
    position: relative;
    border: 2rpx solid transparent;

    &.selected {
      border-color: #00D4FF;
    }

    .checkbox {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      width: 48rpx;
      height: 48rpx;
      border-radius: 24rpx;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10rpx);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #00D4FF;
      z-index: 10;
      border: 2rpx solid rgba(255, 255, 255, 0.2);
    }

    .item-image {
      width: 100%;
      aspect-ratio: 1;
      display: block;
    }

    .item-placeholder {
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);

      .placeholder-text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.3);
      }
    }

    .item-info {
      padding: 16rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .prompt {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cost {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

.loading,
.no-more,
.empty {
  text-align: center;
  padding: 40rpx;
  color: rgba(255, 255, 255, 0.3);
  font-size: 24rpx;
}

.empty {
  padding-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;

  .empty-icon {
    font-size: 120rpx;
  }

  .empty-text {
    font-size: 28rpx;
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

  .selected-count {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }

  .delete-btn {
    padding: 16rpx 48rpx;
    background: rgba(255, 77, 79, 0.2);
    border-radius: 24rpx;
    border: none;
    font-size: 28rpx;
    color: #ff4d4f;
    font-weight: 500;

    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
