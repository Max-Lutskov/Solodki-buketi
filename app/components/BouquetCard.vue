<script setup lang="ts">
import type { Bouquet } from '~/data/types'
import { formatPrice } from '~/data/bouquets'

defineProps<{ bouquet: Bouquet }>()
</script>

<template>
  <article class="group relative">
    <div class="arch relative aspect-[3/4]">
      <BouquetPhoto
        :bouquet="bouquet"
        sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
        class="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span
        v-if="bouquet.alcohol"
        class="absolute top-[18%] right-2 rounded-full bg-cocoa-900/85 px-2 py-0.5 text-xs font-semibold text-white"
        title="Містить алкоголь, лише для покупців від 18 років"
      >18+</span>
    </div>
    <div class="mt-3 flex items-baseline justify-between gap-2">
      <h3 class="font-display text-lg leading-tight font-semibold sm:text-xl">
        <NuxtLink :to="`/roboty/${bouquet.slug}/`" class="after:absolute after:inset-0 focus-visible:outline-none">
          {{ bouquet.title }}
        </NuxtLink>
      </h3>
    </div>
    <p class="mt-1 text-[15px] font-semibold text-wine-700">
      {{ formatPrice(bouquet.price) }}
    </p>
  </article>
</template>

<style scoped>
/* Фокус з клавіатури на всій картці, бо посилання розтягнуте на неї */
article:has(a:focus-visible) {
  outline: 2px solid var(--color-wine-700);
  outline-offset: 6px;
  border-radius: 1.25rem;
}
</style>
