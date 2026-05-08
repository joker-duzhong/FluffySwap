<template>
  <view class="logs-page">
    <AppStatusBar />
    <AppNavBar title="积分明细" back @back="goBack" />
    <view class="summary-card">
      <view class="score">
        <image :src="ASSETS.iconSpark" mode="aspectFit" />
        <text>{{ balance }}</text>
      </view>
      <text class="breakdown">会员灵感值 {{ vipPoint }} ｜ 充值灵感值 {{ rechargePoint }} ｜ 赠送灵感值 {{ giftPoint }}</text>
    </view>
    <scroll-view class="log-scroll" scroll-y @scrolltolower="loadMore">
      <view v-for="item in logs" :key="item.id" class="log-item">
        <view>
          <text class="desc">{{ item.description || getLogText(item.type) }}</text>
          <text class="date">{{ formatDate(item.created_at || item.createdAt) }}</text>
        </view>
        <text class="amount" :class="{ plus: item.amount > 0 }">{{ item.amount > 0 ? '+' : '' }}{{ item.amount }}</text>
      </view>
      <EmptyState v-if="logs.length === 0 && !loading" title="暂无积分明细" />
      <view v-if="loading" class="loading">加载中...</view>
    </scroll-view>
    <button class="vip-btn" @click="goRecharge">开通会员</button>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppStatusBar from '@/components/AppStatusBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi, type AssetLogItem } from '@/services/aurakey'

const authStore = useAuthStore()
const logs = ref<AssetLogItem[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const hasMore = ref(true)

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
  if (value.includes('sign')) return '每日免费积分'
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

onMounted(() => {
  loadLogs()
})
</script>

<style scoped lang="scss">
.logs-page {
  min-height: 100vh;
  padding-bottom: calc(118rpx + env(safe-area-inset-bottom));
  background: #050506;
  color: #fff;
}

.summary-card {
  height: 196rpx;
  margin: 8rpx 34rpx 34rpx;
  border-radius: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.07);
}

.score {
  display: flex;
  align-items: center;
  gap: 14rpx;

  image {
    width: 32rpx;
    height: 32rpx;
  }

  text {
    font-size: 66rpx;
    font-weight: 300;
  }
}

.breakdown {
  margin-top: 18rpx;
  color: rgba(255, 255, 255, 0.58);
  font-size: 24rpx;
}

.log-scroll {
  height: calc(100vh - 430rpx);
}

.log-item {
  height: 118rpx;
  padding: 0 34rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.desc,
.date {
  display: block;
}

.desc {
  color: #fff;
  font-size: 28rpx;
}

.date {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.36);
  font-size: 24rpx;
}

.amount {
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
  color: #111;
  font-size: 30rpx;
  font-weight: 800;
  background: linear-gradient(90deg, #dcefff, #f4defd);
}
</style>
