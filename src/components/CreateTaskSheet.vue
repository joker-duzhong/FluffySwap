<template>
  <view class="sheet-mask" @click="close">
    <view class="sheet" :style="sheetStyle" @click.stop>
      <view class="reference-row">
        <view v-for="(imageUrl, index) in referenceImages" :key="`${imageUrl}-${index}`" class="reference-thumb">
          <image :src="imageUrl" mode="aspectFill" />
          <view class="remove-thumb" @click.stop="removeImage(index)">×</view>
        </view>
        <view v-if="referenceImages.length < 4" class="reference-upload" @click="chooseImage">
          <image :src="ASSETS.createUploadImage" mode="aspectFit" />
        </view>
      </view>

      <view class="input-wrap">
        <textarea v-model="prompt" class="prompt-input" :maxlength="1000" :adjust-position="false"
          :show-confirm-bar="false" auto-height :focus="autoFocus" placeholder="请输入提示词"
          @keyboardheightchange="handleKeyboardHeightChange" @blur="handlePromptBlur" />
      </view>

      <view class="options">
        <view class="option model-option" @click="showModelPicker">
          <text class="model-icon">↔</text>
          <text>{{ selectedModelName }}</text>
        </view>
        <view class="option" @click="showRatioPicker">{{ selectedRatio }}</view>
        <view class="option">1K</view>
        <view class="option">✦ {{ selectedCost || 2 }}</view>
        <button class="send-btn" :disabled="!canSubmit || submitting" :loading="submitting" @click="handleSubmit">
          {{ submitting ? '提交中' : '生成' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ASPECT_RATIOS } from '@/config'
import { ASSETS } from '@/config/assets'
import { aurakeyApi, type TaskModelOption } from '@/services/aurakey'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'

const props = withDefaults(defineProps<{
  presetPrompt?: string
  presetRatio?: string
  presetModel?: string
  referenceImage?: string
  referenceImages?: string[]
  autoFocus?: boolean
}>(), {
  presetPrompt: '',
  presetRatio: '',
  presetModel: '',
  referenceImage: '',
  referenceImages: () => [],
  autoFocus: true,
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'login-required'): void
  (event: 'submitted', taskId: string): void
}>()

const authStore = useAuthStore()
const taskStore = useTaskStore()
const options = ref<TaskModelOption[]>([])
const ratios = ref<string[]>(ASPECT_RATIOS.map((item) => item.value))
const prompt = ref('')
const selectedModel = ref('')
const selectedRatio = ref('1:1')
const submitting = ref(false)
const referenceImages = ref<string[]>([])
const keyboardHeight = ref(0)

const selectedModelInfo = computed(() => options.value.find((item) => item.model_id === selectedModel.value))
const selectedModelName = computed(() => selectedModelInfo.value?.name || selectedModel.value || 'gpt-image-2')
const selectedCost = computed(() => selectedModelInfo.value?.cost || 0)
const canSubmit = computed(() => Boolean(prompt.value.trim()) && Boolean(selectedModel.value))
const sheetStyle = computed(() => ({
  bottom: keyboardHeight.value > 0 ? `${keyboardHeight.value}px` : '0px',
}))

const close = () => {
  if (!submitting.value) {
    keyboardHeight.value = 0
    emit('close')
  }
}

const hydratePreset = () => {
  prompt.value = props.presetPrompt || taskStore.prompt
  selectedRatio.value = props.presetRatio || taskStore.selectedRatio || ratios.value[0] || '1:1'
  selectedModel.value = props.presetModel || taskStore.selectedModel || options.value[0]?.model_id || ''
  const presetImages = props.referenceImages.length > 0 ? props.referenceImages : props.referenceImage ? [props.referenceImage] : taskStore.referenceImages
  referenceImages.value = presetImages.filter(Boolean)
}

const loadOptions = async () => {
  try {
    const data = await aurakeyApi.task.options()
    options.value = data.models || []
    ratios.value = data.aspect_ratios?.length ? data.aspect_ratios : ratios.value
    taskStore.setOptions(data)
    hydratePreset()
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载创作配置失败', icon: 'none' })
  }
}

const chooseImage = () => {
  if (referenceImages.value.length >= 4) {
    uni.showToast({ title: '最多选择4张参考图', icon: 'none' })
    return
  }
  uni.chooseImage({
    count: Math.max(1, 4 - referenceImages.value.length),
    success: (res) => {
      const selectedImages = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
      referenceImages.value = referenceImages.value.concat(selectedImages).slice(0, 4)
      taskStore.setReferenceImages(referenceImages.value)
      uni.showToast({ title: '参考图已选择，接口字段待后端接入', icon: 'none' })
    },
    fail: (error: any) => {
      if (error?.errMsg?.includes('cancel')) return
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
}

const removeImage = (index: number) => {
  referenceImages.value.splice(index, 1)
  taskStore.setReferenceImages(referenceImages.value)
}

const showModelPicker = () => {
  if (options.value.length === 0) {
    uni.showToast({ title: '模型配置加载中', icon: 'none' })
    return
  }
  uni.showActionSheet({
    itemList: options.value.map((item) => item.name),
    success: (res) => {
      const model = options.value[res.tapIndex]
      if (model) selectedModel.value = model.model_id
    },
  })
}

const showRatioPicker = () => {
  uni.showActionSheet({
    itemList: ratios.value,
    success: (res) => {
      selectedRatio.value = ratios.value[res.tapIndex]
    },
  })
}

const handleKeyboardHeightChange = (event: { detail?: { height?: number } }) => {
  const height = Number(event.detail?.height || 0)
  keyboardHeight.value = height > 0 ? height : 0
}

const handlePromptBlur = () => {
  keyboardHeight.value = 0
}

const handleSubmit = async () => {
  if (authStore.profileLoading) {
    uni.showToast({ title: '登录状态加载中', icon: 'none' })
    return
  }
  if (!prompt.value.trim()) {
    uni.showToast({ title: '请输入提示词', icon: 'none' })
    return
  }
  if (!authStore.isLoggedIn) {
    emit('login-required')
    return
  }
  if (selectedCost.value > 0 && authStore.balance < selectedCost.value) {
    uni.navigateTo({ url: '/pages/recharge/recharge' })
    return
  }

  submitting.value = true
  try {
    const task = await aurakeyApi.task.generate({
      prompt: prompt.value.trim(),
      model_name: selectedModel.value,
      aspect_ratio: selectedRatio.value,
      is_public: true,
    })
    authStore.updateBalance(task.balance_after)
    taskStore.applyPreset(prompt.value.trim(), selectedRatio.value, selectedModel.value, referenceImages.value)
    emit('submitted', task.task_id)
  } catch (error: any) {
    uni.showToast({ title: error.message || '提交任务失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

watch(
  () => [props.presetPrompt, props.presetRatio, props.presetModel, props.referenceImage, props.referenceImages],
  hydratePreset,
)

onMounted(() => {
  hydratePreset()
  loadOptions()
})
</script>

<style scoped lang="scss">
.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(0, 0, 0, 0.58);
}

.sheet {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  min-height: 372rpx;
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: rgba(20, 20, 24, 0.98);
  box-shadow: 0 -24rpx 72rpx rgba(0, 0, 0, 0.48);
  transition: bottom 180ms ease-out;
}

.reference-row {
  display: flex;
  gap: 12rpx;
  margin: 0 0 18rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.reference-thumb,
.reference-upload {
  position: relative;
  flex: 0 0 110rpx;
  width: 110rpx;
  height: 110rpx;
  border-radius: 14rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.reference-thumb {
  image {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.reference-upload {
  display: flex;
  align-items: center;
  justify-content: center;

  image {
    width: 40rpx;
    height: 40rpx;
  }
}

.remove-thumb {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22rpx;
  line-height: 30rpx;
  background: rgba(0, 0, 0, 0.58);
}

.input-wrap {
  min-height: 176rpx;
}

.prompt-input {
  width: 100%;
  min-height: 154rpx;
  max-height: 270rpx;
  color: #fff;
  font-size: 26rpx;
  line-height: 1.55;
}

.options {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 20rpx;
}

.option {
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  color: #FFFFFF;
  font-size: 24rpx;
  background: #FFFFFF1A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-option {
  gap: 8rpx;
}

.model-icon {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.86);
  font-size: 24rpx;
}

.send-btn {
  margin-left: auto;
  min-width: 92rpx;
  height: 58rpx;
  padding: 0 18rpx;
  border-radius: 12rpx;
  color: #fff;
  font-size: 24rpx;
  line-height: 58rpx;
  background: #5862ff;

  &[disabled] {
    opacity: 0.5;
  }
}
</style>
