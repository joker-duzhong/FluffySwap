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
      <view v-else-if="items.length > 0" class="template-grid">
        <view v-for="item in items" :key="item.id" class="template-card" @click="openTemplate(item.id)">
          <text class="card-title">{{ getCardTitle(item) }}</text>
          <image class="card-image" :src="item.thumb_url" mode="aspectFill" />
        </view>
      </view>
      <view v-else-if="!loading" class="empty-wrap">
        <EmptyState title="暂无模板" description="分类已加载，模板内容会从后端画廊接口同步。" />
      </view>
      <view v-if="loading && items.length > 0" class="loading">加载中...</view>
      <view v-else-if="!hasMore && items.length > 0" class="loading">没有更多了</view>
    </scroll-view>

    <view class="free-create" @click="$emit('create')">
      <text>自由创作</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import EmptyState from '@/components/EmptyState.vue'
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
  uni.navigateTo({ url: '/pages/history/history' })
}

const getCardTitle = (item: GalleryItem) => {
  if (activeCategoryId.value === ALL_CATEGORY.id) return item.aspect_ratio || '模板'
  return activeCategory.value?.name || item.aspect_ratio || '电商海报'
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
  gap: 22rpx;
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
  padding-bottom: calc(206rpx + env(safe-area-inset-bottom));

  &.empty {
    height: auto;
    padding-bottom: 0;
  }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 0 28rpx 30rpx;
}

.empty-wrap {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-card {
  min-width: 0;
  height: 324rpx;
  padding: 18rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
}

.card-title {
  display: block;
  height: 42rpx;
  color: #fff;
  font-size: 28rpx;
  line-height: 42rpx;
  text-align: center;
}

.card-image {
  width: 100%;
  height: 244rpx;
  margin-top: 12rpx;
  display: block;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.08);
}

.free-create {
  position: fixed;
  left: 50%;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
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
  background: linear-gradient(180deg, #5a64ff 0%, #3e98ff 100%);
  box-shadow: 0 20rpx 56rpx rgba(45, 108, 255, 0.58), inset 0 2rpx 0 rgba(255, 255, 255, 0.24);
  z-index: 1001;
}

.loading {
  padding: 34rpx 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
}
</style>
