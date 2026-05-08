<template>
  <view class="prompt-panel">
    <view class="prompt-title">
      <text>提示词</text>
      <view class="meta">
        <image v-if="thumb" :src="thumb" mode="aspectFill" />
        <text>参考图 | {{ model }}</text>
      </view>
    </view>
    <text class="prompt-text">{{ prompt }}</text>
    <view class="actions">
      <button class="copy-btn" @click="$emit('copy')">复制</button>
      <button class="same-btn" @click="$emit('same')">
        <image :src="ASSETS.iconSpark" mode="aspectFit" />
        <text>做同款</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ASSETS } from '@/config/assets'

defineProps<{
  prompt: string
  model: string
  thumb?: string
}>()

defineEmits<{
  (event: 'copy'): void
  (event: 'same'): void
}>()
</script>

<style scoped lang="scss">
.prompt-panel {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(38rpx + env(safe-area-inset-bottom));
  padding: 0 0 20rpx;
  border-radius: 28rpx;
  background: rgba(31, 31, 33, 0.94);
  overflow: hidden;
  z-index: 20;
}

.prompt-title {
  height: 74rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  background: linear-gradient(90deg, rgba(86, 72, 38, 0.95), rgba(54, 50, 42, 0.9));
}

.meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  font-weight: 400;

  image {
    width: 30rpx;
    height: 30rpx;
    border-radius: 6rpx;
  }
}

.prompt-text {
  display: block;
  min-height: 94rpx;
  padding: 20rpx 24rpx 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 24rpx;
  line-height: 1.55;
}

.actions {
  margin-top: 20rpx;
  padding: 0 24rpx;
  display: grid;
  grid-template-columns: 1fr 1.7fr;
  gap: 18rpx;
}

.copy-btn,
.same-btn {
  height: 88rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 88rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.copy-btn {
  color: #fff;
  background: transparent;
  border: 1rpx solid rgba(255, 255, 255, 0.16);
}

.same-btn {
  gap: 14rpx;
  color: #fff;
  background: linear-gradient(180deg, #5a64ff 0%, #3e98ff 100%);

  image {
    width: 28rpx;
    height: 28rpx;
  }
}
</style>
