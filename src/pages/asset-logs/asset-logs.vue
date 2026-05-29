<template>
  <view class="logs-page">
    <AppTopNav title="灵感明细" back @back="goBack" />
    <view class="summary-card">
      <view class="score">
        <image :src="ASSETS.iconSpark" mode="aspectFit" />
        <text>{{ balance }}</text>
      </view>
      <text class="breakdown">会员灵感值 {{ vipPoint }} ｜ 充值灵感值 {{ rechargePoint }} ｜ 赠送灵感值 {{ giftPoint }}</text>
    </view>
    <scroll-view class="log-scroll" scroll-y @scrolltolower="loadMore">
      <PageSkeleton v-if="loading && logs.length === 0" :rows="5" />
      <view v-for="item in logs" v-else :key="item.id" class="log-item">
        <view class="log-main">
          <view class="desc">{{ item.description || getLogText(item.type) }}</view>
          <text class="date">{{ formatDate(item.created_at || item.createdAt) }}</text>
        </view>
        <text class="amount" :class="{ plus: item.amount > 0 }">{{ item.amount > 0 ? '+' : '' }}{{ item.amount }}</text>
      </view>
      <EmptyState v-if="logs.length === 0 && !loading" title="暂无灵感明细" />
      <view v-if="loading && logs.length > 0" class="loading">加载中...</view>
    </scroll-view>
    <button class="vip-btn" @click="goRecharge">开通会员</button>
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi, type AssetLogItem } from '@/services/aurakey'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'

const authStore = useAuthStore()
const logs = ref<AssetLogItem[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const hasMore = ref(true)
const showLoginSheet = ref(false)

const balance = computed(() => authStore.balance)
const vipPoint = computed(() => authStore.userProfile?.is_vip ? 40 : 0)
const rechargePoint = computed(() => Math.max(balance.value - vipPoint.value, 0))
const giftPoint = computed(() => 8)

const goBack = () => uni.navigateBack()
const goRecharge = () => uni.navigateTo({ url: '/pages/recharge/recharge' })

const formatDate = (value?: string) => {
  if (!value) return '2026/05/01 15:30'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const getLogText = (type: string | number) => {
  const value = String(type)
  if (value.includes('vip')) return '会员到期'
  if (value.includes('sign')) return '每日免费灵感'
  if (value.includes('invite')) return '生成失败返还'
  return '图片生成'
}

const loadLogs = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const data = await aurakeyApi.asset.logs(page.value, pageSize)
    logs.value = page.value === 1 ? data.items : logs.value.concat(data.items)
    page.value += 1
    hasMore.value = data.items.length >= pageSize
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => loadLogs()

const handleLoggedIn = () => {
  showLoginSheet.value = false
  loadLogs()
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

onMounted(() => {
  uni.$on('auth:login-required', handleLoginRequired)
  loadLogs()
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})
</script>

<style scoped lang="scss">
.logs-page {
  height: 100vh;
  padding-bottom: calc(118rpx + env(safe-area-inset-bottom));
  background: #050506;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-card {
  margin: 16rpx 34rpx 34rpx;
  border-radius: 18rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0F0F12;
}

.score {
  display: flex;
  align-items: center;
  gap: 8rpx;

  image {
    width: 40rpx;
    height: 40rpx;
  }

  text {
    font-size: 66rpx;
    font-weight: 300;
    color: #FFFFFF;
    font-size: 72rpx;
    font-weight: 700;
  }
}

.breakdown {
  margin-top: 18rpx;
  color: rgba(255, 255, 255, 0.58);
  font-size: 24rpx;
}

.log-scroll {
  flex: 1;
  min-height: 0;
  height: auto;
}

.log-item {
  height: 118rpx;
  padding: 0 34rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-main {
  flex: 1;
  min-width: 0;
  padding-right: 24rpx;
  overflow: hidden;
}

.desc,
.date {
  display: block;
}

.desc {
  width: 100%;
  height: 40rpx;
  line-height: 40rpx;
  color: #fff;
  font-size: 28rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  margin-top: 12rpx;
  color: #FFFFFF66;
  font-size: 24rpx;
  line-height: 34rpx;
}

.amount {
  flex-shrink: 0;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.plus {
  color: #fff;
}

.loading {
  padding: 32rpx 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
}

.vip-btn {
  position: fixed;
  left: 34rpx;
  right: 34rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  height: 96rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 96rpx;
  color: #111;
  font-size: 30rpx;
  font-weight: 800;
  background: linear-gradient(90deg, #dcefff, #f4defd);
}
</style>
