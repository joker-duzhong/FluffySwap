<template>
  <view class="min-h-screen flex flex-col">
    
    <!-- Top Bar -->
    <view class="flex items-center justify-between px-5 pt-14 pb-4 bg-surface/80 backdrop-blur-sm sticky top-0 z-20">
      <view @tap="$emit('back')" class="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform">
        <text class="text-ink text-lg">←</text>
      </view>
      <text class="text-ink font-extrabold text-lg tracking-tight">选择魔法画风</text>
      <view class="w-10"></view>
    </view>
    
    <!-- Grid of Style Cards -->
    <view class="flex-1 px-5 pt-2 pb-32">
      <view class="grid grid-cols-2 gap-4">
        <view 
          v-for="item in styles" 
          :key="item.id"
          @tap="handleSelect(item)"
          class="card-base overflow-hidden transition-all duration-300 active:scale-[0.97]"
          :class="selectedId === item.id ? 'ring-[3px] ring-brand-orange shadow-card-hover' : ''"
        >
          <!-- Preview Area -->
          <view class="w-full aspect-[4/3] relative overflow-hidden" :style="{ background: getBg(item.id) }">
            <view class="absolute inset-0 flex items-center justify-center">
              <text class="text-5xl drop-shadow-sm">{{ getIcon(item.id) }}</text>
            </view>
            
            <!-- Lock badge for premium -->
            <view v-if="item.id === 9" class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
              <text class="text-sm">🔒</text>
            </view>
            
            <!-- Selected check -->
            <view v-if="selectedId === item.id" class="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center shadow-btn">
              <text class="text-white text-sm font-bold">✓</text>
            </view>
          </view>
          
          <!-- Info -->
          <view class="p-3.5 space-y-1">
            <text class="block text-ink font-bold text-sm leading-tight">{{ item.name }}</text>
            <text class="block text-ink-tertiary text-[11px] leading-snug">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Bottom Sticky CTA -->
    <view class="fixed bottom-0 left-0 right-0 z-30">
      <view class="max-w-[430px] mx-auto px-5 pb-8 pt-4 bg-gradient-to-t from-surface via-surface to-transparent">
        <view 
          class="btn-primary"
          :class="!selectedId ? 'opacity-40 pointer-events-none grayscale' : ''"
          @tap="$emit('confirm')"
        >
          <text>立即生成</text>
          <text class="ml-2 text-white/70 text-sm font-normal">（耗时约10秒）</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { StyleItem } from '@/stores/petStore';

const props = defineProps<{
  styles: StyleItem[];
  selectedId: number | null;
}>();

const emit = defineEmits(['select', 'confirm', 'back']);

const handleSelect = (item: StyleItem) => {
  emit('select', item);
  uni.vibrateShort({});
};

const getIcon = (id: number) => {
  const icons: Record<number, string> = {
    1: '🏰', 2: '🏀', 3: '💎', 4: '🌃', 5: '🪄', 
    6: '⛩️', 7: '🛋️', 8: '👟', 9: '🦄', 10: '🎨'
  };
  return icons[id] || '✨';
};

const getBg = (id: number) => {
  const bgs: Record<number, string> = {
    1: 'linear-gradient(160deg, #E8F5E9 0%, #FFF9C4 100%)',
    2: 'linear-gradient(160deg, #FFF3E0 0%, #FFFDE7 100%)',
    3: 'linear-gradient(160deg, #F3E5F5 0%, #E8EAF6 100%)',
    4: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 100%)',
    5: 'linear-gradient(160deg, #FFF8E1 0%, #FFECB3 100%)',
    6: 'linear-gradient(160deg, #E0F7FA 0%, #F1F8E9 100%)',
    7: 'linear-gradient(160deg, #FFF3E0 0%, #FFCCBC 100%)',
    8: 'linear-gradient(160deg, #ECEFF1 0%, #CFD8DC 100%)',
    9: 'linear-gradient(160deg, #FCE4EC 0%, #F3E5F5 100%)',
    10: 'linear-gradient(160deg, #FFECB3 0%, #C8E6C9 100%)',
  };
  return bgs[id] || 'linear-gradient(160deg, #F5F5F5 0%, #EEEEEE 100%)';
};
</script>
