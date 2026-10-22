<script setup lang="ts">
import { occasions, recipients, sizes } from '~/data/site'
import { findBouquet, formatPrice, similarBouquets } from '~/data/bouquets'
import { bouquetImage } from '~/utils/img'
import { breadcrumbSchema, productSchema, useJsonLd } from '~/utils/schema'

const route = useRoute()
const bouquet = findBouquet(String(route.params.slug))
if (!bouquet) throw createError({ statusCode: 404, statusMessage: 'Такого букета немає', fatal: true })
const b = bouquet

usePageMeta({
  title: `${b.title} — ${formatPrice(b.price)}`.slice(0, 60),
  description: `Букет №${b.id}: ${b.composition.join(', ')}. Ціна ${formatPrice(b.price)}. Зберу такий самий або схожий. Жмеринка, Вінниця.`.slice(0, 155),
  image: b.images[0] ? bouquetImage(b.images[0]) : undefined
})
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useJsonLd(() => [
  productSchema(siteUrl, b),
  breadcrumbSchema(siteUrl, [{ name: 'Роботи', path: '/roboty/' }, { name: b.title, path: `/roboty/${b.slug}/` }])
])

const label = (list: { slug: string, label: string }[], slugs: string[]) =>
  slugs.map(s => list.find(o => o.slug === s)?.label).filter(Boolean).join(', ')

const similar = similarBouquets(b)
const messengerText = `Добрий день! Хочу букет як №${b.id} «${b.title}» (${formatPrice(b.price)}).`

// Фото: свайп на телефоні (scroll-snap), мініатюри на комп'ютері
const active = ref(0)
const track = useTemplateRef<HTMLElement>('track')
function go(i: number) {
  active.value = i
  track.value?.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
}
function onScroll() {
  const el = track.value
  if (el) active.value = Math.round(el.scrollLeft / el.clientWidth)
}
</script>

<template>
  <UContainer class="pt-6 pb-8">
    <nav aria-label="Хлібні крихти" class="text-sm text-cocoa-600">
      <NuxtLink to="/" class="hover:text-cocoa-900">Головна</NuxtLink>
      <span class="mx-2" aria-hidden="true">/</span>
      <NuxtLink to="/roboty/" class="hover:text-cocoa-900">Роботи</NuxtLink>
    </nav>

    <div class="mt-6 grid gap-10 md:grid-cols-2 lg:gap-16">
      <div class="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-none">
        <div
          ref="track"
          class="arch flex aspect-[3/4] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          @scroll.passive="onScroll"
        >
          <template v-if="b.images.length">
            <div v-for="(_, i) in b.images" :key="i" class="h-full w-full shrink-0 snap-start">
              <BouquetPhoto :bouquet="b" :index="i" sizes="(min-width: 768px) 560px, 100vw" :eager="i === 0" />
            </div>
          </template>
          <div v-else class="h-full w-full shrink-0">
            <BouquetPhoto :bouquet="b" sizes="(min-width: 768px) 560px, 100vw" />
          </div>
        </div>
        <div v-if="b.images.length > 1" class="mt-3 flex justify-center gap-2">
          <button
            v-for="(_, i) in b.images"
            :key="i"
            type="button"
            class="size-2.5 rounded-full transition-colors"
            :class="active === i ? 'bg-wine-700' : 'bg-cocoa-200'"
            :aria-label="`Фото ${i + 1}`"
            :aria-current="active === i"
            @click="go(i)"
          />
        </div>
        <video
          v-if="b.video"
          class="mt-6 w-full rounded-2xl"
          :src="`/video/bouquets/${b.video}.mp4`"
          :poster="b.images[0] ? bouquetImage(b.images[0]).replace(/\.jpg$/, '-800.webp') : undefined"
          muted
          playsinline
          loop
          controls
          preload="none"
        />
      </div>

      <div>
        <p class="text-sm text-cocoa-600">
          Букет №{{ b.id }}
        </p>
        <h1 class="title-lg mt-1">
          {{ b.title }}
        </h1>
        <p class="mt-4 font-display text-4xl font-semibold text-wine-700">
          {{ formatPrice(b.price) }}
        </p>
        <p class="mt-2 max-w-md text-sm leading-relaxed text-cocoa-600">
          Ціна цього букета. Можна зібрати схожий з іншими цукерками — ціна зміниться.
        </p>
        <p v-if="b.alcohol" class="mt-4 inline-flex items-center gap-2 rounded-full bg-cocoa-900 px-3 py-1 text-sm font-medium text-white">
          <span class="font-semibold">18+</span>{{ b.alcohol }}
        </p>

        <p v-if="b.description" class="mt-6 leading-relaxed">
          {{ b.description }}
        </p>

        <h2 class="mt-8 font-semibold">
          Склад
        </h2>
        <ul class="mt-2 space-y-1.5 text-cocoa-800">
          <li v-for="c in b.composition" :key="c" class="flex gap-2">
            <span class="mt-2 size-1.5 shrink-0 rounded-full bg-foil" aria-hidden="true" />{{ c }}
          </li>
        </ul>

        <dl class="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
          <dt class="text-cocoa-600">
            Розмір
          </dt>
          <dd>{{ sizes[b.size] }}</dd>
          <template v-if="b.occasions.length">
            <dt class="text-cocoa-600">
              Привід
            </dt>
            <dd>{{ label(occasions, b.occasions) }}</dd>
          </template>
          <template v-if="b.recipients.length">
            <dt class="text-cocoa-600">
              Кому
            </dt>
            <dd>{{ label(recipients, b.recipients) }}</dd>
          </template>
        </dl>

        <div class="mt-8 space-y-4">
          <UButton :to="{ path: '/zibraty-svij/', query: { ref: b.slug } }" label="Хочу такий самий" size="xl" />
          <div>
            <p class="mb-2 text-sm text-cocoa-600">
              Або напишіть одразу:
            </p>
            <MessengerButtons :text="messengerText" />
          </div>
        </div>
      </div>
    </div>

    <section v-if="similar.length" class="mt-20" aria-labelledby="similar-title">
      <h2 id="similar-title" class="title-lg">
        Схожі роботи
      </h2>
      <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:gap-x-6">
        <BouquetCard v-for="s in similar" :key="s.slug" :bouquet="s" />
      </div>
    </section>
  </UContainer>
</template>
