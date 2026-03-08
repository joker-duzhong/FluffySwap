<template>
  <view class="min-h-screen bg-brand-primary relative overflow-hidden flex flex-col">

    <!-- Background Decorative Elements -->
    <view class="absolute inset-0 pointer-events-none">
      <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
      <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]"></view>
    </view>

    <!-- Top Bar -->
    <view class="pt-12 px-8 flex items-center justify-between mb-6 z-10 shrink-0">
      <view
        @tap="goBack"
        class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm"
      >
        <text class="text-white text-sm">←</text>
      </view>
      <text class="text-white font-bold tracking-widest text-xs uppercase opacity-80">我的作品</text>
      <!-- <view
        v-if="records.length > 0"
        @tap="handleClear"
        class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm"
      >
        <text class="text-white text-xs">🗑️</text>
      </view> -->
      <view class="w-10"></view>
    </view>

    <!-- Empty State -->
    <EmptyHistory v-if="records.length === 0" />

    <!-- Waterfall Grid -->
    <scroll-view
      v-else
      scroll-y
      class="px-4 pb-10 z-10 flex-1"
    >
      <view class="waterfall-container">
        <!-- Left Column -->
        <view class="waterfall-column">
          <HistoryCard
            v-for="record in leftColumn"
            :key="record.id"
            :record="record"
            @tap="handlePreview(record)"
            @delete="handleDelete(record.id)"
          />
        </view>
        <!-- Right Column -->
        <view class="waterfall-column">
          <HistoryCard
            v-for="record in rightColumn"
            :key="record.id"
            :record="record"
            @tap="handlePreview(record)"
            @delete="handleDelete(record.id)"
          />
        </view>
      </view>
    </scroll-view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { historyService } from '@/utils/history-service';
import type { HistoryRecord } from '@/types/history';
import HistoryCard from './components/HistoryCard.vue';
import EmptyHistory from './components/EmptyHistory.vue';
import { onShow } from '@dcloudio/uni-app';

const records = ref<HistoryRecord[]>([]);

// 瀑布流双列数据
const leftColumn = computed(() => {
  return records.value.filter((_, i) => i % 2 === 0);
});

const rightColumn = computed(() => {
  return records.value.filter((_, i) => i % 2 === 1);
});

const loadRecords = () => {
  records.value = historyService.getAll();
};

onMounted(() => {
  loadRecords();
});

onShow(() => {
  loadRecords();
});

const goBack = () => {
  uni.navigateBack();
};

const handlePreview = (record: HistoryRecord) => {
  // 发送事件通知 index 页面，然后返回
  uni.$emit('historySelect', { historyId: record.id });
  uni.navigateBack();
};

const handleDelete = (id: string) => {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这张作品吗？',
    success: (res) => {
      if (res.confirm) {
        historyService.remove(id);
        records.value = historyService.getAll();
        uni.showToast({ title: '已删除', icon: 'success' });
      }
    }
  });
};

const handleClear = () => {
  uni.showModal({
    title: '清空确认',
    content: '确定要清空所有历史记录吗？',
    success: (res) => {
      if (res.confirm) {
        historyService.clear();
        records.value = [];
        uni.showToast({ title: '已清空', icon: 'success' });
      }
    }
  });
};
</script>

<style scoped>
.waterfall-container {
  display: flex;
  gap: 12px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
