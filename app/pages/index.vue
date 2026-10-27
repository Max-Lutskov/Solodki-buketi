<script setup lang="ts">
import { budgetRanges, faq, occasions, steps } from '~/data/site'
import { bouquets, formatPrice } from '~/data/bouquets'
import { faqSchema, useJsonLd } from '~/utils/schema'

usePageMeta({
  title: 'Солодкі букети у Вінниці та Жмеринці — з цукерок',
  description: 'Букети з цукерок, кошики й бокси з алкоголем ручної роботи. Збираю під ваш смак і бюджет. Доставка по Вінниці, Жмеринці та області.'
})
useJsonLd(() => [faqSchema(faq)])

// Букет з hero — першим і в арці, і серед робіт на головній
const featured = bouquets.filter(b => b.featured).sort((a, b) => Number(!!b.hero) - Number(!!a.hero))
const hero = featured[0] ?? bouquets[0]!
const latest = (featured.length >= 4 ? featured : bouquets).slice(0, 8)
</script>

<template>
  <div>
    <!-- Перший екран: текст ліворуч, букет в арці праворуч -->
    <UContainer class="grid items-center gap-10 pt-8 pb-16 md:grid-cols-[1.1fr_1fr] md:pt-14 lg:gap-16">
      <div>
        <h1 class="title-xl">
          Солодкі букети у Вінниці та Жмеринці
        </h1>
        <p class="mt-5 max-w-md text-lg leading-relaxed text-cocoa-700">
          Збираю вручну під ваш смак і бюджет: улюблені цукерки, шампанське чи коньяк, іграшка й листівка.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton to="/zibraty-svij/" label="Зібрати свій букет" size="xl" />
          <UButton to="/roboty/" label="Дивитись роботи" size="xl" color="neutral" variant="outline" />
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-[17rem] sm:max-w-sm md:max-w-md">
        <NuxtLink :to="`/roboty/${hero.slug}/`" class="hero-arch arch block aspect-[3/4]" :aria-label="hero.title">
          <BouquetPhoto :bouquet="hero" sizes="(min-width: 768px) 448px, 90vw" eager />
        </NuxtLink>
        <!-- Бирка з ціною, як на подарунку -->
        <p class="absolute bottom-8 -left-3 rotate-[-4deg] rounded-xl bg-white px-4 py-2.5 shadow-[0_8px_24px_-8px_rgb(58_40_35/.35)] sm:-left-8">
          <span class="block text-xs text-cocoa-600">Букет №{{ hero.id }}</span>
          <span class="font-display text-xl font-semibold text-wine-700">{{ formatPrice(hero.price) }}</span>
        </p>
      </div>
    </UContainer>

    <!-- Як це працює: справжня послідовність, тому з номерами -->
    <section class="bg-rose/50 py-16" aria-labelledby="steps-title">
      <UContainer>
        <h2 id="steps-title" class="title-lg">
          Як замовити
        </h2>
        <ol class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="(s, i) in steps" :key="s.title">
            <span class="font-display text-4xl font-semibold text-wine-700/70">{{ i + 1 }}</span>
            <h3 class="mt-1 text-lg font-semibold">
              {{ s.title }}
            </h3>
            <p class="mt-2 text-[15px] leading-relaxed text-cocoa-700">
              {{ s.text }}
            </p>
          </li>
        </ol>
      </UContainer>
    </section>

    <!-- Останні роботи -->
    <UContainer class="py-16" as="section" aria-labelledby="works-title">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="works-title" class="title-lg">
            Останні роботи
          </h2>
          <p class="mt-2 text-cocoa-700">
            Біля кожної роботи — її реальна ціна.
          </p>
        </div>
        <UButton to="/roboty/" label="Всі роботи" color="neutral" variant="outline" />
      </div>
      <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        <BouquetCard v-for="b in latest" :key="b.slug" :bouquet="b" />
      </div>
      <!-- Після сітки, бо на телефоні кнопка вгорі вже далеко -->
      <div class="mt-10 flex justify-center">
        <UButton to="/roboty/" label="Дивитись усі роботи" size="lg" color="neutral" variant="outline" />
      </div>
    </UContainer>

    <!-- Бюджет і привід ведуть у галерею з фільтром -->
    <UContainer class="grid gap-12 pb-16 lg:grid-cols-2" as="section" aria-label="Підбір за бюджетом і приводом">
      <div>
        <h2 class="title-md">
          Який бюджет?
        </h2>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="r in budgetRanges"
            :key="r.slug"
            :to="{ path: '/roboty/', query: { budget: r.slug } }"
            class="rounded-2xl border border-cocoa-200 bg-white px-4 py-5 font-display text-xl font-semibold transition-colors hover:border-wine-400 hover:bg-wine-50"
          >
            {{ r.label }}
          </NuxtLink>
        </div>
      </div>
      <div>
        <h2 class="title-md">
          На яке свято?
        </h2>
        <div class="mt-4 flex flex-wrap gap-2">
          <NuxtLink
            v-for="o in occasions"
            :key="o.slug"
            :to="{ path: '/roboty/', query: { pryvid: o.slug } }"
            class="rounded-full border border-cocoa-200 bg-white px-4 py-2.5 text-[15px] font-medium transition-colors hover:border-wine-400 hover:bg-wine-50"
          >
            {{ o.label }}
          </NuxtLink>
        </div>
      </div>
    </UContainer>

    <!-- Доставка коротко: акцент на місцевій -->
    <section class="bg-cocoa-900 py-16 text-cocoa-100" aria-labelledby="delivery-title">
      <UContainer class="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
        <h2 id="delivery-title" class="title-lg text-white">
          Привезу сама
        </h2>
        <div>
          <p class="text-lg leading-relaxed">
            Доставка по Жмеринці, Вінниці та області або самовивіз у Браїлові. Вартість доставки залежить від адреси, її обговорюємо разом із букетом.
          </p>
          <p class="mt-3 text-sm text-cocoa-300">
            Компактний букет можна відправити й Новою поштою в інше місто — уточнюйте.
          </p>
          <NuxtLink to="/dostavka/" class="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10">
            Про доставку
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- MOCK: блок відгуків з'явиться, коли зберемо реальні (SPEC.md §4.1, п. 7). Не вигадувати -->

    <UContainer class="py-16">
      <FaqSection :items="faq" />
    </UContainer>

    <UContainer as="section" aria-labelledby="cta-title" class="pb-8">
      <div class="rounded-[2rem] bg-rose px-6 py-12 sm:px-12">
        <h2 id="cta-title" class="title-lg max-w-xl">
          Розкажіть, кого вітаєте, і я запропоную букет
        </h2>
        <p class="mt-3 max-w-lg text-cocoa-700">
          Заповніть коротку форму або напишіть мені в месенджер.
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-3">
          <UButton to="/zibraty-svij/" label="Зібрати свій букет" size="xl" />
          <MessengerButtons size="xl" />
        </div>
      </div>
    </UContainer>
  </div>
</template>
