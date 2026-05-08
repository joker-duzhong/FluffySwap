<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAuthStore } from "@/stores/authStore";
import { configureClient } from "@/services/clientConfig";
import { aurakeyApi } from "@/services/aurakey";
import { WECHAT_CONFIG } from "@/config";

const authStore = useAuthStore();

onLaunch(async () => {
  console.log("App Launch");

  // 配置 API 客户端
  configureClient();

  authStore.loadFromStorage();

  await silentLogin();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

async function silentLogin() {
  try {
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: resolve,
        fail: reject,
      });
    });
    if (!loginRes.code) return;
    const token = await aurakeyApi.auth.miniappLogin(WECHAT_CONFIG.APPID, loginRes.code);
    authStore.setToken(token.access_token);
    await refreshUserProfile();
  } catch (error) {
    console.error("Silent login failed:", error);
    if (!authStore.token) authStore.clearAuth();
  }
}

async function refreshUserProfile() {
  try {
    const profile = await aurakeyApi.user.profile();
    authStore.setUserProfile(profile);
    console.log("User profile refreshed");
  } catch (error) {
    console.error("Failed to refresh user profile:", error);
    authStore.clearAuth();
  }
}
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
