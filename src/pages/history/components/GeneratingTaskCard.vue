<template>
  <view class="generating-card" :class="size">
    <view class="orb-stage">
      <view class="orb-track">
        <view class="orb orb-cyan"></view>
        <view class="orb orb-indigo"></view>
      </view>
    </view>
    <div class="mask"></div>
    <view class="progress">
      <text class="percent">{{ safeProgress }}%</text>
      <text class="label">{{ label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  progress?: number | null
  label?: string
  size?: 'compact' | 'large'
}>(), {
  progress: 40,
  label: 'AI绘图中...',
  size: 'large',
})

const safeProgress = computed(() => {
  const progress = Number(props.progress || 0)
  if (!Number.isFinite(progress) || progress <= 0) return 40
  return Math.min(100, Math.round(progress))
})
</script>

<style scoped lang="scss">
.generating-card {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 16rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 76% 18%, rgba(255, 255, 255, 0.06), transparent 34%),
    linear-gradient(135deg, #24252b 0%, #17181e 100%);
}

.orb-stage {
  position: absolute;
  inset: 0;
}

.mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(225deg, rgba(38, 38, 43, 0) 0%, rgba(38, 38, 43, 0.6) 50%, rgba(38, 38, 43, 0) 100%);
  backdrop-filter: blur(50px);
  border-radius: 16rpx;
}

.orb-track {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 300rpx;
  height: 300rpx;
  margin-left: -150rpx;
  margin-top: -150rpx;
  animation: orbit 12s linear infinite;
}

.orb {
  position: absolute;
  border-radius: 50%;
}

.orb-cyan {
  left: 24rpx;
  top: 132rpx;
  width: 164rpx;
  height: 164rpx;
  background: #53fff6;
}

.orb-indigo {
  right: 0;
  top: 0;
  width: 224rpx;
  height: 224rpx;
  background: #1e2159;
}

.progress {
  position: absolute;
  left: 34rpx;
  bottom: 42rpx;
  display: flex;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.64);
  font-size: 28rpx;
  line-height: 38rpx;
}

.percent {
  color: #fff;
  font-size: 48rpx;
  line-height: 66rpx;
}

.compact {
  width: 100%;
  height: 100%;
  min-height: 100%;
  border-radius: 0;

  .orb-track {
    width: 156rpx;
    height: 156rpx;
    margin-left: -78rpx;
    margin-top: -78rpx;
  }

  .orb-cyan {
    left: 12rpx;
    top: 70rpx;
    width: 84rpx;
    height: 84rpx;
  }

  .orb-indigo {
    width: 118rpx;
    height: 118rpx;
  }

  .progress {
    left: 18rpx;
    bottom: 20rpx;
    font-size: 20rpx;
    line-height: 28rpx;
  }

  .percent {
    font-size: 36rpx;
    line-height: 44rpx;
  }
}

@keyframes orbit {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
