<template>
  <image
    class="aura-icon"
    :class="{ glow }"
    :src="src"
    mode="aspectFit"
    :style="iconStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconSrc, type AuraIconName } from '@/config/icons'

const props = withDefaults(
  defineProps<{
    name: AuraIconName
    size?: number
    glow?: boolean
  }>(),
  {
    size: 44,
    glow: false,
  }
)

const src = computed(() => getIconSrc(props.name))
const iconStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`,
}))
</script>

<style scoped lang="scss">
.aura-icon {
  display: block;
  flex-shrink: 0;

  &.glow {
    filter: drop-shadow(0 0 10rpx rgba(77, 166, 255, 0.75));
  }
}
</style>

