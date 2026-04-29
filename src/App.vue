<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { historyService } from "@/utils/history-service";
import { authService } from "@/api/auth";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();

// 小程序 AppID（需要配置）
const MINIAPP_APPID = 'wxb26e7039ef603dca';

onLaunch(async () => {
  console.log("App Launch");

  // 清理之前存入的失败记录
  const removed = historyService.clearFailedRecords();
  if (removed > 0) {
    console.log(`Cleaned ${removed} failed history records`);
  }

  // 自动登录
  await autoLogin();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

/**
 * 自动登录逻辑
 */
async function autoLogin() {
  try {
    // 尝试获取当前用户信息（如果已有 token）
    const user = await authService.getCurrentUser();
    userStore.setUser(user);
    console.log('User already logged in:', user);
  } catch (error) {
    // token 无效或不存在，执行小程序登录
    console.log('No valid token, performing miniapp login...');
    await performMiniappLogin();
  }
}

/**
 * 执行小程序登录
 */
async function performMiniappLogin() {
  try {
    // 调用 wx.login 获取 code
    const loginRes = await uni.login({ provider: 'weixin' });

    if (!loginRes.code) {
      throw new Error('Failed to get login code');
    }

    // 调用后端登录接口
    const token = await authService.miniappLogin({
      appid: MINIAPP_APPID,
      code: loginRes.code,
    });

    // 保存 token
    authService.saveToken(token);

    // 获取用户信息
    const user = await authService.getCurrentUser();
    userStore.setUser(user);

    console.log('Miniapp login success:', user);
  } catch (error) {
    console.error('Miniapp login failed:', error);
  }
}
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
