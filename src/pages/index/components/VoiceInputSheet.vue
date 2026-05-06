<template>
  <view class="voice-mask" @click="$emit('close')">
    <view class="voice-sheet" @click.stop>
      <view class="drag"></view>
      <view class="header">
        <text class="title">语音输入</text>
        <view class="close" @click="$emit('close')">
          <AuraIcon name="close" :size="34" />
        </view>
      </view>

      <view class="voice-stage" :class="{ active: pressing }">
        <view class="ring ring-a"></view>
        <view class="ring ring-b"></view>
        <view
          class="mic-button"
          @touchstart.prevent="startPress"
          @touchend.prevent="stopPress"
          @mousedown="startPress"
          @mouseup="stopPress"
        >
          <AuraIcon name="mic" :size="70" glow />
        </view>
      </view>

      <text class="status">{{ pressing ? '正在聆听...' : '按住说话，松开结束' }}</text>
      <text class="hint">语音转文字接口后续接入，现在先保留完整交互动效</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuraIcon from '@/components/AuraIcon.vue'

const emit = defineEmits<{
  close: []
  finished: [text: string]
}>()

const pressing = ref(false)

const startPress = () => {
  pressing.value = true
}

const stopPress = () => {
  if (!pressing.value) return
  pressing.value = false
  uni.showToast({ title: '语音识别接口待接入', icon: 'none' })
  emit('finished', '')
}
</script>

<style scoped lang="scss">
.voice-mask {
  position: fixed;
  inset: 0;
  z-index: 3600;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.55);
}

.voice-sheet {
  width: 100%;
  padding: 24rpx 32rpx calc(42rpx + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  background: rgba(22, 24, 31, 0.96);
  border-top: 1rpx solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(36rpx);
}

.drag {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    color: #fff;
    font-size: 34rpx;
    font-weight: 800;
  }

  .close {
    width: 58rpx;
    height: 58rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
}

.voice-stage {
  position: relative;
  width: 260rpx;
  height: 260rpx;
  margin: 52rpx auto 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .ring {
    position: absolute;
    width: 150rpx;
    height: 150rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(20, 184, 255, 0.34);
    opacity: 0;
  }

  &.active {
    .ring-a {
      animation: pulse 1.3s ease-out infinite;
    }

    .ring-b {
      animation: pulse 1.3s ease-out infinite 0.35s;
    }
  }
}

.mic-button {
  position: relative;
  z-index: 2;
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #14B8FF 0%, #8B5CF6 100%);
  box-shadow: 0 18rpx 42rpx rgba(20, 184, 255, 0.24);
}

.status,
.hint {
  display: block;
  text-align: center;
}

.status {
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.hint {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.42);
  font-size: 23rpx;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.82;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}
</style>
