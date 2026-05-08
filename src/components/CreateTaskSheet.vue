<template>
  <view class="sheet-mask" @click="close">
    <view class="sheet" @click.stop>
      <view class="thumb-row" v-if="referenceImages.length > 0">
        <image
          v-for="(imageUrl, index) in referenceImages"
          :key="`${imageUrl}-${index}`"
          :src="imageUrl"
          mode="aspectFill"
        />
      </view>

      <view class="input-wrap">
        <view class="upload-btn" @click="chooseImage">
          <image :src="ASSETS.createUploadImage" mode="aspectFit" />
        </view>
        <textarea
          v-model="prompt"
          class="prompt-input"
          :maxlength="1000"
          auto-height
          :focus="autoFocus"
          placeholder="请输入提示词"
        />
      </view>

      <view class="options">
        <view class="option" @click="showModelPicker">{{ selectedModelName }}</view>
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
  autoFocus?: boolean
}>(), {
  presetPrompt: '',
  presetRatio: '',
  presetModel: '',
  referenceImage: '',
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

const selectedModelInfo = computed(() => options.value.find((item) => item.model_id === selectedModel.value))
const selectedModelName = computed(() => selectedModelInfo.value?.name || selectedModel.value || 'gpt-image-2')
const selectedCost = computed(() => selectedModelInfo.value?.cost || 0)
const canSubmit = computed(() => Boolean(prompt.value.trim()) && Boolean(selectedModel.value))

const close = () => {
  if (!submitting.value) emit('close')
}

const hydratePreset = () => {
  prompt.value = props.presetPrompt || taskStore.prompt
  selectedRatio.value = props.presetRatio || taskStore.selectedRatio || ratios.value[0] || '1:1'
  selectedModel.value = props.presetModel || taskStore.selectedModel || options.value[0]?.model_id || ''
  referenceImages.value = props.referenceImage ? [props.referenceImage] : []
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
  uni.chooseImage({
    count: 4,
    success: (res) => {
      referenceImages.value = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
      uni.showToast({ title: '参考图已选择，接口字段待后端接入', icon: 'none' })
    },
    fail: (error: any) => {
      if (error?.errMsg?.includes('cancel')) return
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
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

const handleSubmit = async () => {
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
    })
    authStore.updateBalance(task.balance_after)
    taskStore.applyPreset(prompt.value.trim(), selectedRatio.value, selectedModel.value)
    emit('submitted', task.task_id)
  } catch (error: any) {
    uni.showToast({ title: error.message || '提交任务失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

watch(
  () => [props.presetPrompt, props.presetRatio, props.presetModel, props.referenceImage],
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
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.58);
}

.sheet {
  width: 100%;
  min-height: 372rpx;
  padding: 22rpx 20rpx calc(24rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: rgba(20, 20, 24, 0.98);
  box-shadow: 0 -24rpx 72rpx rgba(0, 0, 0, 0.48);
}

.thumb-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin: 0 0 18rpx;

  image {
    width: 100%;
    height: 116rpx;
    border-radius: 12rpx;
    background: rgba(255, 255, 255, 0.08);
  }
}

.input-wrap {
  display: grid;
  grid-template-columns: 72rpx 1fr;
  gap: 14rpx;
  min-height: 176rpx;
}

.upload-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);

  image {
    width: 38rpx;
    height: 38rpx;
  }
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
  height: 58rpx;
  max-width: 170rpx;
  padding: 0 16rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
  background: rgba(255, 255, 255, 0.09);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
