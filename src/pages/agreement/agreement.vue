<template>
  <view class="agreement-page">
    <AppTopNav :title="pageTitle" back @back="goBack" />

    <scroll-view class="content-scroll" scroll-y>
      <view class="content">
        <view v-for="section in sections" :key="section.title" class="section">
          <text class="section-title">{{ section.title }}</text>
          <text class="section-text">{{ section.text }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'

type AgreementType = 'user' | 'privacy'

const type = ref<AgreementType>('user')

const userSections = [
  {
    title: '一、服务说明',
    text: '灵钥为用户提供基于人工智能的图片生成、模板浏览、作品管理及相关会员权益服务。用户应按照页面提示和平台规则合理使用本服务。',
  },
  {
    title: '二、账号与授权',
    text: '用户使用登录、生成、保存等功能时，可能需要通过微信小程序授权完成身份识别。用户应确保授权信息真实、合法，并妥善保管账号使用权限。',
  },
  {
    title: '三、内容规范',
    text: '用户不得使用本服务生成、上传、传播违法违规、侵权、欺诈、恶意或违反公序良俗的内容。因用户输入内容或使用行为产生的责任由用户自行承担。',
  },
  {
    title: '四、会员与积分',
    text: '会员权益、灵感值、充值、消耗和退款规则以产品页面展示及实际交易记录为准。因网络、系统维护或第三方服务导致的短暂不可用，平台将尽力恢复。',
  },
  {
    title: '五、协议更新',
    text: '平台可根据业务调整、法律法规或产品变化更新本协议。更新后继续使用本服务，即视为用户已理解并接受更新后的内容。',
  },
]

const privacySections = [
  {
    title: '一、信息收集',
    text: '为提供登录、生成、作品管理、订单与会员服务，我们可能收集微信授权标识、昵称、头像、手机号授权结果、生成记录、订单记录及设备运行所需的基础信息。',
  },
  {
    title: '二、使用目的',
    text: '上述信息仅用于身份识别、服务履约、作品展示、积分结算、订单处理、客服支持、安全风控及法律法规要求的必要场景。',
  },
  {
    title: '三、存储与保护',
    text: '我们会采取合理的安全措施保护用户信息，避免未经授权的访问、披露、篡改或丢失。除法律法规要求或获得用户授权外，不会公开披露用户个人信息。',
  },
  {
    title: '四、第三方服务',
    text: '小程序运行可能依赖微信开放能力、支付能力及云端生成服务。相关第三方会在完成必要功能范围内处理信息，并受其自身隐私规则约束。',
  },
  {
    title: '五、用户权利',
    text: '用户可依法查询、更正、删除个人信息，或撤回授权、注销账号。具体流程可通过后续公布的客服或设置入口提交申请。',
  },
]

const pageTitle = computed(() => (type.value === 'privacy' ? '隐私政策' : '用户协议'))
const sections = computed(() => (type.value === 'privacy' ? privacySections : userSections))

const goBack = () => uni.navigateBack()

const getPageOption = (key: string) => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  return currentPage?.options?.[key] || ''
}

onMounted(() => {
  type.value = getPageOption('type') === 'privacy' ? 'privacy' : 'user'
})
</script>

<style scoped lang="scss">
.agreement-page {
  height: 100vh;
  background: #050506;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-scroll {
  flex: 1;
  min-height: 0;
  height: auto;
}

.content {
  padding: 24rpx 34rpx 56rpx;
}

.section {
  margin-bottom: 34rpx;
}

.section-title,
.section-text {
  display: block;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.section-text {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.68);
  font-size: 26rpx;
  line-height: 1.7;
}
</style>
