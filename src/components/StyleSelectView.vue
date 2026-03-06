<template>
  <view class="min-h-screen bg-white flex flex-col relative overflow-hidden">
    
    <!-- Top Bar -->
    <view class="pt-16 px-8 pb-4">
      <view @tap="$emit('back')" class="mb-4 w-10 h-10 rounded-2xl border border-gray-200 flex items-center justify-center active:scale-90 transition-transform">
        <text class="text-ink text-sm">←</text>
      </view>
      <text class="text-3xl font-bold text-ink block mb-1">选择你的</text>
      <text class="text-2xl font-light text-ink/80 block mb-6">魔法画风</text>
      <text class="text-ink-secondary text-sm font-light mt-1 uppercase tracking-widest">定制你的专属宠物艺术照:</text>
    </view>
    
    <!-- Grid of Style Cards -->
    <view class="flex-1 px-8 pt-4 pb-32">
      <view class="grid grid-cols-2 gap-5">
        <view 
          v-for="item in styles" 
          :key="item.id"
          @tap="handleSelect(item)"
          class="relative rounded-[20px] overflow-hidden transition-all duration-300 active:scale-[0.97]"
          :class="getCardClass(item.id)"
        >
          <!-- Info Layer -->
           <view class="absolute bottom-4 left-4 right-4 z-10">
                <text class="block font-bold text-sm tracking-wide leading-tight" :class="getTextColor(item.id)">{{ item.name }}</text>
           </view>

          <!-- Preview Area / Icons -->
          <view class="w-full h-44 relative flex items-center justify-center">
            <text class="text-6xl drop-shadow-md z-0 opacity-80">{{ getIcon(item.id) }}</text>
            
            <!-- Selected check -->
            <view v-if="selectedId === item.id" class="absolute top-2 left-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
              <text class="text-brand-primary text-[10px] font-bold">✓</text>
            </view>

            <!-- Clocks / Icons (extra flourishes from image) -->
             <view v-if="item.id === 2" class="absolute top-2 right-2 opacity-50"><text class="text-xs">🕒</text></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Bottom Sticky CTA (Hidden until selection if desired, or always visible) -->
    <view class="fixed bottom-0 left-0 right-0 z-30 px-8 pb-10">
        <button 
          class="bg-[#8E97FD] w-full h-16 rounded-[38px] font-semibold text-sm tracking-widest text-white shadow-2xl active:scale-95 transition-all flex items-center justify-center border-none"
          :class="!selectedId ? 'opacity-40 pointer-events-none' : ''"
          @tap="$emit('confirm')"
        >
          <text>立即生成魔法照</text>
        </button>
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

const getCardClass = (id: number) => {
  // Mapping to design colors
  const classes: Record<number, string> = {
    1: 'bg-[#8E97FD]', // Purple
    2: 'bg-[#FA6E5A]', // Orangeish
    3: 'bg-[#FF99CC]', // Pink
    4: 'bg-[#3F414E]', // Dark
    5: 'bg-[#FEB754]', // Yellow
    6: 'bg-[#6CB28E]', // Green
  };
  return classes[id % 6 + 1] || 'bg-brand-primary';
};

const getTextColor = (id: number) => {
    // Dark card gets white text, others might need subtle variation or just white
    if (id % 6 + 1 === 4) return 'text-white';
    return (id % 6 + 1 === 5) ? 'text-ink' : 'text-white';
};
</script>