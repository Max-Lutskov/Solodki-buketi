<script setup lang="ts">
import { company, instagramUrl } from '~/data/site'
import { breadcrumbSchema, useJsonLd } from '~/utils/schema'

usePageMeta({
  title: 'Контакти — солодкі букети, Жмеринка і Вінниця',
  description: 'Як замовити солодкий букет: телефон, Viber, Telegram, Instagram. Жмеринка, Вінниця, Вінницька область.'
})
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useJsonLd(() => [breadcrumbSchema(siteUrl, [{ name: 'Контакти', path: '/kontakty/' }])])
</script>

<template>
  <UContainer class="pt-10 pb-8">
    <h1 class="title-xl">
      Контакти
    </h1>
    <p class="mt-4 max-w-xl text-lg leading-relaxed text-cocoa-700">
      Напишіть у зручний месенджер або залиште заявку — я відповім і узгоджу букет.
    </p>

    <div class="mt-10 grid max-w-3xl gap-8 sm:grid-cols-2">
      <div>
        <h2 class="text-sm text-cocoa-600">
          Телефон
        </h2>
        <a :href="`tel:${company.phone}`" class="mt-1 block font-display text-3xl font-semibold">{{ company.phoneDisplay }}</a>
      </div>
      <div>
        <h2 class="text-sm text-cocoa-600">
          Instagram
        </h2>
        <a :href="instagramUrl" target="_blank" rel="noopener" class="mt-1 block text-lg font-medium text-wine-700 underline underline-offset-4">@{{ company.instagram }}</a>
      </div>
      <div class="sm:col-span-2">
        <h2 class="text-sm text-cocoa-600">
          Месенджери
        </h2>
        <MessengerButtons size="xl" class="mt-2" />
      </div>
      <div class="sm:col-span-2">
        <h2 class="text-sm text-cocoa-600">
          Де
        </h2>
        <p class="mt-1 text-lg">
          Самовивіз у Браїлові. Доставка по Жмеринці, Вінниці та області.
        </p>
      </div>
    </div>

    <UButton to="/zibraty-svij/" label="Залишити заявку" size="xl" class="mt-10" />
  </UContainer>
</template>
