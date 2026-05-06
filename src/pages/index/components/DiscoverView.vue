<template>
  <view class="discover-container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">灵感</text>
      <view class="tabs">
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
    </view>

    <!-- 瀑布流画廊 -->
    <scroll-view
      class="gallery-scroll"
      scroll-y
      @scrolltolower="loadMore"
      :lower-threshold="100"
    >
      <view class="waterfall">
        <view class="column">
          <view
            v-for="item in leftColumn"
            :key="item.id"
            class="gallery-item"
            @click="viewDetail(item)"
          >
            <image :src="item.thumb_url" mode="widthFix" class="item-image" />
            <view class="item-info">
              <view class="author">
                <image :src="item.author.avatar" class="avatar" />
                <text class="nickname">{{ item.author.nickname }}</text>
              </view>
              <view class="stats">
                <text class="like" :class="{ liked: item.is_liked }">
                  {{ item.is_liked ? '❤️' : '🤍' }} {{ item.like_count }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view class="column">
          <view
            v-for="item in rightColumn"
            :key="item.id"
            class="gallery-item"
            @click="viewDetail(item)"
          >
            <image :src="item.thumb_url" mode="widthFix" class="item-image" />
            <view class="item-info">
              <view class="author">
                <image :src="item.author.avatar" class="avatar" />
                <text class="nickname">{{ item.author.nickname }}</text>
              </view>
              <view class="stats">
                <text class="like" :class="{ liked: item.is_liked }">
                  {{ item.is_liked ? '❤️' : '🤍' }} {{ item.like_count }}
                </text>
              </view>
            </view>
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
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/galleryStore'
import type { GalleryItem } from '@/stores/galleryStore'
import { client } from '@/services/uniClient'

const galleryStore = useGalleryStore()

const tabs = [
  { label: '推荐', value: 'recommend' },
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'hot' },
]

const currentTab = ref('recommend')
const loading = ref(false)
const hasMore = ref(true)

const items = computed(() => galleryStore.items)

// 瀑布流分列
const leftColumn = computed(() => {
  return items.value.filter((_, index) => index % 2 === 0)
})

const rightColumn = computed(() => {
  return items.value.filter((_, index) => index % 2 === 1)
})

const switchTab = (tab: string) => {
  currentTab.value = tab
  galleryStore.reset()
  loadGallery()
}

const loadGallery = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const res = await client.GET('/aurakey/gallery/list', {
      params: {
        query: {
          page: galleryStore.currentPage,
          pageSize: galleryStore.pageSize,
        },
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      const { items: newItems, total, page } = res.data.data
      if (page === 1) {
        galleryStore.setItems(newItems || [])
      } else {
        galleryStore.appendItems(newItems || [])
      }
      galleryStore.currentPage = page + 1
      hasMore.value = (newItems?.length || 0) >= galleryStore.pageSize
    }
  } catch (error) {
    console.error('加载画廊失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadGallery()
}

const viewDetail = (item: GalleryItem) => {
  uni.navigateTo({
    url: `/pages/gallery-detail/gallery-detail?id=${item.id}`,
  })
}

onMounted(() => {
  loadGallery()
})
</script>

<style scoped lang="scss">
.discover-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
}

.header {
  padding: 80rpx 32rpx 32rpx;
  position: sticky;
  top: 0;
  background: #0A0A0A;
  z-index: 10;

  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #fff;
    display: block;
    margin-bottom: 24rpx;
  }

  .tabs {
    display: flex;
    gap: 32rpx;

    .tab {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.6);
      padding: 8rpx 0;
      position: relative;
      transition: all 0.3s;

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
}

.gallery-scroll {
  height: calc(100vh - 280rpx);
}

.waterfall {
  display: flex;
  padding: 0 24rpx;
  gap: 16rpx;

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .gallery-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    overflow: hidden;
    backdrop-filter: blur(20rpx);

    .item-image {
      width: 100%;
      display: block;
    }

    .item-info {
      padding: 16rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .author {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .avatar {
          width: 48rpx;
          height: 48rpx;
          border-radius: 24rpx;
        }

        .nickname {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .stats {
        .like {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.6);

          &.liked {
            color: #ff4d4f;
          }
        }
      }
    }
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 40rpx;
  color: rgba(255, 255, 255, 0.3);
  font-size: 24rpx;
}
</style>
