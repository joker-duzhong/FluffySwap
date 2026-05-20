<template>
  <view class="detail-page">
    <AppTopNav title="模板详情" back @back="goBack" />

    <PageSkeleton v-if="loading" variant="detail" :rows="1" />
    <view v-else-if="detail" class="image-wrap" @click="togglePromptPanel">
      <image class="poster-image" :src="detail.resource?.url" mode="widthFix" />
    </view>
    <EmptyState v-else-if="!loading" title="模板不存在" description="请返回模板页重新选择。" />

    <PromptPanel v-if="detail && showPromptPanel" :prompt="detail.prompt" :model="detail.model_name"
      :thumb="detail.resource?.thumb_url || undefined" @reference="createWithReference" @same="createSame" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { aurakeyApi, type GalleryDetail } from '@/services/aurakey'
import { useTaskStore } from '@/stores/taskStore'
import PromptPanel from './components/PromptPanel.vue'

const taskStore = useTaskStore()
const detail = ref<GalleryDetail | null>(null)
const loading = ref(false)
const showPromptPanel = ref(true)

const goBack = () => uni.navigateBack()

const togglePromptPanel = () => {
  showPromptPanel.value = !showPromptPanel.value
}

const getPageOption = (key: string) => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  return currentPage?.options?.[key] || ''
}

const createSame = () => {
  if (!detail.value) return
  taskStore.applyPreset(detail.value.prompt, detail.value.aspect_ratio, detail.value.model_name)
  uni.navigateTo({ url: `/pages/history/record?openCreate=1&from=same&id=${detail.value.id}` })
}

const createWithReference = () => {
  if (!detail.value) return
  taskStore.applyPreset(detail.value.prompt, detail.value.aspect_ratio, detail.value.model_name, [detail.value.resource])
  uni.navigateTo({ url: `/pages/history/record?openCreate=1&from=reference&id=${detail.value.id}` })
}

const loadDetail = async () => {
  const id = getPageOption('id')
  if (!id) return

  loading.value = true
  try {
    detail.value = await aurakeyApi.gallery.detail(id)
    showPromptPanel.value = true
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped lang="scss">
.detail-page {
  height: 100vh;
  background: #050506;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-wrap {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
}

.poster-image {
  width: 100%;
  display: block;
}

.loading {
  padding-top: 260rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.46);
  font-size: 26rpx;
}
</style>
