<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { historyService } from "@/utils/history-service";

onLaunch(() => {
  console.log("App Launch");
  // 清理之前存入的失败记录
  const removed = historyService.clearFailedRecords();
  if (removed > 0) {
    console.log(`Cleaned ${removed} failed history records`);
  }
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
