<template>
  <view class="recharge-page" v-if="useAppStore().isReviewing">
    <AppTopNav back @back="goBack" />
    <view class="reviewing-placeholder">
      <text class="reviewing-text">会员中心·VIP</text>
      <text class="reviewing-subtitle">敬请期待</text>
    </view>
  </view>
  <view class="recharge-page" v-else>
    <image class="hero-bg" :src="ASSETS.vipHero" mode="widthFix" />
    <AppTopNav back @back="goBack" />

    <view class="hero-content">
      <view class="title-wrap">
        <text class="title">会员中心·VIP</text>
        <text v-if="rechargeTag" class="tag">{{ rechargeTag }}</text>
      </view>
      <text v-if="rechargeSubtitle" class="desc">{{ rechargeSubtitle }}</text>
    </view>

    <PageSkeleton v-if="loading" class="plans-skeleton" variant="grid" :rows="3" />
    <scroll-view v-else class="plans" scroll-x :show-scrollbar="false">
      <view class="plans-inner">
        <RechargeProductCard v-for="product in products" :key="product.id" :product="product"
          :active="selectedProduct?.id === product.id" @select="selectedProduct = product" />
      </view>
    </scroll-view>

    <button class="open-btn" :disabled="!selectedProduct || paying" :loading="paying" @click="handlePay">
      {{ paying ? '处理中' : payButtonText }}
    </button>
    <text class="agreement" @click="showUserAgreement">开通会员代表接受《会员协议》</text>

    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="showLoginSheet = false" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import RechargeProductCard from './components/RechargeProductCard.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { aurakeyApi, type ProductItem } from '@/services/aurakey'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const products = ref<ProductItem[]>([])
const selectedProduct = ref<ProductItem | null>(null)
const paymentOpenid = ref('')
const showLoginSheet = ref(false)
const loading = ref(false)
const paying = ref(false)

const rechargeTag = computed(() => appStore.customJSON.recharge_tag)
const rechargeSubtitle = computed(() => appStore.customJSON.recharge_subtitle)
const payButtonText = computed(() => selectedProduct.value?.type === 'point_pack' ? '立即购买' : '开通会员')

const goBack = () => uni.navigateBack()
const showUserAgreement = () => uni.navigateTo({ url: '/pages/agreement/agreement?type=user' })

const loadProducts = async () => {
  loading.value = true
  try {
    const productData = await aurakeyApi.store.products()
    products.value = productData.items
    paymentOpenid.value = authStore.userProfile?.openid || ''
    selectedProduct.value = products.value[0] || null
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const requestPayment = (payParams: Record<string, any>) =>
  new Promise<void>((resolve, reject) => {
    uni.requestPayment({
      ...payParams,
      success: () => resolve(),
      fail: reject,
    } as unknown as UniApp.RequestPaymentOptions)
  })

const isPaidStatus = (status: string) => ['paid', 'success', 'finished', 'completed'].includes(status.toLowerCase())

const confirmOrderPaid = async (orderNo: string) => {
  for (let index = 0; index < 3; index += 1) {
    const orderStatus = await aurakeyApi.order.status(orderNo)
    if (isPaidStatus(orderStatus.status)) return
    if (index < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

const handlePay = async () => {
  if (!selectedProduct.value) return
  if (!authStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    showLoginSheet.value = true
    return
  }
  if (!paymentOpenid.value) {
    uni.showToast({ title: '获取支付信息失败，请稍后重试', icon: 'none' })
    return
  }

  paying.value = true
  try {
    const order = await aurakeyApi.order.create(selectedProduct.value.id, paymentOpenid.value)
    await requestPayment(order.pay_params)
    await confirmOrderPaid(order.order_no)
    authStore.setProfileLoading(true)
    const profile = await aurakeyApi.user.profile()
    authStore.setUserProfile(profile)
    uni.showToast({ title: '支付成功', icon: 'success' })
  } catch (error: any) {
    uni.showToast({ title: error?.errMsg?.includes('cancel') ? '支付未完成' : error.message || '支付失败', icon: 'none' })
  } finally {
    authStore.setProfileLoading(false)
    paying.value = false
  }
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

onMounted(() => {
  uni.$on('auth:login-required', handleLoginRequired)
  loadProducts()
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})
</script>

<style scoped lang="scss">
.recharge-page {
  position: relative;
  min-height: 100vh;
  /* 整体背景修改 */
  background: #170F1F;
  color: #fff;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}

.hero-content {
  position: relative;
  z-index: 1;
  /* 增加边距，将标题往下挤在星图的正下方 */
  margin-top: 420rpx;
  padding: 0 54rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.title {
  display: inline-block;
  font-size: 52rpx;
  font-weight: 800;
  line-height: 64rpx;
  /* 字体颜色渐变实现 */
  background: linear-gradient(90deg, #B7AADB 0%, #FCFBFD 33.65%, #C2ACF9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.tag {
  position: absolute;
  left: 100%;
  top: -4rpx;
  margin-left: 14rpx;
  padding: 4rpx 14rpx;
  border-radius: 100rpx;
  color: #2a1e00;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 32rpx;
  background: #EED781;
  white-space: nowrap;
}

.desc {
  display: block;
  margin-top: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  line-height: 40rpx;
  text-align: center;
}

.plans {
  position: relative;
  z-index: 1;
  width: 100%;
  white-space: nowrap;
}

.plans-inner {
  display: inline-flex;
  gap: 16rpx;
  padding: 48rpx 46rpx 0;
}

.plans-skeleton {
  position: relative;
  z-index: 1;
  margin: 60rpx 46rpx 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.plans-skeleton {
  padding: 0;

  :deep(.skeleton-row) {
    height: 246rpx;
  }
}

.open-btn {
  position: relative;
  z-index: 1;
  height: 104rpx;
  margin: 52rpx 46rpx 0;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  font-size: 32rpx;
  font-weight: 800;
  /* 按钮渐变背景修改 */
  background: linear-gradient(90deg, #CAE1FF 0%, #FFFFFF 50%, #E9D8FF 100%);

  &::after {
    border: 0;
  }
}

.agreement {
  display: block;
  margin-top: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: center;
}
</style>