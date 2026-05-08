<template>
  <view class="task-page">
    <AppStatusBar />
    <AppNavBar :title="pageTitle" :back="mode !== 'create'" @back="goBack">
      <template #left>
        <view v-if="mode === 'create'" class="nav-spacer"></view>
      </template>
      <template #right>
        <AppCapsule v-if="mode !== 'create'" />
      </template>
    </AppNavBar>

    <scroll-view v-if="mode === 'create'" class="create-scroll" scroll-y>
      <view class="create-spacer"></view>
    </scroll-view>

    <view v-else-if="isGenerating" class="generating">
      <view class="skeleton"></view>
      <view class="progress-card">
        <text class="percent">{{ progress }}%</text>
        <text>AI绘图中...</text>
      </view>
    </view>

    <view v-else-if="isFailed" class="failed">
      <text class="failed-title">生成失败</text>
      <text class="failed-desc">{{ failedReason }}</text>
    </view>

    <scroll-view v-else class="result-scroll" scroll-y>
      <view v-if="resultImage" class="result-card">
        <image class="result-image" :src="resultImage" mode="widthFix" @click="previewImage" />
        <view class="result-actions">
          <button @click="handleRegenerate">重新编辑</button>
          <button @click="handleRegenerate">再次生成</button>
          <button @click="handleDownload">保存</button>
          <button @click="showSharePoster = true">分享海报</button>
        </view>
      </view>
      <EmptyState v-else title="暂无结果" description="输入提示词后开始生成。" />
    </scroll-view>

    <GenerationComposer
      v-if="mode === 'create' || isSuccess"
      v-model:prompt="prompt"
      :model-name="selectedModelName"
      :ratio="selectedRatio"
      :can-send="canSend"
      :expanded="mode === 'create'"
      @send="handleGenerate"
      @focus="mode = 'create'"
      @upload="chooseImage"
      @model="showModelPicker"
      @ratio="showRatioPicker"
    />
    <WorkSharePoster
      v-if="showSharePoster && resultImage"
      :image-url="resultImage"
      :prompt="prompt"
      :task-id="taskId"
      @close="showSharePoster = false"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppCapsule from '@/components/AppCapsule.vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppStatusBar from '@/components/AppStatusBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ASPECT_RATIOS } from '@/config'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { aurakeyApi, type TaskModelOption } from '@/services/aurakey'
import GenerationComposer from './components/GenerationComposer.vue'
import WorkSharePoster from './components/WorkSharePoster.vue'

const authStore = useAuthStore()
const taskStore = useTaskStore()

const mode = ref<'create' | 'result'>('result')
const taskId = ref('')
const status = ref<'pending' | 'processing' | 'success' | 'failed'>('pending')
const progress = ref(0)
const resultImage = ref('')
const failedReason = ref('')
const options = ref<TaskModelOption[]>([])
const ratios = ref<string[]>(ASPECT_RATIOS.map((item) => item.value))
const showSharePoster = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const prompt = computed({
  get: () => taskStore.prompt,
  set: (value) => taskStore.setPrompt(value),
})
const selectedRatio = computed(() => taskStore.selectedRatio)
const selectedModel = computed(() => taskStore.selectedModel)
const selectedModelName = computed(() => options.value.find((item) => item.model_id === selectedModel.value)?.name || selectedModel.value || 'gpt-image-2')
const selectedCost = computed(() => options.value.find((item) => item.model_id === selectedModel.value)?.cost || 0)
const canSend = computed(() => Boolean(prompt.value.trim()) && Boolean(selectedModel.value))

const isGenerating = computed(() => status.value === 'pending' || status.value === 'processing')
const isSuccess = computed(() => status.value === 'success' || Boolean(resultImage.value))
const isFailed = computed(() => status.value === 'failed')
const pageTitle = computed(() => mode.value === 'create' ? '' : 'Title text')

const goBack = () => uni.navigateBack()

const getPageOption = (key: string) => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  return currentPage?.options?.[key] || ''
}

const loadOptions = async () => {
  try {
    const data = await aurakeyApi.task.options()
    options.value = data.models || []
    ratios.value = data.aspect_ratios?.length ? data.aspect_ratios : ratios.value
    taskStore.setOptions(data)
  } catch (error) {
    console.error('加载生成选项失败:', error)
  }
}

const handleGenerate = async () => {
  if (!prompt.value.trim()) {
    uni.showToast({ title: '请输入提示词', icon: 'none' })
    return
  }
  if (!authStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  if (selectedCost.value > 0 && authStore.balance < selectedCost.value) {
    uni.navigateTo({ url: '/pages/recharge/recharge' })
    return
  }

  try {
    const task = await aurakeyApi.task.generate({
      prompt: prompt.value.trim(),
      model_name: selectedModel.value,
      aspect_ratio: selectedRatio.value,
    })
    authStore.updateBalance(task.balance_after)
    taskId.value = task.task_id
    mode.value = 'result'
    status.value = 'pending'
    progress.value = 0
    startPolling()
  } catch (error: any) {
    uni.showToast({ title: error.message || '生成失败', icon: 'none' })
  }
}

const pollTask = async () => {
  if (!taskId.value) return
  try {
    const data = await aurakeyApi.task.status(taskId.value)
    status.value = data.status as any
    progress.value = data.progress || 0
    if (data.status === 'success' && data.image_url) {
      resultImage.value = data.image_url
      stopPolling()
    }
    if (data.status === 'failed') {
      failedReason.value = data.failed_reason || '生成失败，请重试'
      stopPolling()
    }
  } catch (error) {
    console.error('轮询任务失败:', error)
  }
}

const startPolling = () => {
  stopPolling()
  pollTask()
  pollTimer = setInterval(pollTask, 2000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const previewImage = () => {
  if (resultImage.value) uni.previewImage({ urls: [resultImage.value] })
}

const handleDownload = () => {
  if (!resultImage.value) return
  uni.downloadFile({
    url: resultImage.value,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
          fail: () => uni.showToast({ title: '保存失败，请授权相册', icon: 'none' }),
        })
      }
    },
  })
}

const handleRegenerate = () => {
  mode.value = 'create'
}

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: () => uni.showToast({ title: '参考图已选择，接口字段预留', icon: 'none' }),
  })
}

const showModelPicker = () => {
  if (options.value.length === 0) return
  uni.showActionSheet({
    itemList: options.value.map((item) => item.name),
    success: (res) => {
      const model = options.value[res.tapIndex]
      if (model) taskStore.setModel(model.model_id)
    },
  })
}

const showRatioPicker = () => {
  uni.showActionSheet({
    itemList: ratios.value,
    success: (res) => {
      taskStore.setRatio(ratios.value[res.tapIndex])
    },
  })
}

onMounted(async () => {
  await loadOptions()
  const routeMode = getPageOption('mode')
  const routeTaskId = getPageOption('taskId')
  mode.value = routeMode === 'create' || !routeTaskId ? 'create' : 'result'
  if (routeTaskId) {
    taskId.value = routeTaskId
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped lang="scss">
.task-page {
  min-height: 100vh;
  background: #050506;
  color: #fff;
}

.nav-spacer {
  width: 1rpx;
  height: 1rpx;
}

.create-scroll,
.result-scroll {
  height: calc(100vh - 160rpx);
}

.create-spacer {
  min-height: 60vh;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.06), transparent 46%);
}

.generating {
  padding: 170rpx 0 0;
}

.skeleton {
  width: 100%;
  height: 620rpx;
  background: linear-gradient(115deg, #111 0%, #1b1b1f 42%, #101010 100%);
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

.progress-card {
  margin: 36rpx 34rpx;
  height: 210rpx;
  border-radius: 18rpx;
  padding: 34rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.08);
}

.percent {
  color: #fff;
  font-size: 38rpx;
  font-weight: 800;
}

.failed {
  padding-top: 300rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
}

.failed-title {
  font-size: 36rpx;
  font-weight: 800;
}

.failed-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
}

.result-card {
  padding: 20rpx 22rpx 170rpx;
}

.result-image {
  width: 100%;
  border-radius: 12rpx;
  display: block;
}

.result-actions {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;

  button {
    height: 54rpx;
    padding: 0 8rpx;
    border-radius: 8rpx;
    color: #fff;
    font-size: 22rpx;
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>
