<script setup lang="ts">
import { landings } from '~/data/landings'
import { bouquets, formatPrice } from '~/data/bouquets'
import { breadcrumbSchema, faqSchema, useJsonLd } from '~/utils/schema'

const props = defineProps<{ path: string }>()
const page = landings.find(l => l.path === props.path)
if (!page) throw new Error(`Немає лендінгу ${props.path} у app/data/landings.ts`)
const l = page

usePageMeta({ title: l.title, description: l.description })
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useJsonLd(() => [faqSchema(l.faq), breadcrumbSchema(siteUrl, [{ name: l.crumb, path: l.path }])])

const works = bouquets
  .filter(b =>
    (!l.pick.occasion || b.occasions.includes(l.pick.occasion))
    && (!l.pick.recipient || b.recipients.includes(l.pick.recipient))
    && (l.pick.alcohol === undefined || l.pick.alcohol === !!b.alcohol))
  .slice(0, 8)

const prices = works.map(b => b.price)
const others = landings.filter(x => x.path !== l.path)
</script>

<template>
  <div>
    <UContainer class="pt-6">
      <nav aria-label="Хлібні крихти" class="text-sm text-cocoa-600">
        <NuxtLink to="/" class="hover:text-cocoa-900">Головна</NuxtLink>
        <span class="mx-2" aria-hidden="true">/</span>
        <span>{{ l.crumb }}</span>
      </nav>
      <h1 class="title-xl mt-6 max-w-3xl">
        {{ l.h1 }}
      </h1>
      <p class="mt-5 max-w-2xl text-lg leading-relaxed text-cocoa-700">
        {{ l.lead }}
      </p>
      <p v-if="prices.length" class="mt-3 text-cocoa-700">
        Ціни робіт у галереї: від {{ formatPrice(Math.min(...prices)) }} до {{ formatPrice(Math.max(...prices)) }}.
      </p>
      <div class="mt-7 flex flex-wrap gap-3">
        <UButton to="/zibraty-svij/" label="Зібрати свій букет" size="xl" />
        <UButton to="/roboty/" label="Всі роботи" size="xl" color="neutral" variant="outline" />
      </div>
    </UContainer>

    <UContainer v-if="works.length" class="py-14" as="section" aria-label="Роботи">
      <div class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        <BouquetCard v-for="b in works" :key="b.slug" :bouquet="b" />
      </div>
    </UContainer>

    <UContainer>
      <article class="prose-sweet">
        <section v-for="s in l.sections" :key="s.h2">
          <h2>{{ s.h2 }}</h2>
          <p v-for="(p, i) in s.p" :key="i">
            {{ p }}
          </p>
          <ul v-if="s.list">
            <li v-for="item in s.list" :key="item">
              {{ item }}
            </li>
          </ul>
        </section>
        <p>
          Докладніше про зони й умови — на сторінці <NuxtLink to="/dostavka/">доставки</NuxtLink>.
          <template v-for="o in others" :key="o.path">
            Також: <NuxtLink :to="o.path">{{ o.h1.toLowerCase() }}</NuxtLink>.
          </template>
        </p>
      </article>
    </UContainer>

    <UContainer class="py-16">
      <FaqSection :items="l.faq" />
    </UContainer>
  </div>
</template>
