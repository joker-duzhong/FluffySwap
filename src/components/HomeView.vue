<template>
  <view class="min-h-screen bg-brand-primary relative overflow-hidden flex flex-col">

    <!-- Background Decorative Elements (Fixed) -->
    <view class="absolute inset-0 pointer-events-none">
      <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
      <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]">
      </view>
    </view>

    <!-- Settings Button (Top Left) -->
    <view class="absolute top-12 left-6 z-20">
      <view
        @tap="showModelPopup = true"
        class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm"
      >
        <text class="text-white text-lg">⚙️</text>
      </view>
    </view>

    <!-- Main Content Flow -->
    <view class="flex-1 flex flex-col z-10 w-full h-full">

      <!-- Logo/Title Area -->
      <view class="pt-14 pb-4 flex flex-col items-center shrink-0">
        <view class="flex items-center gap-2 mb-2">
          <text class="text-white font-black tracking-widest text-sm italic">FLUFFY</text>
          <view class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <text class="text-brand-primary text-[10px]">★</text>
          </view>
          <text class="text-white font-black tracking-widest text-sm italic">SWAP</text>
        </view>
      </view>

      <!-- Main Visual Object (Flexible Center) -->
      <view class="flex-1 flex flex-col items-center justify-center min-h-[300px] shrink-0">
        <view class="w-[60vw] max-w-[280px] aspect-square relative flex items-center justify-center">
          <!-- Background Circles -->
          <view class="absolute w-full h-full bg-indigo-400/30 rounded-full scale-100"></view>
          <view class="absolute w-[85%] h-[85%] bg-indigo-500/30 rounded-full scale-100"></view>

          <!-- Mascot -->
          <view class="z-10 flex flex-col items-center">
            <text class="text-[100px] animate-bounce-cute filter drop-shadow-2xl">{{ randomAnimal }}</text>
          </view>
        </view>

        <view class="mt-6 text-center px-10">
          <text class="text-white font-bold text-3xl mb-2 block">AI 萌宠换脸秀</text>
          <text class="text-white/80 text-base font-light block">Magic Portrait for Pets</text>
          <text class="text-white/60 text-sm mt-3 block leading-relaxed px-2">
            一键生成多种艺术风格，让你的爱宠变身超萌主角！
          </text>
        </view>
      </view>

      <!-- UI Interaction Section -->
      <view class="px-8 pb-10 pt-4 flex flex-col gap-5 shrink-0">
        <!-- Integrated Uploader style -->
        <view class="bg-white/10 backdrop-blur-md rounded-[38px] p-2 border border-white/20 relative">
          <ImageUploader v-model:image="store.originalImage" />
          <!-- History Button - 斜放在右上角 -->
          <view
            @tap="goToHistory"
            class="absolute -top-3 -right-3 transform rotate-12 bg-gradient-to-br from-amber-400 to-orange-500 px-3 py-1.5 rounded-full shadow-lg active:scale-90 active:rotate-6 transition-all border-2 border-white/30"
          >
            <view class="flex items-center gap-1">
              <text class="text-white text-xs drop-shadow">🖼️</text>
              <text class="text-white text-xs font-bold drop-shadow">作品</text>
            </view>
          </view>
        </view>

        <button
          class="bg-[#EBEAEC] w-full h-16 rounded-[38px] font-semibold text-sm tracking-widest text-brand-primary shadow-2xl active:scale-95 transition-all flex items-center justify-center border-none"
          :class="!store.originalImage ? 'opacity-80 grayscale pointer-events-none' : ''" @tap="$emit('next')">
          立即开始
        </button>
      </view>

    </view>

    <!-- Model Selection Popup -->
    <view v-if="showModelPopup" class="model-popup-overlay" @tap="showModelPopup = false">
      <view class="model-popup" @tap.stop>
        <view class="model-popup-header">
          <text class="model-popup-title">选择模型</text>
          <view @tap="showModelPopup = false" class="model-popup-close">✕</view>
        </view>

        <scroll-view scroll-y class="model-popup-list">
          <view
            v-for="model in modelList"
            :key="model.id"
            class="model-item"
            :class="{ 'model-item-active': selectedModel === model.id }"
            @tap="selectModel(model.id)"
          >
            <view class="model-item-info">
              <text class="model-item-name">{{ model.name }}</text>
              <text class="model-item-points">{{ model.points }} 点/次</text>
            </view>
            <view v-if="selectedModel === model.id" class="model-item-check">✓</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- Pending Task Alert Popup -->
    <view v-if="showTaskAlert" class="model-popup-overlay">
      <view class="task-alert-popup">
        <view class="task-alert-icon">
          <text class="text-5xl">🎨</text>
        </view>
        <text class="task-alert-title">你有未完成的作品</text>
        <text class="task-alert-desc">检测到之前有正在生成的魔法照，是否继续查看？</text>
        <view class="task-alert-actions">
          <view @tap="dismissTaskAlert" class="task-alert-btn task-alert-btn-cancel">
            <text class="text-gray-500 text-sm">稍后再说</text>
          </view>
          <view @tap="resumeTask" class="task-alert-btn task-alert-btn-confirm">
            <text class="text-white text-sm font-medium">立即查看</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ImageUploader from '@/components/ImageUploader.vue';
import { usePetStore } from '@/stores/petStore';
import { historyService } from '@/utils/history-service';
import { getSelectedModel, setSelectedModel } from '@/utils/model-service';
import { MODEL_LIST } from '@/config/models';
import { taskService } from '@/utils/task-service';

const store = usePetStore();
defineEmits(['next']);

const historyCount = ref(0);
const showModelPopup = ref(false);
const selectedModel = ref('');
const modelList = MODEL_LIST;
const showTaskAlert = ref(false);

// 动物列表 - 常见动物权重更高
const ANIMAL_POOL: { emoji: string; weight: number }[] = [
  // 超常见 (权重 10) - 家养宠物和最常见动物
  { emoji: '🐱', weight: 10 }, { emoji: '🐶', weight: 10 }, { emoji: '🐰', weight: 10 },
  { emoji: '🐹', weight: 10 }, { emoji: '🐭', weight: 10 }, { emoji: '🐻', weight: 10 },
  { emoji: '🐼', weight: 10 }, { emoji: '🐨', weight: 10 }, { emoji: '🦊', weight: 10 },
  { emoji: '🦁', weight: 8 }, { emoji: '🐯', weight: 8 }, { emoji: '🐮', weight: 8 },
  { emoji: '🐷', weight: 8 }, { emoji: '🐸', weight: 8 }, { emoji: '🐵', weight: 8 },
  // 很常见 (权重 6)
  { emoji: '🐔', weight: 6 }, { emoji: '🐧', weight: 6 }, { emoji: '🐦', weight: 6 },
  { emoji: '🦆', weight: 6 }, { emoji: '🦅', weight: 6 }, { emoji: '🦉', weight: 6 },
  { emoji: '🐴', weight: 6 }, { emoji: '🦄', weight: 6 }, { emoji: '🐝', weight: 6 },
  { emoji: '🦋', weight: 6 }, { emoji: '🐌', weight: 6 }, { emoji: '🐞', weight: 6 },
  { emoji: '🦀', weight: 6 }, { emoji: '🐙', weight: 6 }, { emoji: '🐬', weight: 6 },
  { emoji: '🐳', weight: 6 }, { emoji: '🦈', weight: 6 }, { emoji: '🐊', weight: 6 },
  // 常见 (权重 4)
  { emoji: '🐘', weight: 4 }, { emoji: '🦒', weight: 4 }, { emoji: '🦓', weight: 4 },
  { emoji: '🐫', weight: 4 }, { emoji: '🦔', weight: 4 }, { emoji: '🦦', weight: 4 },
  { emoji: '🦩', weight: 4 }, { emoji: '🦚', weight: 4 }, { emoji: '🦜', weight: 4 },
  { emoji: '🦢', weight: 4 }, { emoji: '🦩', weight: 4 }, { emoji: '🐢', weight: 4 },
  { emoji: '🐍', weight: 4 }, { emoji: '🦎', weight: 4 }, { emoji: '🐲', weight: 4 },
  { emoji: '🦕', weight: 4 }, { emoji: '🦖', weight: 4 }, { emoji: '🦙', weight: 4 },
  { emoji: '🦘', weight: 4 }, { emoji: '🐃', weight: 4 }, { emoji: '🐂', weight: 4 },
  // 较常见 (权重 3)
  { emoji: '🐑', weight: 3 }, { emoji: '🐐', weight: 3 }, { emoji: '🦌', weight: 3 },
  { emoji: '🐕', weight: 3 }, { emoji: '🐩', weight: 3 }, { emoji: '🐈', weight: 3 },
  { emoji: '🐓', weight: 3 }, { emoji: '🦃', weight: 3 }, { emoji: '🦚', weight: 3 },
  { emoji: '🕊️', weight: 3 }, { emoji: '🐕‍🦺', weight: 3 }, { emoji: '🦮', weight: 3 },
  { emoji: '🦥', weight: 3 }, { emoji: '🦨', weight: 3 }, { emoji: '🦡', weight: 3 },
  { emoji: '🦫', weight: 3 }, { emoji: '🦭', weight: 3 }, { emoji: '🦬', weight: 3 },
  // 一般 (权重 2)
  { emoji: '🦓', weight: 2 }, { emoji: '🦏', weight: 2 }, { emoji: '🦛', weight: 2 },
  { emoji: '🦘', weight: 2 }, { emoji: '🦙', weight: 2 }, { emoji: '🦚', weight: 2 },
  { emoji: '🦛', weight: 2 }, { emoji: '🦜', weight: 2 }, { emoji: '🦝', weight: 2 },
  { emoji: '🦞', weight: 2 }, { emoji: '🦟', weight: 2 }, { emoji: '🦠', weight: 2 },
  { emoji: '🐡', weight: 2 }, { emoji: '🐠', weight: 2 }, { emoji: '🐟', weight: 2 },
  // 稀有 (权重 1)
  { emoji: '🦧', weight: 1 }, { emoji: '🦍', weight: 1 }, { emoji: '🦏', weight: 1 },
  { emoji: '🦛', weight: 1 }, { emoji: '🐪', weight: 1 }, { emoji: '🦙', weight: 1 },
  { emoji: '🦘', weight: 1 }, { emoji: '🦠', weight: 1 }, { emoji: '🦟', weight: 1 },
  { emoji: '🦡', weight: 1 }, { emoji: '🐺', weight: 1 }, { emoji: '🦌', weight: 1 },
  { emoji: '🦬', weight: 1 }, { emoji: '🦣', weight: 1 }, { emoji: '🦤', weight: 1 },
];

// 根据权重随机选择动物
const getRandomAnimal = (): string => {
  const totalWeight = ANIMAL_POOL.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of ANIMAL_POOL) {
    random -= item.weight;
    if (random <= 0) return item.emoji;
  }
  return ANIMAL_POOL[0].emoji;
};

const randomAnimal = ref('🐱');

onMounted(() => {
  historyCount.value = historyService.getCount();
  selectedModel.value = getSelectedModel();
  randomAnimal.value = getRandomAnimal();

  // 检查是否有未完成的任务
  if (taskService.hasPendingTask()) {
    showTaskAlert.value = true;
  }
});

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/history/history' });
};

const dismissTaskAlert = () => {
  showTaskAlert.value = false;
};

const resumeTask = () => {
  showTaskAlert.value = false;
  // 通知 index.vue 恢复任务
  uni.$emit('resumeTask');
};

const selectModel = (modelId: string) => {
  selectedModel.value = modelId;
  setSelectedModel(modelId);
  showModelPopup.value = false;
  uni.showToast({ title: '已切换模型', icon: 'success', duration: 1500 });
};
</script>

<style scoped>
.animate-bounce-cute {
  animation: bounceCute 2s ease-in-out infinite;
}

@keyframes bounceCute {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
}

/* Model Popup Styles */
.model-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-popup {
  width: 85%;
  max-width: 400px;
  max-height: 70vh;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.model-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.model-popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.model-popup-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.model-popup-list {
  flex: 1;
  max-height: 50vh;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.model-item:active {
  background: #f9f9f9;
}

.model-item-active {
  background: #f0f7ff;
}

.model-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-item-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.model-item-points {
  font-size: 12px;
  color: #999;
}

.model-item-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #8E97FD;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* Task Alert Popup Styles */
.task-alert-popup {
  width: 85%;
  max-width: 320px;
  background: #fff;
  border-radius: 24px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.task-alert-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #8E97FD 0%, #6CB28E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.task-alert-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.task-alert-desc {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
}

.task-alert-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.task-alert-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-alert-btn-cancel {
  background: #f5f5f5;
}

.task-alert-btn-confirm {
  background: linear-gradient(135deg, #8E97FD 0%, #6B74E8 100%);
}
</style>
