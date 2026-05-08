<template>
  <view class="page-skeleton" :class="variant">
    <view v-for="index in rows" :key="index" class="skeleton-row"></view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  variant?: 'list' | 'grid' | 'detail'
}>(), {
  rows: 4,
  variant: 'list',
})
</script>

<style scoped lang="scss">
.page-skeleton {
  display: grid;
  gap: 18rpx;
  padding: 24rpx 28rpx;
}

.page-skeleton.grid {
  grid-template-columns: repeat(2, 1fr);

  .skeleton-row {
    height: 324rpx;
  }
}

.page-skeleton.detail {
  .skeleton-row {
    height: 560rpx;
  }
}

.skeleton-row {
  height: 128rpx;
  border-radius: 18rpx;
  background: linear-gradient(110deg, rgba(255, 255, 255, 0.07) 8%, rgba(255, 255, 255, 0.13) 18%, rgba(255, 255, 255, 0.07) 33%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}
</style>
