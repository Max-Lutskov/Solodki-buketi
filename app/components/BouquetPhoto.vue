<script setup lang="ts">
import type { Bouquet } from '~/data/types'
import { bouquetImage, srcset } from '~/utils/img'

const props = withDefaults(defineProps<{
  bouquet: Bouquet
  /** Яке фото з bouquet.images */
  index?: number
  sizes: string
  /** Для першого екрана: без lazy і з високим пріоритетом */
  eager?: boolean
}>(), { index: 0, eager: false })

const name = computed(() => props.bouquet.images[props.index])
const alt = computed(() => `${props.bouquet.title} — солодкий букет, Жмеринка і Вінниця`)
</script>

<template>
  <img
    v-if="name"
    :src="bouquetImage(name).replace(/\.jpg$/, '-800.webp')"
    :srcset="srcset(bouquetImage(name))"
    :sizes="sizes"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
    width="1200"
    height="1600"
    class="h-full w-full object-cover"
  >
  <BouquetArt v-else :seed="bouquet.id" :alcohol="!!bouquet.alcohol" />
</template>
