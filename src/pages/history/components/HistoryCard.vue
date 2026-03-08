<template>
  <view class="history-card" @tap="$emit('tap')">
    <!-- 图片容器 -->
    <view class="relative overflow-hidden rounded-[20px] bg-white/10">
      <!-- 正在处理中的状态 -->
      <template v-if="record.isProcessing">
        <view class="processing-overlay">
          <view class="processing-content">
            <view class="processing-spinner"></view>
            <text class="text-white text-xs mt-2">正在生成中...</text>
          </view>
          <image
            :src="record.originalImage"
            mode="widthFix"
            class="w-full opacity-30"
            lazy-load
          />
        </view>
        <!-- 处理中标签 -->
        <view
          class="absolute top-2 right-2 bg-amber-500/90 px-2 py-1 rounded-full flex items-center gap-1"
        >
          <view class="processing-dot"></view>
          <text class="text-white text-[10px] font-bold">生成中</text>
        </view>
      </template>

      <!-- 已完成状态 -->
      <template v-else>
        <image
          :src="record.resultImage"
          mode="widthFix"
          class="w-full"
          lazy-load
        />

        <!-- 付费标签 -->
        <view
          v-if="record.hasPaid"
          class="absolute top-2 right-2 bg-brand-orange/90 px-2 py-1 rounded-full"
        >
          <text class="text-white text-[10px] font-bold">HD</text>
        </view>
      </template>

      <!-- 删除按钮 -->
      <view
        class="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
        @tap.stop="$emit('delete')"
      >
        <text class="text-white text-xs">✕</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="mt-2 px-1">
      <text class="text-white font-semibold text-xs block truncate">{{ record.styleName }}</text>
      <text class="text-white/50 text-[10px] block mt-1">{{ formatDate(record.createdAt) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HistoryRecord } from '@/types/history';

defineProps<{
  record: HistoryRecord;
}>();

defineEmits(['tap', 'delete']);

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
};
</script>

<style scoped>
.history-card {
  break-inside: avoid;
  margin-bottom: 4px;
}

.processing-overlay {
  position: relative;
  min-height: 120px;
}

.processing-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.processing-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}
</style>
