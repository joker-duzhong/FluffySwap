<template>
  <view class="detail-page">
    <AppTopNav title="模板详情" back @back="goBack" />

    <PageSkeleton v-if="loading" variant="detail" :rows="1" />
    <view v-else-if="detail" class="image-wrap">
      <image class="poster-image" :src="detail.image_url || detail.thumb_url" mode="widthFix" />
    </view>
    <EmptyState v-else-if="!loading" title="模板不存在" description="请返回模板页重新选择。" />

    <PromptPanel
      v-if="detail"
      :prompt="detail.prompt"
      :model="detail.model_name"
      :thumb="detail.thumb_url"
      @copy="copyPrompt"
      @same="createSame"
    />
    <CreateTaskSheet
      v-if="showCreateSheet && detail"
      :preset-prompt="detail.prompt"
      :preset-ratio="detail.aspect_ratio"
      :preset-model="detail.model_name"
      :reference-image="detail.thumb_url"
      @close="showCreateSheet = false"
      @login-required="showLoginSheet = true"
      @submitted="handleTaskSubmitted"
    />
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="showLoginSheet = false" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import CreateTaskSheet from '@/components/CreateTaskSheet.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { aurakeyApi, type GalleryDetail } from '@/services/aurakey'
import { useHistoryStore } from '@/stores/historyStore'
import { useTaskStore } from '@/stores/taskStore'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'
import PromptPanel from './components/PromptPanel.vue'

const taskStore = useTaskStore()
const historyStore = useHistoryStore()
const detail = ref<GalleryDetail | null>(null)
const loading = ref(false)
const showCreateSheet = ref(false)
const showLoginSheet = ref(false)

const goBack = () => uni.navigateBack()

const getPageOption = (key: string) => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  return currentPage?.options?.[key] || ''
}

const copyPrompt = () => {
  if (!detail.value) return
  uni.setClipboardData({
    data: detail.value.prompt,
    success: () => uni.showToast({ title: '已复制', icon: 'success' }),
  })
}

const createSame = () => {
  if (!detail.value) return
  taskStore.applyPreset(detail.value.prompt, detail.value.aspect_ratio, detail.value.model_name)
  showCreateSheet.value = true
}

const handleTaskSubmitted = (taskId: string) => {
  showCreateSheet.value = false
  historyStore.trackSubmittedTask(taskId, {
    prompt: taskStore.prompt || '生成中',
    model_name: taskStore.selectedModel,
    aspect_ratio: taskStore.selectedRatio,
  })
  uni.navigateTo({ url: `/pages/history/history?taskId=${taskId}` })
}

const loadDetail = async () => {
  const id = getPageOption('id')
  if (!id) return

  loading.value = true
  try {
    detail.value = await aurakeyApi.gallery.detail(id)
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
