<template>
  <view class="empty-state">
    <image class="spark" :src="ASSETS.sparkLarge" mode="aspectFit" />
    <text class="title">{{ title }}</text>
    <text v-if="description" class="description">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
import { ASSETS } from '@/config/assets'

defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped lang="scss">
.empty-state {
  min-height: 300rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.spark {
  width: 100rpx;
  height: 100rpx;
  opacity: 0.52;
}

.title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
}

.description {
  max-width: 460rpx;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
  line-height: 1.5;
  text-align: center;
}
</style>
