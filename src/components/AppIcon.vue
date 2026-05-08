<template>
  <image class="app-icon" :src="src" mode="aspectFit" :style="style" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src: string
  size?: number
}>()

const style = computed(() => ({
  width: `${props.size || 32}rpx`,
  height: `${props.size || 32}rpx`,
}))
</script>

<style scoped lang="scss">
.app-icon {
  display: block;
  flex-shrink: 0;
}
</style>
