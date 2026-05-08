<template>
  <view class="nav-bar">
    <view class="nav-side">
      <view v-if="back" class="back-btn" @click="$emit('back')">
        <text>‹</text>
      </view>
      <slot v-else name="left"></slot>
    </view>
    <text class="title">{{ title }}</text>
    <view class="nav-side right">
      <slot name="right">
        <AppCapsule />
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppCapsule from './AppCapsule.vue'

defineProps<{
  title?: string
  back?: boolean
}>()

defineEmits<{
  (event: 'back'): void
}>()
</script>

<style scoped lang="scss">
.nav-bar {
  height: 86rpx;
  padding: 0 28rpx;
  display: grid;
  grid-template-columns: 160rpx 1fr 160rpx;
  align-items: center;
}

.nav-side {
  min-width: 0;
  display: flex;
  align-items: center;
}

.right {
  justify-content: flex-end;
}

.title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
}

.back-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 58rpx;
  line-height: 1;
}
</style>
