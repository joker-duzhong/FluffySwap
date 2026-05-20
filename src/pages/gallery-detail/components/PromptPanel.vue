<template>
  <view class="prompt-panel">
    <div class="panel-top"></div>
    <div class="prompt-card">
      <view class="prompt-title">
        <text>提示词</text>
        <view class="meta">
          <image v-if="thumb" :src="thumb" mode="aspectFill" />
          <text>参考图 | {{ model }}</text>
        </view>
      </view>
      <text class="prompt-text">{{ prompt }}</text>
    </div>

    <view class="actions">
      <button class="copy-btn" @click="$emit('reference')">作为参考图</button>
      <button class="same-btn" @click="$emit('same')">
        <image :src="ASSETS.iconSame" mode="aspectFit" class="icon" />
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
  (event: 'reference'): void
  (event: 'same'): void
}>()
</script>

<style scoped lang="scss">
.prompt-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  padding: 24rpx;
  border-radius: 28rpx;
  background: rgba(31, 31, 33, 0.94);
  overflow: hidden;
  z-index: 20;

  .panel-top {
    text-align: center;
    width: 30px;
    height: 1px;
    background: #fff;
    margin: 0 auto 10px;
  }
}

.prompt-card {
  border-radius: 24rpx;
  background: #FFFFFF1A;
  padding: 24rpx;
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
  border-bottom: 1px solid #FFFFFF0D
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
  max-height: 30vh;
  overflow: auto;
  padding: 20rpx 24rpx 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 24rpx;
  line-height: 1.55;
}

.actions {
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 18rpx;
}

.copy-btn,
.same-btn {
  height: 104rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 104rpx;
  font-size: 30rpx;
  font-weight: 700;

  .icon {
    width: 32rpx;
    height: 32rpx;
  }
}

.copy-btn {
  color: #fff;
  background: transparent;
  border: 0.5px solid #FFFFFF33;
}

.same-btn {
  gap: 14rpx;
  color: #fff;
  background: radial-gradient(82.42% 100% at 50.22% 100%, #5EE2FF 0%, #3850FF 100%);
  box-shadow: 0px 0px 10px 1px #91C4FFE5 inset;
  border: 0.5px solid #0000004D;

  image {
    width: 28rpx;
    height: 28rpx;
  }
}
</style>
