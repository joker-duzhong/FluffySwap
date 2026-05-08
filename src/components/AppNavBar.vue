<template>
  <AppTopNav :title="title" :back="back" @back="$emit('back')">
    <template #left>
      <slot name="left"></slot>
    </template>
    <template #right>
      <slot name="right"></slot>
    </template>
  </AppTopNav>
</template>

<script setup lang="ts">
import AppTopNav from './AppTopNav.vue'

defineProps<{
  title?: string
  back?: boolean
}>()

defineEmits<{
  (event: 'back'): void
}>()
</script>

<style scoped lang="scss">
</style>
