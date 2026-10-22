<script setup lang="ts">
import { company, instagramUrl, nav } from '~/data/site'
import { landings } from '~/data/landings'
</script>

<template>
  <footer class="mt-24 bg-cocoa-900 text-cocoa-100">
    <UContainer class="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p class="font-display text-2xl font-semibold text-white">
          {{ company.name }}
        </p>
        <p class="mt-3 text-sm leading-relaxed text-cocoa-300">
          Букети з цукерок ручної роботи. {{ company.city }}, Вінниця, {{ company.region }}.
        </p>
      </div>

      <nav aria-label="Розділи сайту">
        <p class="font-semibold text-white">
          Сайт
        </p>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="l in nav" :key="l.to">
            <NuxtLink :to="l.to" class="hover:text-white">{{ l.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <nav aria-label="Міста">
        <p class="font-semibold text-white">
          Де працюю
        </p>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="l in landings" :key="l.path">
            <NuxtLink :to="l.path" class="hover:text-white">{{ l.h1 }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div>
        <p class="font-semibold text-white">
          Зв'язок
        </p>
        <ul class="mt-3 space-y-2 text-sm">
          <li><a :href="`tel:${company.phone}`" class="hover:text-white">{{ company.phoneDisplay }}</a></li>
          <li><a :href="instagramUrl" target="_blank" rel="noopener" class="hover:text-white">Instagram</a></li>
        </ul>
      </div>
    </UContainer>
    <div class="border-t border-white/10">
      <UContainer class="flex flex-wrap justify-between gap-3 py-5 text-xs text-cocoa-400">
        <p>© {{ new Date().getFullYear() }} {{ company.master }}</p>
        <NuxtLink to="/pryvatnist/" class="hover:text-white">Політика конфіденційності</NuxtLink>
      </UContainer>
    </div>
  </footer>
</template>
