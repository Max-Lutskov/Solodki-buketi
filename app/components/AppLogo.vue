<script setup lang="ts">
import { company } from '~/data/site'
</script>

<template>
  <!-- MOCK: текстовий логотип, поки немає назви бренду -->
  <span class="flex items-center gap-2.5">
    <svg viewBox="0 0 32 32" class="size-8 shrink-0" aria-hidden="true">
      <path d="M16 3 C9 3 5 8 5 14 L5 29 L27 29 L27 14 C27 8 23 3 16 3 Z" fill="#f1dcd8" />
      <circle cx="12" cy="15" r="4.2" fill="#c29a5b" />
      <circle cx="20" cy="15" r="4.2" fill="#7f2f3d" />
      <circle cx="16" cy="21.5" r="4.2" fill="#fffaf4" stroke="#ddcbc0" />
    </svg>
    <span class="font-display text-[1.35rem] leading-none font-semibold whitespace-nowrap">{{ company.shortName }}</span>
  </span>
</template>
