<script setup lang="ts">
import { company, instagramUrl } from '~/data/site'
import { breadcrumbSchema, useJsonLd } from '~/utils/schema'

usePageMeta({
  title: 'Про мене — Тетяна, солодкі букети в Жмеринці',
  description: 'Тетяна Луцкова-Ковальська збирає букети з цукерок, кошики й бокси вручну під кожне замовлення. Жмеринка, Вінниця, область.'
})
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useJsonLd(() => [breadcrumbSchema(siteUrl, [{ name: 'Про мене', path: '/pro-mene/' }])])
</script>

<template>
  <UContainer class="grid gap-10 pt-10 pb-8 md:grid-cols-[1fr_1.2fr] md:items-start lg:gap-16">
    <!-- MOCK: фото Тетяни за роботою (кадр з оригіналу Reels, з її згоди) -->
    <div class="arch mx-auto aspect-[3/4] w-full max-w-sm">
      <BouquetArt :seed="3" />
    </div>
    <div>
      <h1 class="title-xl">
        Привіт, я Тетяна
      </h1>
      <!-- MOCK: текст «Про мене» від Тетяни (скільки років робить, як почала) -->
      <div class="prose-sweet mt-6 text-lg">
        <p>Я збираю солодкі букети в Жмеринці: з цукерок, шоколаду, з шампанським чи коньяком, з іграшками й листівками.</p>
        <p>Майже кожен букет роблю під конкретну людину. Ви кажете, що вона любить і скільки готові витратити, а я підбираю склад і показую, що вийде.</p>
        <p>
          Нові роботи викладаю в <a :href="instagramUrl" target="_blank" rel="noopener">Instagram</a>.
        </p>
      </div>
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton to="/roboty/" label="Мої роботи" size="xl" />
        <UButton to="/kontakty/" label="Контакти" size="xl" color="neutral" variant="outline" />
      </div>
      <p class="sr-only">
        {{ company.master }}
      </p>
    </div>
  </UContainer>
</template>
