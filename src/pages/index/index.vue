<template>
  <view class="phone-shell">

    <!-- ========== State 1: Home ========== -->
    <view v-if="store.currentStep === 'home'">
      <HomeView @next="goToStyleSelect" />
    </view>

    <!-- ========== State 2: Style Select ========== -->
    <view v-else-if="store.currentStep === 'styleSelect'">
      <StyleSelectView
        :styles="styleList"
        :selectedId="store.selectedStyle?.id ?? null"
        :gender="store.gender"
        :customPromptText="store.customPrompt"
        @select="onStyleSelect"
        @updateGender="onGenderUpdate"
        @updateCustomPrompt="onCustomPromptUpdate"
        @confirm="handleGenerate"
        @back="store.goTo('home')"
      />
    </view>

    <!-- ========== State 3: Loading ========== -->
    <view v-else-if="store.currentStep === 'loading'">
      <LoadingState :petImage="store.originalImage!" :styleName="store.selectedStyle?.name || ''" />
    </view>

    <!-- ========== State 4: Result ========== -->
    <view v-else-if="store.currentStep === 'result'">
      <ResultView :resultImage="store.resultImage!" :originalImage="store.originalImage!"
        :styleName="store.selectedStyle?.name || ''" :hasPaid="store.hasPaid" @goHome="handleReset" />
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import HomeView from '@/components/HomeView.vue';
import StyleSelectView from '@/components/StyleSelectView.vue';
import LoadingState from '@/components/LoadingState.vue';
import ResultView from '@/components/ResultView.vue';
import { usePetStore } from '@/stores/petStore';
import type { StyleItem } from '@/stores/petStore';
import { petAIService } from '@/api/ai';
import { prompts } from '@/config/prompt';
import { ensureOnlineUrl } from '@/utils/qiniu-upload';
import { historyService } from '@/utils/history-service';
import { taskService } from '@/utils/task-service';
import type { HistoryRecord } from '@/types/history';
import { pointsService } from '@/utils/points-service';
import { getModelCost } from '@/config/models';
import { getSelectedModel } from '@/utils/model-service';

const store = usePetStore();
const styleList = prompts as StyleItem[];

// 用于强制刷新视图的 key
const forceKey = ref(0);

// 当前进行中的任务相关
let currentHistoryId: string | null = null;
let pollingTimer: number | null = null;

/** 开始轮询任务 */
const startPolling = (taskId: string, historyId: string, originalImage: string, cost: number) => {
  // 先停止之前的轮询，避免重复
  stopPolling();
  currentHistoryId = historyId;

  const poll = async () => {
    const result = await petAIService.pollOnce(taskId);

    if (result.success) {
      // 任务完成，更新历史记录
      historyService.update(historyId, {
        resultImage: result.imageUrl,
        isProcessing: false
      });
      taskService.clearTask();

      store.resultImage = result.imageUrl;
      store.goTo('result');

      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    } else if (result.status === 'failed' || result.status === 'no_image' || result.status === 'error') {
      // 任务失败，退还点数并删除历史记录
      pointsService.add(cost, '生成失败退还');
      historyService.remove(historyId);
      taskService.clearTask();
      uni.showToast({ title: `生成失败，${cost}点已退回`, icon: 'none', duration: 2500 });
      store.goTo('styleSelect');

      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }
    // processing 状态继续轮询
  };

  // 每 2 秒轮询一次
  pollingTimer = setInterval(poll, 2000) as unknown as number;
  // 立即执行一次
  poll();
};

/** 停止轮询 */
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

// 监听从历史记录页面返回的事件
const handleHistorySelect = (data: { historyId: string }) => {
  const record = historyService.getById(data.historyId);
  if (!record) return;

  if (record.isProcessing && record.taskId) {
    // 未完成的任务，恢复轮询
    store.originalImage = record.originalImage;
    store.selectedStyle = {
      id: record.styleId,
      name: record.styleName,
      prompt: '',
    } as StyleItem;
    store.goTo('loading');

    // 开始轮询（恢复任务时使用当前模型cost，失败时退回）
    const modelId = getSelectedModel();
    const cost = getModelCost(modelId);
    startPolling(record.taskId, record.id, record.originalImage, cost);
  } else {
    // 已完成的记录
    store.originalImage = record.originalImage;
    store.resultImage = record.resultImage;
    store.selectedStyle = {
      id: record.styleId,
      name: record.styleName,
      prompt: '',
    } as StyleItem;
    store.hasPaid = record.hasPaid;
    store.goTo('result');
    forceKey.value++;
  }
};

// 监听从首页恢复未完成任务
const handleResumeTask = () => {
  const task = taskService.getTask();
  if (!task) return;

  // 先在历史记录中查找
  let record = historyService.getByTaskId(task.taskId);

  if (!record) {
    // 如果没有历史记录，创建一个
    record = historyService.add({
      originalImage: task.originalImage,
      resultImage: '',
      styleId: task.styleId,
      styleName: task.styleName,
      hasPaid: false,
      isProcessing: true,
      taskId: task.taskId,
    });
  }

  // 恢复状态
  store.originalImage = task.originalImage;
  store.selectedStyle = {
    id: task.styleId,
    name: task.styleName,
    prompt: task.stylePrompt,
  } as StyleItem;
  store.goTo('loading');

  // 开始轮询（恢复任务时使用当前模型cost，失败时退回）
  const modelId = getSelectedModel();
  const cost = getModelCost(modelId);
  startPolling(task.taskId, record.id, task.originalImage, cost);
};

onMounted(() => {
  uni.$on('historySelect', handleHistorySelect);
  uni.$on('resumeTask', handleResumeTask);
});

onUnmounted(() => {
  uni.$off('historySelect', handleHistorySelect);
  uni.$off('resumeTask', handleResumeTask);
  stopPolling();
});

// Navigation
const goToStyleSelect = () => {
  if (!store.originalImage) {
    uni.showToast({ title: '请先上传宠物照片', icon: 'none' });
    return;
  }
  store.goTo('styleSelect');
};

const onStyleSelect = (style: StyleItem) => {
  store.selectStyle(style);
};

const onGenderUpdate = (gender: string) => {
  store.setGender(gender);
};

const onCustomPromptUpdate = (prompt: string) => {
  store.setCustomPrompt(prompt);
};

// Generation
const handleGenerate = async () => {
  if (!store.originalImage || !store.selectedStyle) return;

  // 检查点数
  const modelId = getSelectedModel();
  const cost = getModelCost(modelId);

  if (!pointsService.canAfford(cost)) {
    uni.showModal({
      title: '点数不足',
      content: `当前需要 ${cost} 点，您还有 ${pointsService.getBalance()} 点。明天签到可获得 10 点哦！`,
      showCancel: false,
      confirmText: '我知道了'
    });
    return;
  }

  // 扣除点数
  const spent = pointsService.spend(cost);
  if (!spent) {
    uni.showToast({ title: '点数扣除失败，请重试', icon: 'none' });
    return;
  }

  store.goTo('loading');
  stopPolling();

  try {
    const imageUrl = await ensureOnlineUrl(store.originalImage);

    // 提交任务
    const submitResult = await petAIService.submitTask({
      sourceImage: imageUrl,
      style: store.selectedStyle,
      gender: store.gender,
      customPrompt: store.customPrompt
    });

    if (!submitResult.success || !submitResult.taskId) {
      // 任务提交失败，退还点数
      pointsService.add(cost, '任务失败退还');
      uni.showToast({ title: '提交失败: ' + (submitResult.status || '请重试'), icon: 'none' });
      store.goTo('styleSelect');
      return;
    }

    // 保存任务到 task-service
    taskService.saveTask({
      taskId: submitResult.taskId,
      originalImage: imageUrl,
      styleId: store.selectedStyle.id,
      styleName: store.selectedStyle.name,
      stylePrompt: store.selectedStyle.prompt,
    });
    taskService.updateStatus('processing');

    // 保存到历史记录（标记为处理中）
    const historyRecord = historyService.add({
      originalImage: imageUrl,
      resultImage: '',
      styleId: store.selectedStyle.id,
      styleName: store.selectedStyle.name,
      hasPaid: false,
      isProcessing: true,
      taskId: submitResult.taskId,
    });

    // 开始轮询
    startPolling(submitResult.taskId, historyRecord.id, imageUrl, cost);

  } catch (e) {
    console.error('Generate error:', e);
    // 发生异常，退还点数
    pointsService.add(cost, '任务失败退还');
    uni.showToast({ title: '生成失败，请重试', icon: 'none' });
    store.goTo('styleSelect');
  }
};

const handleReset = () => {
  stopPolling();
  store.reset();
};

// 小程序分享配置 - 分享给朋友
onShareAppMessage(() => {
  return {
    title: 'AI萌宠换脸秀 - 让你的宠物变身艺术大片！',
    path: '/pages/index/index',
    imageUrl: store.resultImage || undefined,
  };
});

// 小程序分享配置 - 分享到朋友圈
onShareTimeline(() => {
  return {
    title: 'AI萌宠换脸秀 - 让你的宠物变身艺术大片！',
    query: '',
    imageUrl: store.resultImage || undefined,
  };
});
</script>

<style lang="scss">
@import "@/styles/global.scss";
</style>
