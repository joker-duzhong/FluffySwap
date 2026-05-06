<template>
  <view class="recharge-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="nav-title">充值中心</text>
      <view class="nav-btn" style="opacity: 0"></view>
    </view>

    <!-- 当前余额 -->
    <view class="balance-card">
      <text class="label">当前算力</text>
      <view class="balance-value">
        <text class="value">{{ balance }}</text>
        <text class="unit">点</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="products-section">
      <text class="section-title">算力包</text>
      <view class="products-grid">
        <view
          v-for="product in pointProducts"
          :key="product.id"
          class="product-item"
          :class="{ selected: selectedProduct?.id === product.id, hot: product.tag }"
          @click="selectProduct(product)"
        >
          <view v-if="product.tag" class="tag">{{ product.tag }}</view>
          <text class="product-name">{{ product.name }}</text>
          <view class="product-points">
            <text class="points">{{ product.point_amount }}</text>
            <text class="bonus" v-if="product.bonus_amount > 0">
              +{{ product.bonus_amount }}
            </text>
          </view>
          <view class="product-price">
            <text class="price">¥{{ (product.price / 100).toFixed(2) }}</text>
            <text v-if="product.original_price" class="original-price">
              ¥{{ (product.original_price / 100).toFixed(2) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员套餐 -->
    <view class="products-section">
      <text class="section-title">会员套餐</text>
      <view class="vip-list">
        <view
          v-for="product in vipProducts"
          :key="product.id"
          class="vip-item"
          :class="{ selected: selectedProduct?.id === product.id }"
          @click="selectProduct(product)"
        >
          <view class="vip-left">
            <view class="vip-header">
              <text class="vip-name">{{ product.name }}</text>
              <view v-if="product.tag" class="vip-tag">{{ product.tag }}</view>
            </view>
            <text class="vip-desc">专属特权，畅享创作</text>
          </view>
          <view class="vip-right">
            <text class="vip-price">¥{{ (product.price / 100).toFixed(2) }}</text>
            <text v-if="product.original_price" class="vip-original">
              ¥{{ (product.original_price / 100).toFixed(2) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 支付按钮 -->
    <view class="pay-section">
      <button
        class="pay-btn"
        :class="{ disabled: !selectedProduct }"
        :disabled="!selectedProduct"
        @click="handlePay"
      >
        <text v-if="selectedProduct">
          立即支付 ¥{{ (selectedProduct.price / 100).toFixed(2) }}
        </text>
        <text v-else>请选择商品</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { client } from '@/services/uniClient'

interface Product {
  id: string
  type: string
  name: string
  price: number
  original_price?: number
  point_amount: number
  bonus_amount: number
  tag?: string
}

const authStore = useAuthStore()

const balance = computed(() => authStore.balance)
const openid = computed(() => authStore.userProfile?.openid || '')
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)

const pointProducts = computed(() => products.value.filter((p) => p.type === 'point_pack'))
const vipProducts = computed(() => products.value.filter((p) => p.type === 'vip'))

const goBack = () => {
  uni.navigateBack()
}

const selectProduct = (product: Product) => {
  selectedProduct.value = product
}

const handlePay = async () => {
  if (!selectedProduct.value) return

  try {
    if (!openid.value) {
      uni.showModal({
        title: '缺少支付信息',
        content: '当前账号资料中缺少 openid，请重新登录后再支付。',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: '/pages/login/login' })
          }
        },
      })
      return
    }

    uni.showLoading({ title: '正在创建订单...' })
    const orderRes = await client.POST('/aurakey/order/create', {
      body: {
        product_id: selectedProduct.value.id,
        openid: openid.value,
      },
    })

    if (orderRes.data?.code !== 200 || !orderRes.data.data) {
      throw new Error(orderRes.data?.message || '创建订单失败')
    }

    const { order_no, pay_params } = orderRes.data.data

    // 3. 调起微信支付
    uni.hideLoading()
    uni.requestPayment({
      ...pay_params,
      success: () => {
        // 支付成功，轮询订单状态
        checkOrderStatus(order_no)
      },
      fail: (err: UniApp.GeneralCallbackResult) => {
        if (err.errMsg.includes('cancel')) {
          uni.showToast({ title: '支付已取消', icon: 'none' })
        } else {
          uni.showToast({ title: '支付失败', icon: 'none' })
        }
      },
    })
  } catch (error: any) {
    uni.hideLoading()
    console.error('支付失败:', error)
    uni.showToast({ title: error.message || '支付失败', icon: 'none' })
  }
}

const checkOrderStatus = async (orderNo: string) => {
  uni.showLoading({ title: '确认支付结果...' })

  // 延迟 1.5 秒后查询
  setTimeout(async () => {
    try {
      const res = await client.GET('/aurakey/order/status/{order_no}', {
        params: {
          path: {
            order_no: orderNo,
          },
        },
      })

      uni.hideLoading()

      if (res.data?.code === 200 && res.data.data) {
        const { status } = res.data.data
        if (status === 'success') {
          uni.showToast({ title: '支付成功', icon: 'success' })
          // 刷新用户信息
          setTimeout(() => {
            loadUserProfile()
          }, 1000)
        } else if (status === 'waiting') {
          // 继续等待
          uni.showToast({ title: '支付确认中，请稍候...', icon: 'none' })
          setTimeout(() => checkOrderStatus(orderNo), 2000)
        } else {
          uni.showToast({ title: '支付失败', icon: 'none' })
        }
      }
    } catch (error) {
      uni.hideLoading()
      console.error('查询订单失败:', error)
      uni.showToast({ title: '查询订单失败', icon: 'none' })
    }
  }, 1500)
}

const loadProducts = async () => {
  try {
    const res = await client.GET('/aurakey/store/products')
    if (res.data?.code === 200 && res.data.data) {
      products.value = res.data.data
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    uni.showToast({ title: '加载商品失败', icon: 'none' })
  }
}

const loadUserProfile = async () => {
  try {
    const res = await client.GET('/aurakey/user/profile')
    if (res.data?.code === 200 && res.data.data) {
      authStore.setUserProfile(res.data.data)
    }
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.recharge-container {
  width: 100%;
  min-height: 100vh;
  background: #0A0A0A;
  padding-bottom: 200rpx;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 32rpx;
  padding-right: 32rpx;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20rpx);
  z-index: 100;

  .nav-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 32rpx;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #fff;
  }

  .nav-title {
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
  }
}

.balance-card {
  margin-top: calc(88rpx + env(safe-area-inset-top) + 32rpx);
  margin-left: 32rpx;
  margin-right: 32rpx;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(181, 55, 255, 0.1) 100%);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  text-align: center;

  .label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 16rpx;
  }

  .balance-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8rpx;

    .value {
      font-size: 72rpx;
      font-weight: bold;
      background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .unit {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.products-section {
  margin-top: 48rpx;
  padding: 0 32rpx;

  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 24rpx;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;

    .product-item {
      padding: 32rpx 24rpx;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20rpx);
      border-radius: 16rpx;
      border: 2rpx solid transparent;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;

      &.selected {
        border-color: #00D4FF;
        background: rgba(0, 212, 255, 0.1);
      }

      &.hot {
        border-color: rgba(255, 215, 0, 0.3);
      }

      .tag {
        position: absolute;
        top: 0;
        right: 0;
        padding: 4rpx 16rpx;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        border-radius: 0 16rpx 0 16rpx;
        font-size: 20rpx;
        color: #000;
        font-weight: bold;
      }

      .product-name {
        font-size: 28rpx;
        color: #fff;
        font-weight: 500;
      }

      .product-points {
        display: flex;
        align-items: baseline;
        gap: 8rpx;

        .points {
          font-size: 56rpx;
          font-weight: bold;
          background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bonus {
          font-size: 24rpx;
          color: #FFD700;
        }
      }

      .product-price {
        display: flex;
        align-items: baseline;
        gap: 8rpx;

        .price {
          font-size: 32rpx;
          color: #fff;
          font-weight: 500;
        }

        .original-price {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.3);
          text-decoration: line-through;
        }
      }
    }
  }

  .vip-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .vip-item {
      padding: 32rpx;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20rpx);
      border-radius: 16rpx;
      border: 2rpx solid transparent;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.selected {
        border-color: #FFD700;
        background: rgba(255, 215, 0, 0.1);
      }

      .vip-left {
        display: flex;
        flex-direction: column;
        gap: 12rpx;

        .vip-header {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .vip-name {
            font-size: 32rpx;
            color: #fff;
            font-weight: bold;
          }

          .vip-tag {
            padding: 4rpx 12rpx;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border-radius: 8rpx;
            font-size: 20rpx;
            color: #000;
            font-weight: bold;
          }
        }

        .vip-desc {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .vip-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4rpx;

        .vip-price {
          font-size: 40rpx;
          color: #FFD700;
          font-weight: bold;
        }

        .vip-original {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.3);
          text-decoration: line-through;
        }
      }
    }
  }
}

.pay-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);

  .pay-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #00D4FF 0%, #B537FF 100%);
    border-radius: 48rpx;
    border: none;
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
    box-shadow: 0 8rpx 24rpx rgba(0, 212, 255, 0.3);

    &.disabled {
      opacity: 0.5;
      box-shadow: none;
    }
  }
}
</style>
