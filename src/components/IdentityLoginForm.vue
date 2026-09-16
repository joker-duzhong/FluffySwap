<template>
  <view class="identity-form">
    <text class="desc">{{ auth.phoneRequired ? '验证手机号后即可登录，各端共用同一账户' : '使用微信登录，首次登录需验证手机号' }}</text>
    <text v-if="message" class="error" role="alert">{{ message }}</text>
    <button v-if="!auth.phoneRequired" class="login-btn" :disabled="busy || retrySeconds > 0" :loading="busy" @click="startLogin">
      {{ retrySeconds > 0 ? `${retrySeconds}秒后重试` : busy ? '登录中' : '微信登录' }}
    </button>
    <template v-else>
      <template v-if="!smsMode">
        <button v-if="agreed" class="login-btn" open-type="getPhoneNumber" :disabled="busy || retrySeconds > 0" :loading="busy" @getphonenumber="handlePhone">
          {{ busy ? '验证中' : retrySeconds > 0 ? `${retrySeconds}秒后重试` : '授权手机号并登录' }}
        </button>
        <button v-else class="login-btn" :disabled="busy" @click="requireAgreement">授权手机号并登录</button>
      </template>
      <view v-else class="sms-fields">
        <view class="field">
          <text class="label">手机号</text>
          <input v-model="phone" type="number" :maxlength="11" placeholder="请输入中国大陆手机号" :disabled="busy" aria-label="手机号" />
        </view>
        <view class="field">
          <text class="label">短信验证码</text>
          <view class="code-row">
            <input v-model="smsCode" type="number" :maxlength="4" placeholder="4位验证码" :disabled="busy" aria-label="短信验证码" />
            <button class="send-code" :disabled="busy || sendingSms || smsSeconds > 0 || retrySeconds > 0" @click="sendSms">
              {{ smsSeconds > 0 ? `${smsSeconds}秒后重发` : sendingSms ? '发送中' : '获取验证码' }}
            </button>
          </view>
        </view>
        <button class="login-btn" :disabled="busy || sendingSms || retrySeconds > 0" :loading="busy" @click="submitSms">{{ busy ? '验证中' : '验证并登录' }}</button>
      </view>
      <button class="alternative" :disabled="busy || sendingSms" @click="smsMode = !smsMode">{{ smsMode ? '使用微信手机号授权' : '使用短信验证码' }}</button>
      <button v-if="expired" class="alternative" :disabled="busy" @click="startLogin">验证已过期，重新微信登录</button>
    </template>
    <view class="agreement">
      <checkbox-group @change="handleAgreement">
        <label class="agreement-check"><checkbox value="accepted" :checked="agreed" color="#5660ff" /><text>已阅读并同意</text></label>
      </checkbox-group>
      <text class="link" @click="showAgreement('user')">《用户协议》</text>
      <text>和</text>
      <text class="link" @click="showAgreement('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi } from '@/services/aurakey'
import { ApiError, errorMessage } from '@/services/apiError'

const emit = defineEmits<{ (event: 'logged-in'): void }>()
const auth = useAuthStore()
const agreed = ref(false)
const smsMode = ref(false)
const phone = ref('')
const smsCode = ref('')
const sendingSms = ref(false)
const localError = ref('')
const now = ref(Date.now())
const smsRetryAt = ref(0)
const timer = setInterval(() => { now.value = Date.now() }, 1000)
onUnmounted(() => clearInterval(timer))

const busy = computed(() => auth.identityBusy || auth.profileLoading)
const message = computed(() => localError.value || auth.identityError)
const retrySeconds = computed(() => Math.max(0, Math.ceil((auth.retryAt - now.value) / 1000)))
const smsSeconds = computed(() => Math.max(0, Math.ceil((smsRetryAt.value - now.value) / 1000)))
const expired = computed(() => auth.phoneRequired && Date.parse(auth.ticketExpiresAt) <= now.value)
const showAgreement = (type: 'user' | 'privacy') => uni.navigateTo({ url: `/pages/agreement/agreement?type=${type}` })
const handleAgreement = (event: { detail?: { value?: string[] } }) => { agreed.value = Boolean(event.detail?.value?.includes('accepted')) }
const requireAgreement = () => { localError.value = '请先阅读并同意用户协议和隐私政策' }

const run = async (action: () => Promise<unknown>) => {
  if (busy.value || sendingSms.value) return
  localError.value = ''
  try {
    await action()
    if (auth.isLoggedIn) emit('logged-in')
  } catch (error) {
    if (error instanceof ApiError && error.status === 499) return
    localError.value = auth.identityError || errorMessage(error)
  }
}
const startLogin = () => run(() => auth.startIdentity(true))

const handlePhone = (event: { detail?: { code?: string } }) => {
  const code = event.detail?.code
  if (!code) {
    localError.value = '未授权手机号，可以重新授权或使用短信验证码'
    return
  }
  void run(() => auth.completePhone(code, agreed.value))
}

const validatePhone = () => {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) throw new ApiError('请输入正确的11位中国大陆手机号', 400)
}

const sendSms = async () => {
  if (sendingSms.value || busy.value || smsSeconds.value > 0) return
  localError.value = ''
  try {
    auth.requireTicket(agreed.value)
    validatePhone()
    sendingSms.value = true
    await aurakeyApi.auth.sendSms(phone.value)
    smsRetryAt.value = Date.now() + 60000
    uni.showToast({ title: '验证码已发送', icon: 'none' })
  } catch (error) {
    localError.value = errorMessage(error)
    if (error instanceof ApiError && error.status === 429) smsRetryAt.value = Date.now() + Math.max(1, error.retryAfter) * 1000
  } finally {
    sendingSms.value = false
  }
}

const submitSms = () => run(async () => {
  validatePhone()
  if (!/^\d{4}$/.test(smsCode.value)) throw new ApiError('请输入4位短信验证码', 400)
  await auth.completeSms(phone.value, smsCode.value, agreed.value)
})
</script>

<style scoped lang="scss">
.identity-form { width: 100%; }
.desc { display: block; margin-top: 14rpx; color: rgba(255, 255, 255, 0.76); font-size: 28rpx; line-height: 1.6; text-align: center; }
.error { display: block; margin-top: 24rpx; color: #ffb4b4; font-size: 28rpx; line-height: 1.5; overflow-wrap: anywhere; }
.login-btn { width: 100%; min-height: 96rpx; margin-top: 32rpx; border-radius: 16rpx; color: #fff; font-size: 30rpx; font-weight: 700; line-height: 96rpx; background: #5660ff; }
button[disabled] { opacity: 0.55; }
.alternative { margin-top: 12rpx; min-height: 80rpx; color: #8feaff; font-size: 28rpx; line-height: 80rpx; background: transparent; }
.alternative::after, .send-code::after { border: none; }
.sms-fields { margin-top: 24rpx; }
.field { margin-top: 20rpx; padding: 18rpx 22rpx; border-radius: 16rpx; background: rgba(255, 255, 255, 0.08); }
.label { display: block; margin-bottom: 12rpx; color: rgba(255, 255, 255, 0.76); font-size: 28rpx; }
input { min-width: 0; height: 60rpx; font-size: 32rpx; color: #fff; }
.code-row { display: flex; align-items: center; gap: 16rpx; }
.code-row input { flex: 1; width: 0; }
.send-code { padding: 0 8rpx; flex-shrink: 0; min-height: 72rpx; line-height: 72rpx; font-size: 26rpx; color: #8feaff; background: transparent; }
.agreement { margin-top: 24rpx; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8rpx; color: rgba(255, 255, 255, 0.76); font-size: 26rpx; line-height: 1.7; }
.agreement-check { display: flex; align-items: center; min-height: 80rpx; }
.link { display: inline-block; padding: 8rpx 0; color: #8feaff; }
</style>
