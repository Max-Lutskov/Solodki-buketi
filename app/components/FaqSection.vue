<script setup lang="ts">
import type { Faq } from '~/data/types'

const props = withDefaults(defineProps<{ items: Faq[], title?: string }>(), { title: 'Часті питання' })
const accordion = computed(() => props.items.map(f => ({ label: f.q, content: f.a })))
</script>

<template>
  <section aria-labelledby="faq-title">
    <h2 id="faq-title" class="title-lg">
      {{ title }}
    </h2>
    <UAccordion
      :items="accordion"
      type="multiple"
      class="mt-6 max-w-3xl"
      :ui="{ trigger: 'text-base font-semibold py-4', body: 'text-[15px] leading-relaxed text-cocoa-700 pb-5' }"
    />
  </section>
</template>
