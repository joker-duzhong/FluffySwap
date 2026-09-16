<template>
  <view class="sheet-mask" @click="$emit('close')">
    <view class="sheet" @click.stop>
      <view class="close" @click="$emit('close')">×</view>
      <image class="logo" :src="ASSETS.logoSymbol" mode="aspectFit" />
      <text class="title">欢迎使用灵钥</text>
      <IdentityLoginForm @logged-in="$emit('logged-in')" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ASSETS } from '@/config/assets'
import IdentityLoginForm from '@/components/IdentityLoginForm.vue'
defineEmits<{ (event: 'close'): void; (event: 'logged-in'): void }>()
</script>

<style scoped lang="scss">
.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(2rpx);
  -webkit-backdrop-filter: blur(2rpx);
}

.sheet {
  position: relative;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  min-height: 548rpx;
  padding: 48rpx 38rpx calc(34rpx + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, rgba(29, 30, 41, 0.98), rgba(18, 18, 24, 0.98));
}

.close {
  position: absolute;
  right: 38rpx;
  top: 36rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 44rpx;
  line-height: 44rpx;
}

.logo {
  width: 110rpx;
  height: 110rpx;
  margin-top: 6rpx;
}

.title {
  margin-top: 38rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

</style>
