<script setup lang="ts">
import { messengerLinks, useCopyForMessenger } from '~/composables/useMessengers'

// На сторінці форми кнопка «Замовити» нікуди не веде, тож там панелі немає
const route = useRoute()
const hidden = computed(() => route.path.startsWith('/zibraty-svij'))
const links = messengerLinks()
const copy = useCopyForMessenger()
</script>

<template>
  <!-- Липка панель замовлення на телефоні -->
  <div
    v-if="!hidden"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa-900/10 bg-milk/95 p-2 backdrop-blur md:hidden"
    style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom))"
  >
    <div class="flex items-stretch gap-2">
      <UButton to="/zibraty-svij/" label="Замовити букет" size="xl" block class="flex-1" />
      <UButton
        v-for="m in links.slice(0, 2)"
        :key="m.name"
        :to="m.href"
        :icon="m.icon"
        :aria-label="`Написати у ${m.name}`"
        color="neutral"
        variant="outline"
        size="xl"
        target="_blank"
        rel="noopener"
        @click="copy(m)"
      />
    </div>
  </div>
</template>
