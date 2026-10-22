<script setup lang="ts">
import { company, nav } from '~/data/site'

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-cocoa-900/5 bg-milk/90 backdrop-blur">
    <UContainer class="flex h-16 items-center justify-between gap-6">
      <NuxtLink to="/" :aria-label="`${company.name}, на головну`">
        <AppLogo />
      </NuxtLink>

      <nav class="hidden items-center gap-7 text-[15px] lg:flex" aria-label="Головне меню">
        <NuxtLink
          v-for="l in nav"
          :key="l.to"
          :to="l.to"
          class="text-cocoa-700 transition-colors hover:text-cocoa-950"
          active-class="text-wine-700"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <UButton to="/zibraty-svij/" label="Замовити" class="hidden sm:inline-flex" />
        <USlideover v-model:open="menuOpen" title="Меню" side="right" :ui="{ content: 'max-w-xs' }">
          <UButton icon="i-lucide-menu" color="neutral" variant="ghost" size="lg" aria-label="Відкрити меню" class="lg:hidden" />
          <template #body>
            <nav class="flex flex-col gap-1 text-lg" aria-label="Меню">
              <NuxtLink v-for="l in nav" :key="l.to" :to="l.to" class="rounded-lg px-3 py-2.5 hover:bg-cocoa-100">
                {{ l.label }}
              </NuxtLink>
            </nav>
          </template>
          <template #footer>
            <UButton to="/zibraty-svij/" label="Зібрати свій букет" size="xl" block />
          </template>
        </USlideover>
      </div>
    </UContainer>
  </header>
</template>
