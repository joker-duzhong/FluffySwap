<template>
  <view class="template-view">
    <view class="top-glow"></view>
    <AppTopNav>
      <template #left>
        <image class="logo" :src="ASSETS.logoWordmark" mode="aspectFit" />
      </template>
      <template #right>
        <view class="works-shortcut" @click="goHistory">
          <image class="portfolio" src="/static/portfolio.png" mode="aspectFit" />
        </view>
      </template>
    </AppTopNav>

    <scroll-view class="category-scroll" scroll-x :show-scrollbar="false">
      <view class="category-list">
        <view v-for="category in categories" :key="category.id" class="category-item"
          :class="{ active: activeCategoryId === category.id }" @click="switchCategory(category.id)">
          {{ category.name }}
        </view>
      </view>
    </scroll-view>

    <scroll-view class="template-scroll" scroll-y :class="{ empty: items.length === 0 && !loading }"
      :lower-threshold="120" @scrolltolower="loadMore" :refresher-enabled="items.length > 0"
      :refresher-triggered="refreshing" @refresherrefresh="refresh">
      <PageSkeleton v-if="loading && items.length === 0" variant="grid" :rows="6" />
      <MasonryGrid v-else-if="items.length > 0" :items="items" :content-inset="18" :item-height-offset="90"
        @item-click="openTemplate(String($event.id))" />
      <view v-else-if="!loading" class="empty-wrap">
        <EmptyState title="暂无数据" description="快去发布一条作品吧" />
      </view>
      <view v-if="loading && items.length > 0" class="loading">加载中...</view>
      <view v-else-if="!hasMore && items.length > 0" class="loading">没有更多了</view>
    </scroll-view>

    <view class="free-create" @click="$emit('create')">
      <image :src="ASSETS.createUploadImage" mode="aspectFit" class="free-create-icon" />
      <text>自由创作</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import EmptyState from '@/components/EmptyState.vue'
import MasonryGrid from '@/components/MasonryGrid.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { ASSETS } from '@/config/assets'
import { aurakeyApi, type GalleryCategory, type GalleryItem } from '@/services/aurakey'

defineEmits<{
  (event: 'create'): void
}>()

const categories = ref<GalleryCategory[]>([])
const activeCategoryId = ref('')
const items = ref<GalleryItem[]>([])
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)

const ALL_CATEGORY: GalleryCategory = { id: 'all', name: '全部', sort: -1 }

const activeCategory = computed(() => categories.value.find((item) => item.id === activeCategoryId.value))

const normalizeCategories = (remoteCategories: GalleryCategory[]) => {
  const withoutAll = remoteCategories.filter((item) => item.id !== ALL_CATEGORY.id && item.name !== ALL_CATEGORY.name)
  return [ALL_CATEGORY, ...withoutAll]
}

const loadCategories = async () => {
  try {
    const remoteCategories = await aurakeyApi.categories.list()
    categories.value = normalizeCategories(remoteCategories)
    activeCategoryId.value = categories.value[0]?.id || ''
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载分类失败', icon: 'none' })
    categories.value = normalizeCategories([])
    activeCategoryId.value = 'all'
  }
}

const loadTemplates = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return

  loading.value = true
  try {
    const page = reset ? 1 : currentPage.value
    const data = await aurakeyApi.gallery.list(page, pageSize)
    const nextItems = data.items || []
    items.value = page === 1 ? nextItems : items.value.concat(nextItems)
    currentPage.value = page + 1
    hasMore.value = nextItems.length >= pageSize
  } catch (error) {
    console.error('加载模板失败:', error)
    uni.showToast({ title: '模板加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const switchCategory = (categoryId: string) => {
  if (categoryId === activeCategoryId.value) return
  activeCategoryId.value = categoryId
  currentPage.value = 1
  hasMore.value = true
  items.value = []
  loadTemplates(true)
}

const refresh = () => {
  refreshing.value = true
  currentPage.value = 1
  hasMore.value = true
  loadTemplates(true)
}

const loadMore = () => {
  loadTemplates()
}

const openTemplate = (id: string) => {
  uni.navigateTo({ url: `/pages/gallery-detail/gallery-detail?id=${id}` })
}

const goHistory = () => {
  uni.navigateTo({ url: '/pages/history/record' })
}

const getCardTitle = (item: GalleryItem) => {
  if (activeCategoryId.value === ALL_CATEGORY.id) return item.prompt || '模板'
  return activeCategory.value?.name || item.prompt || '电商海报'
}

onMounted(async () => {
  await loadCategories()
  loadTemplates(true)
})
</script>

<style scoped lang="scss">
.template-view {
  position: relative;
  height: 100vh;
  background: #050506;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.top-glow {
  position: absolute;
  left: 0;
  top: 0;
  width: 360rpx;
  height: 280rpx;
  background: radial-gradient(circle at 0 0, rgba(31, 111, 255, 0.22), transparent 68%);
  pointer-events: none;
}

.logo {
  width: 116rpx;
  height: 48rpx;
}

.works-shortcut {
  padding: 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E7E7E733;

  .portfolio {
    width: 32rpx;
    height: 32rpx;
  }
}

.category-scroll {
  position: relative;
  z-index: 1;
  white-space: nowrap;
  flex: 0 0 auto;
}

.category-list {
  display: inline-flex;
  padding: 22rpx 28rpx 28rpx;
}

.category-item {
  height: 52rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  border-radius: 14rpx;
  color: rgba(255, 255, 255, 0.58);
  font-size: 28rpx;
  background: transparent;

  &.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.16);
  }
}

.template-scroll {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  height: auto;
  // padding-bottom: calc(116rpx + env(safe-area-inset-bottom));

  &.empty {
    height: auto;
    padding-bottom: 0;
  }
}

.empty-wrap {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.free-create {
  position: fixed;
  left: 50%;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  width: 462rpx;
  height: 96rpx;
  transform: translateX(-50%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  background: radial-gradient(82.42% 100% at 50.22% 100%, #5EE2FF 0%, #3850FF 100%);
  border: 0.5px solid #0000004D;
  box-shadow: 0px 0px 4px 0px #00000033 0px 0px 10px 1px rgba(145, 196, 255, 0.8980392157) inset;
  z-index: 1001;

  .free-create-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 16rpx;
  }
}

.loading {
  padding: 34rpx 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
}
</style>
