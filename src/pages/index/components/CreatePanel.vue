<template>
  <view class="create-panel-mask" @click="handleMaskClick">
    <view class="create-panel" @click.stop>
      <!-- 顶部拖拽条 -->
      <view class="drag-bar">
        <view class="bar"></view>
      </view>

      <!-- 关闭按钮 -->
      <view class="close-btn" @click="$emit('close')">
        <AuraIcon name="close" :size="34" />
      </view>

      <!-- 标题 -->
      <view class="panel-header">
        <text class="title">创作台</text>
        <view class="balance">
          <text class="label">我的算力：</text>
          <text class="value">{{ balance }}</text>
        </view>
      </view>

      <!-- 输入区域 -->
      <view class="input-section">
        <textarea
          v-model="prompt"
          class="prompt-input"
          placeholder="描述你想要生成的画面..."
          :maxlength="1000"
          :auto-height="false"
        />
        <view class="input-footer">
          <text class="char-count">{{ prompt.length }}/1000</text>
          <view class="actions">
            <view class="action-btn" @click="clearPrompt">
              <text>清空</text>
            </view>
            <view class="action-btn magic" @click="handleMagic">
              <AuraIcon name="wand" :size="28" />
              <text>魔法棒</text>
            </view>
            <view class="action-btn voice" @click="showVoiceInput = true">
              <AuraIcon name="mic" :size="28" />
              <text>语音</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 尺寸比例 -->
      <view class="param-section">
        <text class="param-label">尺寸比例</text>
        <view class="ratio-options">
          <view
            v-for="ratio in aspectRatios"
            :key="ratio.value"
            class="ratio-item"
            :class="{ active: selectedRatio === ratio.value }"
            @click="selectRatio(ratio.value)"
          >
            <view class="ratio-icon">{{ ratio.icon }}</view>
            <text class="ratio-label">{{ ratio.label }}</text>
          </view>
        </view>
      </view>

      <!-- 模型选择 -->
      <view class="param-section">
        <text class="param-label">模型选择</text>
        <view class="model-select" @click="showModelPicker = true">
          <view class="model-left">
            <text class="model-name">{{ selectedModelName }}</text>
            <text v-if="selectedModelCost" class="model-cost">耗 {{ selectedModelCost }} 算力/次</text>
          </view>
          <text class="arrow">⌄</text>
        </view>
      </view>

      <!-- 生成按钮 -->
      <view class="generate-section">
        <button
          class="generate-btn"
          :class="{ disabled: !canGenerate }"
          :disabled="!canGenerate"
          @click="handleGenerate"
        >
          <AuraIcon name="wand" :size="34" />
          <text class="btn-text">开始创作 (耗 {{ cost }} 算力)</text>
        </button>
      </view>

      <!-- 模型选择器弹窗 -->
      <view v-if="showModelPicker" class="picker-mask" @click="showModelPicker = false">
        <view class="picker-panel" @click.stop>
          <view class="picker-header">
            <text class="picker-title">选择模型</text>
            <view class="picker-close" @click="showModelPicker = false">
              <AuraIcon name="close" :size="34" />
            </view>
          </view>
          <view class="model-list">
            <view
              v-for="model in models"
              :key="model.model_id"
              class="model-item"
              :class="{ active: selectedModel === model.model_id }"
              @click="selectModel(model.model_id)"
            >
              <view class="model-info">
                <text class="model-name">{{ model.name }}</text>
                <text v-if="model.is_vip_only" class="vip-badge">VIP</text>
              </view>
              <text class="model-cost">{{ model.cost }} 算力/次</text>
            </view>
          </view>
        </view>
      </view>

      <VoiceInputSheet
        v-if="showVoiceInput"
        @close="showVoiceInput = false"
        @finished="handleVoiceFinished"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AuraIcon from '@/components/AuraIcon.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { ASPECT_RATIOS } from '@/config'
import { client } from '@/services/uniClient'
import VoiceInputSheet from './VoiceInputSheet.vue'

const emit = defineEmits(['close'])

const taskStore = useTaskStore()
const authStore = useAuthStore()

const prompt = computed({
  get: () => taskStore.prompt,
  set: (val) => taskStore.setPrompt(val),
})

const selectedRatio = computed(() => taskStore.selectedRatio)
const selectedModel = computed(() => taskStore.selectedModel)
const canGenerate = computed(() => taskStore.canGenerate)
const balance = computed(() => authStore.balance)

const aspectRatios = ASPECT_RATIOS
const showModelPicker = ref(false)
const showVoiceInput = ref(false)

const models = computed(() => taskStore.options?.models || [])
const selectedModelName = computed(() => {
  const model = models.value.find((m) => m.model_id === selectedModel.value)
  return model?.name || '请选择模型'
})

const cost = computed(() => {
  const model = models.value.find((m) => m.model_id === selectedModel.value)
  return model?.cost || 0
})
const selectedModelCost = computed(() => cost.value)

const selectRatio = (ratio: string) => {
  taskStore.setRatio(ratio)
}

const selectModel = (modelId: string) => {
  taskStore.setModel(modelId)
  showModelPicker.value = false
}

const clearPrompt = () => {
  taskStore.setPrompt('')
}

const handleMagic = () => {
  const rawPrompt = prompt.value.trim()
  if (!rawPrompt) {
    uni.showToast({ title: '先输入一点画面描述', icon: 'none' })
    return
  }

  const polishedPrompt = [
    rawPrompt,
    'masterpiece, best quality, cinematic lighting, ultra high resolution',
    'delicate details, rich texture, coherent composition, atmospheric depth',
  ].join(', ')

  taskStore.setPrompt(polishedPrompt.slice(0, 1000))
  uni.showToast({ title: '已先用本地模板润色', icon: 'success' })
}

const handleVoiceFinished = (text: string) => {
  showVoiceInput.value = false
  if (text) {
    taskStore.setPrompt(`${prompt.value}${prompt.value ? '，' : ''}${text}`)
  }
}

const handleGenerate = async () => {
  if (!prompt.value.trim()) {
    uni.showToast({ title: '请输入画面描述', icon: 'none' })
    return
  }

  if (!selectedModel.value) {
    uni.showToast({ title: '请选择模型', icon: 'none' })
    return
  }

  // 检查算力
  if (balance.value < cost.value) {
    uni.showModal({
      title: '算力不足',
      content: '您的算力不足，是否前往充值？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/recharge/recharge' })
        }
      },
    })
    return
  }

  try {
    taskStore.startGenerating()

    const res = await client.POST('/aurakey/task/generate', {
      body: {
        prompt: prompt.value.trim(),
        model_name: selectedModel.value,
        aspect_ratio: selectedRatio.value,
      },
    })

    if (res.data?.code === 200 && res.data.data) {
      const { task_id, balance_after } = res.data.data
      authStore.updateBalance(balance_after)

      // 跳转到结果页并开始轮询
      emit('close')
      uni.navigateTo({
        url: `/pages/task-result/task-result?taskId=${task_id}`,
      })
    } else {
      throw new Error(res.data?.message || '提交任务失败')
    }
  } catch (error: any) {
    console.error('生成失败:', error)
    uni.showToast({ title: error.message || '生成失败', icon: 'none' })
  } finally {
    taskStore.stopGenerating()
  }
}

const handleMaskClick = () => {
  emit('close')
}

// 加载模型选项
const loadOptions = async () => {
  try {
    const res = await client.GET('/aurakey/task/options')
    if (res.data?.code === 200 && res.data.data) {
      taskStore.setOptions(res.data.data)
      const supportedRatios = res.data.data.aspect_ratios || []
      if (supportedRatios.length > 0) {
        const firstSupported = aspectRatios.find((ratio) => supportedRatios.includes(ratio.value))
        if (firstSupported && !supportedRatios.includes(selectedRatio.value)) {
          taskStore.setRatio(firstSupported.value)
        }
      }
    }
  } catch (error) {
    console.error('加载选项失败:', error)
  }
}

onMounted(() => {
  loadOptions()
})
</script>

<style scoped lang="scss">
.create-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.create-panel {
  width: 100%;
  max-height: 74vh;
  overflow-y: auto;
  background: rgba(24, 26, 34, 0.94);
  backdrop-filter: blur(40rpx);
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx 28rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  position: relative;
  animation: slideUp 0.3s ease-out;
  border-top: 1rpx solid rgba(255, 255, 255, 0.12);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drag-bar {
  position: absolute;
  top: 16rpx;
  left: 50%;
  transform: translateX(-50%);

  .bar {
    width: 80rpx;
    height: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4rpx;
  }
}

.close-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-header {
  margin-top: 40rpx;
  margin-bottom: 32rpx;

  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    display: block;
    margin-bottom: 16rpx;
  }

  .balance {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
    }

    .value {
      font-size: 28rpx;
      font-weight: 500;
      background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}

.input-section {
  margin-bottom: 32rpx;

  .prompt-input {
    width: 100%;
    min-height: 200rpx;
    max-height: 300rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    padding: 24rpx;
    color: #fff;
    font-size: 28rpx;
    line-height: 1.6;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16rpx;

    .char-count {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.3);
    }

    .actions {
      display: flex;
      gap: 16rpx;

      .action-btn {
        padding: 12rpx 18rpx;
        border-radius: 24rpx;
        font-size: 24rpx;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 8rpx;

        &.magic {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(181, 55, 255, 0.2) 100%);
        }
      }
    }
  }
}

.param-section {
  margin-bottom: 32rpx;

  .param-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-bottom: 16rpx;
  }

  .ratio-options {
    display: flex;
    gap: 16rpx;

    .ratio-item {
      flex: 1;
      padding: 24rpx 16rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;

      &.active {
        border-color: #36C5FF;
        background: linear-gradient(135deg, rgba(20, 184, 255, 0.16), rgba(139, 92, 246, 0.16));
      }

      .ratio-icon {
        font-size: 32rpx;
      }

      .ratio-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .model-select {
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .model-left {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .model-name {
        font-size: 28rpx;
        color: #fff;
      }

      .model-cost {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.42);
      }
    }

    .arrow {
      font-size: 40rpx;
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.generate-section {
  .generate-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
    border-radius: 48rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.3);

    .btn-text {
      font-size: 30rpx;
      font-weight: 500;
      color: #fff;
    }

    &.disabled {
      opacity: 0.5;
      box-shadow: none;
    }
  }
}

.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3000;
  display: flex;
  align-items: flex-end;
}

.picker-panel {
  width: 100%;
  max-height: 50vh;
  background: rgba(18, 18, 18, 0.98);
  backdrop-filter: blur(40rpx);
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .picker-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
    }

    .picker-close {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .model-list {
    .model-item {
      padding: 24rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 2rpx solid transparent;

      &.active {
        border-color: #00D4FF;
        background: rgba(0, 212, 255, 0.1);
      }

      .model-info {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .model-name {
          font-size: 28rpx;
          color: #fff;
        }

        .vip-badge {
          padding: 4rpx 12rpx;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 8rpx;
          font-size: 20rpx;
          color: #000;
          font-weight: bold;
        }
      }

      .model-cost {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}
</style>
