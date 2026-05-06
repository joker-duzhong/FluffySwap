<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAuthStore } from "@/stores/authStore";
import { configureClient, client } from "@/services/api";

const authStore = useAuthStore();

onLaunch(async () => {
  console.log("App Launch");

  // 配置 API 客户端
  configureClient();

  // 从本地存储恢复用户信息
  authStore.loadFromStorage();

  // 如果已登录，尝试刷新用户信息
  if (authStore.isLoggedIn) {
    await refreshUserProfile();
  }
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

/**
 * 刷新用户信息
 */
async function refreshUserProfile() {
  try {
    const res = await client.GET('/aurakey/user/profile');
    if (res.data?.code === 200 && res.data.data) {
      authStore.setUserProfile(res.data.data);
      console.log('User profile refreshed');
    }
  } catch (error) {
    console.error('Failed to refresh user profile:', error);
    // 如果刷新失败（token 过期），清除登录状态
    authStore.clearAuth();
  }
}
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
