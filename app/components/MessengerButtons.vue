<script setup lang="ts">
import { messengerLinks, useCopyForMessenger } from '~/composables/useMessengers'

const props = withDefaults(defineProps<{ text?: string, size?: 'md' | 'lg' | 'xl' }>(), { size: 'lg' })
const links = computed(() => messengerLinks(props.text))
const copy = useCopyForMessenger()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      v-for="m in links"
      :key="m.name"
      :to="m.href"
      :icon="m.icon"
      :label="m.name"
      :size="size"
      color="neutral"
      variant="outline"
      target="_blank"
      rel="noopener"
      @click="copy(m)"
    />
  </div>
</template>
