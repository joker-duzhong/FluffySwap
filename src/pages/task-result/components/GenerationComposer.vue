<template>
  <view class="composer" :class="{ expanded }">
    <view class="upload-btn" @click="$emit('upload')">
      <image :src="ASSETS.createUploadImage" mode="aspectFit" />
    </view>
    <textarea
      v-model="innerPrompt"
      class="prompt-input"
      :maxlength="1000"
      auto-height
      placeholder="请输入提示词"
      @focus="$emit('focus')"
    />
    <view class="options">
      <view class="option" @click="$emit('model')">{{ modelName }} ⇄</view>
      <view class="option" @click="$emit('ratio')">{{ ratio }}</view>
      <view class="option">1K</view>
      <view class="option">+2</view>
      <button class="send-btn" :disabled="!canSend" @click="$emit('send')">生成</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ASSETS } from '@/config/assets'

const props = defineProps<{
  prompt: string
  modelName: string
  ratio: string
  canSend: boolean
  expanded?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:prompt', value: string): void
  (event: 'send'): void
  (event: 'focus'): void
  (event: 'upload'): void
  (event: 'model'): void
  (event: 'ratio'): void
}>()

const innerPrompt = computed({
  get: () => props.prompt,
  set: (value) => emit('update:prompt', value),
})
</script>

<style scoped lang="scss">
.composer {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(28rpx + env(safe-area-inset-bottom));
  min-height: 82rpx;
  padding: 16rpx;
  border-radius: 24rpx;
  display: grid;
  grid-template-columns: 54rpx 1fr;
  gap: 14rpx;
  background: rgba(31, 31, 36, 0.96);
  z-index: 20;

  &.expanded {
    min-height: 330rpx;
    align-items: start;
  }
}

.upload-btn {
  width: 54rpx;
  height: 54rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);

  image {
    width: 32rpx;
    height: 32rpx;
  }
}

.prompt-input {
  width: 100%;
  min-height: 54rpx;
  max-height: 210rpx;
  color: #fff;
  font-size: 24rpx;
  line-height: 1.5;
}

.options {
  grid-column: 1 / span 2;
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.option {
  height: 50rpx;
  padding: 0 16rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.78);
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.08);
}

.send-btn {
  margin-left: auto;
  width: 82rpx;
  height: 50rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 50rpx;
  color: #fff;
  font-size: 22rpx;
  background: #5862ff;

  &[disabled] {
    opacity: 0.45;
  }
}
</style>
