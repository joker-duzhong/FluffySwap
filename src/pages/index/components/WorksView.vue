<template>
  <view class="works-container">
    <view class="header">
      <text class="title">作品</text>
      <text class="action" @click="goHistory">管理</text>
    </view>

    <view class="filters">
      <text
        v-for="filter in filters"
        :key="filter.value"
        class="filter"
        :class="{ active: currentFilter === filter.value }"
        @click="switchFilter(filter.value)"
      >
        {{ filter.label }}
      </text>
    </view>

    <scroll-view
      class="works-scroll"
      scroll-y
      :lower-threshold="120"
      @scrolltolower="loadMore"
    >
      <view v-if="items.length > 0" class="works-grid">
        <view
          v-for="item in items"
          :key="item.task_id"
          class="work-card"
          @click="openWork(item)"
        >
          <image
            v-if="item.image_url"
            :src="item.image_url"
            class="work-image"
            mode="aspectFill"
          />
          <view v-else class="work-placeholder">
            <AuraIcon name="image" :size="52" />
            <text>{{ getStatusText(item.status) }}</text>
          </view>
          <view class="work-info">
            <text class="prompt">{{ item.prompt }}</text>
            <text class="meta">消耗 {{ item.cost }} 算力</text>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty">
        <AuraIcon name="works" :size="92" glow />
        <text class="empty-title">还没有作品</text>
        <text class="empty-desc">灵感准备好了，去创作一张吧</text>
      </view>

      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="!hasMore && items.length > 0" class="loading">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AuraIcon from '@/components/AuraIcon.vue'
import { useHistoryStore, type HistoryItem } from '@/stores/historyStore'
import { client } from '@/services/uniClient'

const historyStore = useHistoryStore()

const filters = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '生成中', value: 'processing' },
  { label: '失败', value: 'failed' },
]

const currentFilter = ref('all')
const loading = ref(false)
const hasMore = ref(true)

const items = computed(() => {
  if (currentFilter.value === 'all' || currentFilter.value === 'image') {
    return historyStore.items
  }
  return historyStore.items.filter((item) => item.status === currentFilter.value)
})

const goHistory = () => {
  uni.navigateTo({ url: '/pages/history/history' })
}

const switchFilter = (filter: string) => {
  currentFilter.value = filter
}

const openWork = (item: HistoryItem) => {
  if (item.status === 'success' || item.status === 'processing' || item.status === 'pending') {
    uni.navigateTo({ url: `/pages/task-result/task-result?taskId=${item.task_id}` })
    return
  }
  uni.showToast({ title: '该作品生成失败', icon: 'none' })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '排队中',
    processing: '生成中',
    failed: '生成失败',
  }
  return statusMap[status] || '暂无预览'
}

const loadWorks = async () => {
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
    console.error('加载作品失败:', error)
    uni.showToast({ title: '加载作品失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadWorks()
}

onMounted(() => {
  if (historyStore.items.length === 0) {
    historyStore.reset()
    hasMore.value = true
    loadWorks()
  }
})
</script>

<style scoped lang="scss">
.works-container {
  min-height: 100vh;
  background: #0A0A0A;
  padding: 82rpx 28rpx 150rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;

  .title {
    color: #fff;
    font-size: 46rpx;
    font-weight: 800;
  }

  .action {
    padding: 14rpx 24rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.82);
    font-size: 26rpx;
  }
}

.filters {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;

  .filter {
    padding: 14rpx 24rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.58);
    font-size: 26rpx;

    &.active {
      background: rgba(255, 255, 255, 0.94);
      color: #111827;
      box-shadow: 0 0 28rpx rgba(99, 102, 241, 0.36);
    }
  }
}

.works-scroll {
  height: calc(100vh - 220rpx);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  padding-bottom: 24rpx;
}

.work-card {
  min-width: 0;
  border-radius: 18rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.07);

  .work-image,
  .work-placeholder {
    width: 100%;
    aspect-ratio: 1;
  }

  .work-image {
    display: block;
  }

  .work-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    color: rgba(255, 255, 255, 0.42);
    font-size: 22rpx;
    background: rgba(255, 255, 255, 0.04);
  }

  .work-info {
    padding: 12rpx;
  }

  .prompt {
    display: block;
    color: rgba(255, 255, 255, 0.82);
    font-size: 22rpx;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: block;
    margin-top: 6rpx;
    color: rgba(255, 255, 255, 0.38);
    font-size: 20rpx;
  }
}

.empty {
  min-height: 55vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  color: rgba(255, 255, 255, 0.56);

  .empty-title {
    margin-top: 10rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
  }

  .empty-desc {
    font-size: 24rpx;
  }
}

.loading {
  padding: 36rpx 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
}
</style>
