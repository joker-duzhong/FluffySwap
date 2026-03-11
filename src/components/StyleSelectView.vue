<template>
  <view class="min-h-screen bg-white flex flex-col relative overflow-hidden">

    <!-- Top Bar -->
    <view class="pt-12 px-8 pb-4">
      <view @tap="$emit('back')" class="mb-4 w-10 h-10 rounded-2xl border border-gray-200 flex items-center justify-center active:scale-90 transition-transform">
        <text class="text-ink text-sm">←</text>
      </view>
      <text class="text-3xl font-bold text-ink block mb-1">选择你的</text>
      <text class="text-2xl font-light text-ink/80 block mb-6">魔法画风</text>
      <text class="text-ink-secondary text-sm font-light mt-1 uppercase tracking-widest">定制你的专属宠物艺术照:</text>
    </view>

    <!-- Scrollable Content -->
    <scroll-view scroll-y class="flex-1 px-8 pt-4 pb-32">
      <!-- Grid of Style Cards -->
      <view class="grid grid-cols-2 gap-5">
        <view
          v-for="item in styles"
          :key="item.id"
          @tap="handleSelect(item)"
          class="relative rounded-[20px] overflow-hidden transition-all duration-300 active:scale-[0.97]"
          :style="{ backgroundColor: item.color }"
        >
          <!-- Info Layer -->
           <view class="absolute bottom-4 left-4 right-4 z-10">
                <text class="block font-bold text-sm tracking-wide leading-tight" :class="item.textColor">{{ item.name }}</text>
           </view>

          <!-- Preview Area / Icons -->
          <view class="w-full h-44 relative flex items-center justify-center">
            <text class="text-6xl drop-shadow-md z-0 opacity-80">{{ item.icon }}</text>

            <!-- Selected check -->
            <view v-if="selectedId === item.id" class="absolute top-2 left-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
              <text class="text-brand-primary text-[10px] font-bold">✓</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Gender & Custom Prompt Section -->
      <view class="mt-8 mb-4">
        <text class="text-ink-secondary text-sm font-light uppercase tracking-widest block mb-4">个性化设置:</text>

        <!-- Gender Selection -->
        <view class="mb-5">
          <text class="text-ink text-sm font-medium block mb-3">选择性别</text>
          <view class="flex gap-3">
            <view
              @tap="handleGenderSelect('male')"
              class="flex-1 h-12 rounded-2xl flex items-center justify-center transition-all duration-200"
              :class="selectedGender === 'male' ? 'bg-[#8E97FD] border-2 border-[#8E97FD]' : 'bg-gray-100 border-2 border-transparent'"
            >
              <text class="text-base mr-2">👦</text>
              <text class="text-sm font-medium" :class="selectedGender === 'male' ? 'text-white' : 'text-ink'">弟弟</text>
            </view>
            <view
              @tap="handleGenderSelect('female')"
              class="flex-1 h-12 rounded-2xl flex items-center justify-center transition-all duration-200"
              :class="selectedGender === 'female' ? 'bg-[#8E97FD] border-2 border-[#8E97FD]' : 'bg-gray-100 border-2 border-transparent'"
            >
              <text class="text-base mr-2">👧</text>
              <text class="text-sm font-medium" :class="selectedGender === 'female' ? 'text-white' : 'text-ink'">妹妹</text>
            </view>
          </view>
        </view>

        <!-- Custom Prompt Input -->
        <view>
          <text class="text-ink text-sm font-medium block mb-3">添加描述（可选）</text>
          <view class="bg-gray-50 rounded-2xl border border-gray-200 p-3">
            <textarea
              v-model="customPrompt"
              class="w-full h-20 text-sm text-ink bg-transparent resize-none outline-none"
              placeholder="例如：戴眼镜、穿西装、微笑、短发..."
              :maxlength="200"
              placeholder-class="text-gray-400"
            />
            <view class="flex justify-end mt-1">
              <text class="text-xs text-gray-400">{{ customPrompt.length }}/200</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Bottom Sticky CTA -->
    <view class="fixed bottom-0 left-0 right-0 z-30 px-8 pb-10 bg-gradient-to-t from-white via-white to-transparent pt-6">
        <button
          class="bg-[#8E97FD] w-full h-16 rounded-[38px] font-semibold text-sm tracking-widest text-white shadow-2xl active:scale-95 transition-all flex items-center justify-center border-none"
          :class="!selectedId ? 'opacity-40 pointer-events-none' : ''"
          @tap="handleConfirm"
        >
          <text>立即生成魔法照</text>
        </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { StyleItem } from '@/config/prompt';

const props = defineProps<{
  styles: StyleItem[];
  selectedId: number | null;
  gender?: string;
  customPromptText?: string;
}>();

const emit = defineEmits(['select', 'confirm', 'back', 'updateGender', 'updateCustomPrompt']);

const selectedGender = ref(props.gender || '');
const customPrompt = ref(props.customPromptText || '');

// Watch for prop changes
watch(() => props.gender, (newVal) => {
  selectedGender.value = newVal || '';
});

watch(() => props.customPromptText, (newVal) => {
  customPrompt.value = newVal || '';
});

const handleSelect = (item: StyleItem) => {
  emit('select', item);
  uni.vibrateShort({});
};

const handleGenderSelect = (gender: string) => {
  selectedGender.value = selectedGender.value === gender ? '' : gender;
  emit('updateGender', selectedGender.value);
  uni.vibrateShort({});
};

watch(customPrompt, (newVal) => {
  emit('updateCustomPrompt', newVal);
});

const handleConfirm = () => {
  emit('confirm');
};
</script>
