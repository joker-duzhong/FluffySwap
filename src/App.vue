<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { handleMiniProgramEntryLaunchOptions } from '@/utils/miniProgramEntry'
import { configureClient } from '@/services/clientConfig'
import { aurakeyApi } from '@/services/aurakey'

const authStore = useAuthStore()
const appStore = useAppStore()
let refreshing = false

onLaunch(async (options) => {
  configureClient()
  authStore.loadFromStorage()
  handleMiniProgramEntryLaunchOptions(options)
  appStore.setAppInitializing(true)
  appStore.setSystemConfigLoading(true)
  try {
    await aurakeyApi.system.config()
      .then((config) => appStore.setSystemConfig(config))
      .catch(() => appStore.setSystemConfig(null))
      .finally(() => appStore.setSystemConfigLoading(false))
    await authStore.startIdentity()
  } catch {
    // 登录表单显示可重试错误，游客仍可浏览公开模板。
  } finally {
    appStore.setAppInitializing(false)
  }
})

onShow(async (options) => {
  handleMiniProgramEntryLaunchOptions(options)
  if (appStore.appInitializing || !authStore.isLoggedIn || refreshing) return
  refreshing = true
  try {
    await authStore.refreshProfile()
  } catch {
    // 401 由请求层处理；网络异常保留当前资料，页面提供重试。
  } finally {
    refreshing = false
  }
})
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
