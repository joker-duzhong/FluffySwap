<template>
  <view class="sheet-mask" @click="close">
    <view class="sheet" @click.stop>
      <view class="sheet-header">
        <text>编辑资料</text>
        <view class="close" @click="close">×</view>
      </view>

      <view class="avatar-picker" @click="chooseAvatar">
        <image :src="formAvatar || ASSETS.defaultAvatar" mode="aspectFill" />
        <text>更换头像</text>
      </view>

      <view class="field">
        <text>昵称</text>
        <input v-model="formNickname" maxlength="100" placeholder="请输入昵称" />
      </view>

      <button class="save-btn" :disabled="saving" :loading="saving" @click="save">
        {{ saving ? '保存中' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ASSETS } from '@/config/assets'
import { aurakeyApi } from '@/services/aurakey'
import { useAuthStore } from '@/stores/authStore'
import { uploadAvatar } from '@/utils/qiniu_upload'

const props = defineProps<{
  nickname: string
  avatar: string
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'saved'): void
}>()

const authStore = useAuthStore()
const formNickname = ref(props.nickname)
const formAvatar = ref(props.avatar)
const saving = ref(false)

const close = () => {
  if (!saving.value) emit('close')
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      formAvatar.value = res.tempFilePaths[0] || formAvatar.value
    },
    fail: (error: any) => {
      if (error?.errMsg?.includes('cancel')) return
      uni.showToast({ title: '选择头像失败', icon: 'none' })
    },
  })
}

const uploadAvatarIfNeeded = async () => {
  if (!formAvatar.value || formAvatar.value === props.avatar || /^https?:\/\//.test(formAvatar.value)) {
    return formAvatar.value
  }

  const uploaded = await uploadAvatar(formAvatar.value)
  return uploaded.url
}

const save = async () => {
  const nickname = formNickname.value.trim()
  if (!nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  saving.value = true
  try {
    const avatar = await uploadAvatarIfNeeded()
    const profile = await aurakeyApi.auth.updateMe({ nickname, avatar })
    authStore.updateProfilePatch({
      nickname: profile.nickname || nickname,
      avatar: profile.avatar || avatar,
    })
    uni.showToast({ title: '已保存', icon: 'success' })
    emit('saved')
  } catch (error: any) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

watch(
  () => [props.nickname, props.avatar],
  () => {
    formNickname.value = props.nickname
    formAvatar.value = props.avatar
  },
)
</script>

<style scoped lang="scss">
.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.66);
}

.sheet {
  width: 100%;
  padding: 34rpx 34rpx calc(34rpx + env(safe-area-inset-bottom));
  border-radius: 30rpx 30rpx 0 0;
  background: #18191f;
}

.sheet-header {
  height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

.close {
  width: 54rpx;
  height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.64);
  font-size: 42rpx;
}

.avatar-picker {
  margin: 36rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  color: rgba(255, 255, 255, 0.62);
  font-size: 24rpx;

  image {
    width: 138rpx;
    height: 138rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
}

.field {
  min-height: 116rpx;
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.08);

  text {
    display: block;
    margin-bottom: 12rpx;
    color: rgba(255, 255, 255, 0.42);
    font-size: 22rpx;
  }

  input {
    height: 46rpx;
    color: #fff;
    font-size: 30rpx;
  }
}

.save-btn {
  height: 88rpx;
  margin-top: 34rpx;
  border-radius: 16rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 88rpx;
  background: #5862ff;

  &[disabled] {
    opacity: 0.55;
  }
}
</style>
