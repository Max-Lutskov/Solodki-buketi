<script setup lang="ts">
import { alcoholOptions, budgetRanges, company, contactMethods, deliveryOptions, occasions } from '~/data/site'
import type { DeliveryValue } from '~/data/site'
import { findBouquet, formatPrice } from '~/data/bouquets'
import { breadcrumbSchema, useJsonLd } from '~/utils/schema'

usePageMeta({
  title: 'Замовити солодкий букет — коротка заявка',
  description: 'Залиште ім\'я, телефон і кілька слів про букет — Тетяна зв\'яжеться з вами й узгодить цукерки, алкоголь, дату й доставку.'
})
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useJsonLd(() => [breadcrumbSchema(siteUrl, [{ name: 'Зібрати свій букет', path: '/zibraty-svij/' }])])

const route = useRoute()
const { public: { turnstileSiteKey } } = useRuntimeConfig()

// Обов'язкові лише ім'я й телефон: решту Тетяна і так уточнює в розмові.
// Бюджет і дата — одним дотиком, усе інше сховане в «Додати деталі»
const form = reactive({
  name: '',
  phone: '+380 ',
  contact: 'viber',
  budget: '',
  date: '',
  wish: '',
  occasion: '',
  alcohol: 'none',
  delivery: undefined as DeliveryValue | undefined,
  address: '',
  adult: false,
  ref: '',
  website: ''
})
const files = ref<File[]>([])
const detailsOpen = ref(false)

// «Хочу такий самий»: ?ref=<slug> з картки букета. Сторінка пререндерена без параметрів, тож лише в браузері
const refBouquet = computed(() => (form.ref ? findBouquet(form.ref) : undefined))
onMounted(() => {
  const r = route.query.ref
  if (typeof r === 'string' && findBouquet(r)) form.ref = r
  if (route.query.dostavka === 'novaposhta') {
    form.delivery = 'novaposhta'
    detailsOpen.value = true
  }
})

const minDate = ref('')
onMounted(() => { minDate.value = tomorrow() })

const needs = computed(() => deliveryOptions.find(d => d.value === form.delivery)?.needs ?? null)
const withAlcohol = computed(() => form.alcohol !== 'none')

// Помилки показуємо лише після першої спроби надіслати
const tried = ref(false)
const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!form.name.trim()) e.name = 'Вкажіть ім\'я'
  if (!isValidPhone(form.phone)) e.phone = 'Номер у форматі +380 67 123 45 67'
  if (form.date && minDate.value && form.date < minDate.value) e.date = 'Не раніше завтрашнього дня'
  if (withAlcohol.value && !form.adult) e.adult = 'Букет з алкоголем — лише для покупців від 18 років'
  return e
})
const err = (k: string) => (tried.value ? errors.value[k] : undefined)

const MAX_FILES = 3
const MAX_SIZE = 5 * 1024 * 1024
const fileError = ref('')
function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'))
  fileError.value = ''
  if (picked.some(f => f.size > MAX_SIZE)) fileError.value = 'Кожне фото — до 5 МБ'
  files.value = [...files.value, ...picked.filter(f => f.size <= MAX_SIZE)].slice(0, MAX_FILES)
  input.value = ''
}
const previews = computed(() => (import.meta.client ? files.value.map(f => URL.createObjectURL(f)) : []))
watch(previews, (_, old) => old?.forEach(u => URL.revokeObjectURL(u)))

const turnstileToken = ref('')
if (turnstileSiteKey) {
  useHead({ script: [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true }] })
  onMounted(() => { (window as unknown as Record<string, unknown>).onTurnstile = (t: string) => { turnstileToken.value = t } })
}

/** Текст для месенджера: з того, що вже заповнено, або просто привітання */
const summary = computed(() => [
  'Добрий день! Хочу замовити букет.',
  refBouquet.value && `Як №${refBouquet.value.id} «${refBouquet.value.title}»`,
  form.wish.trim(),
  form.budget && `Бюджет: ${budgetRanges.find(b => b.slug === form.budget)?.label}`,
  form.date && `Дата: ${form.date.split('-').reverse().join('.')}`
].filter(Boolean).join('\n'))

const status = ref<'idle' | 'sending' | 'done' | 'failed'>('idle')

async function submit() {
  tried.value = true
  if (Object.keys(errors.value).length) {
    if (errors.value.adult) detailsOpen.value = true
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  if (status.value === 'sending') return
  status.value = 'sending'
  try {
    const body = new FormData()
    for (const [k, v] of Object.entries(form)) body.append(k, typeof v === 'boolean' ? (v ? '1' : '') : (v ?? ''))
    body.append('turnstile', turnstileToken.value)
    if (refBouquet.value) body.append('refTitle', `№${refBouquet.value.id} «${refBouquet.value.title}», ${formatPrice(refBouquet.value.price)}`)
    for (const [i, f] of files.value.entries()) {
      body.append('photos', await compressImage(f), `photo-${i + 1}.jpg`)
    }
    await $fetch('/api/order', { method: 'POST', body })
    status.value = 'done'
    window.scrollTo({ top: 0 })
  } catch {
    status.value = 'failed'
  }
}

const chip = (on: boolean) => on
  ? 'border-wine-700 bg-wine-700 text-white'
  : 'border-cocoa-200 bg-white hover:border-wine-400'
const radioUi = { fieldset: 'flex flex-wrap gap-2', item: 'rounded-full border border-cocoa-200 bg-white px-3.5 py-2 has-data-[state=checked]:border-wine-700 has-data-[state=checked]:bg-wine-50' }
</script>

<template>
  <UContainer class="pt-10 pb-8">
    <!-- Після відправки -->
    <div v-if="status === 'done'" class="mx-auto max-w-xl py-10 text-center">
      <h1 class="title-xl">
        Дякую!
      </h1>
      <p class="mt-5 text-lg leading-relaxed text-cocoa-700">
        Заявку отримано. Тетяна зв'яжеться з вами {{ company.replyTime }}{{ form.contact === 'call' ? ' дзвінком' : ` у ${contactMethods.find(c => c.value === form.contact)?.label}` }}.
      </p>
      <p class="mt-8 text-sm text-cocoa-600">
        Не хочете чекати? Напишіть самі:
      </p>
      <MessengerButtons :text="summary" class="mt-3 justify-center" />
    </div>

    <div v-else class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
      <div class="max-w-xl">
        <h1 class="title-xl">
          Замовити букет
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-cocoa-700">
          Залиште контакти й кілька слів про букет. Цукерки, алкоголь, дату й доставку Тетяна уточнить у розмові.
        </p>

        <!-- Альтернатива формі: на телефоні одразу під заголовком -->
        <div class="mt-6 rounded-2xl bg-rose/60 p-4 lg:hidden">
          <p class="text-[15px]">
            Простіше написати? Текст підставиться сам:
          </p>
          <MessengerButtons :text="summary" size="md" class="mt-3" />
        </div>

        <div v-if="refBouquet" class="mt-8 flex items-center gap-4 rounded-2xl border border-cocoa-200 bg-white p-3">
          <div class="arch aspect-[3/4] w-14 shrink-0">
            <BouquetPhoto :bouquet="refBouquet" sizes="56px" />
          </div>
          <p class="flex-1">
            Як букет №{{ refBouquet.id }} — {{ refBouquet.title }}
            <span class="block text-sm text-cocoa-600">{{ formatPrice(refBouquet.price) }}</span>
          </p>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Прибрати приклад" @click="form.ref = ''" />
        </div>

        <form class="mt-8 grid gap-6" novalidate @submit.prevent="submit">
          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Ім'я" name="name" required :error="err('name')">
              <UInput v-model="form.name" autocomplete="name" size="xl" class="w-full" />
            </UFormField>
            <UFormField label="Телефон" name="phone" required :error="err('phone')">
              <UInput v-model="form.phone" type="tel" autocomplete="tel" inputmode="tel" size="xl" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Де зручніше спілкуватися" name="contact">
            <URadioGroup v-model="form.contact" :items="contactMethods" orientation="horizontal" :ui="radioUi" />
          </UFormField>

          <UFormField label="Який букет потрібен" name="wish" hint="Необов'язково">
            <UTextarea
              v-model="form.wish"
              :rows="3"
              autoresize
              placeholder="Напр.: мамі на день народження, любить Raffaello, без алкоголю"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <div role="group" aria-labelledby="budget-label">
            <p id="budget-label" class="text-sm font-medium">
              Бюджет <span class="font-normal text-cocoa-600">— якщо вже знаєте</span>
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="b in budgetRanges"
                :key="b.slug"
                type="button"
                :aria-pressed="form.budget === b.slug"
                class="rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine-700"
                :class="chip(form.budget === b.slug)"
                @click="form.budget = form.budget === b.slug ? '' : b.slug"
              >
                {{ b.label }}
              </button>
            </div>
          </div>

          <UFormField label="На коли" name="date" hint="Необов'язково" :error="err('date')" class="sm:max-w-xs">
            <UInput v-model="form.date" type="date" :min="minDate" size="xl" class="w-full" />
          </UFormField>

          <!-- Деталі: для тих, хто хоче розписати все одразу -->
          <div class="rounded-2xl border border-cocoa-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-medium"
              :aria-expanded="detailsOpen"
              aria-controls="order-details"
              @click="detailsOpen = !detailsOpen"
            >
              <span>
                Додати деталі
                <span class="block text-sm font-normal text-cocoa-600">Привід, алкоголь, доставка, фото-приклад</span>
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0 transition-transform" :class="detailsOpen && 'rotate-180'" />
            </button>

            <div v-show="detailsOpen" id="order-details" class="grid gap-5 border-t border-cocoa-200 px-4 pt-4 pb-5">
              <UFormField label="Привід" name="occasion">
                <USelect
                  v-model="form.occasion"
                  :items="occasions.map(o => ({ value: o.slug, label: o.label }))"
                  placeholder="Оберіть"
                  size="xl"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Алкоголь" name="alcohol">
                <URadioGroup v-model="form.alcohol" :items="alcoholOptions.filter(a => a.value !== 'custom')" orientation="horizontal" :ui="radioUi" />
              </UFormField>
              <UFormField v-if="withAlcohol" name="adult" :error="err('adult')">
                <UCheckbox v-model="form.adult" label="Мені виповнилося 18 років" />
              </UFormField>
              <UFormField label="Як отримаєте" name="delivery">
                <URadioGroup v-model="form.delivery" :items="[...deliveryOptions]" orientation="horizontal" :ui="radioUi" />
              </UFormField>
              <UFormField v-if="needs" :label="needs === 'np' ? 'Місто й відділення Нової пошти' : 'Адреса доставки'" name="address">
                <UInput v-model="form.address" :autocomplete="needs === 'np' ? 'off' : 'street-address'" size="xl" class="w-full" />
              </UFormField>

              <div>
                <p class="text-sm font-medium">
                  Фото-приклад <span class="font-normal text-cocoa-600">— до 3 фото</span>
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-3">
                  <div v-for="(src, i) in previews" :key="src" class="relative size-20 overflow-hidden rounded-xl">
                    <img :src="src" alt="" class="h-full w-full object-cover">
                    <button
                      type="button"
                      class="absolute top-1 right-1 rounded-full bg-cocoa-900/80 p-0.5 text-white"
                      :aria-label="`Прибрати фото ${i + 1}`"
                      @click="files.splice(i, 1)"
                    >
                      <UIcon name="i-lucide-x" class="size-4" />
                    </button>
                  </div>
                  <label v-if="files.length < MAX_FILES" class="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-cocoa-300 text-xs text-cocoa-600 focus-within:outline-2 focus-within:outline-wine-700 hover:border-wine-400">
                    <UIcon name="i-lucide-upload" class="size-5" />
                    Додати
                    <input type="file" accept="image/*" multiple class="sr-only" @change="onFiles">
                  </label>
                </div>
                <p v-if="fileError" class="mt-1 text-sm text-error">
                  {{ fileError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Поле-пастка для ботів, людина його не бачить -->
          <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">

          <div v-if="turnstileSiteKey" class="cf-turnstile" :data-sitekey="turnstileSiteKey" data-callback="onTurnstile" data-language="uk" />

          <div v-if="status === 'failed'" class="rounded-2xl border border-error/40 bg-white p-5" role="alert">
            <p class="font-semibold">
              Заявка не надіслалася.
            </p>
            <p class="mt-1 text-sm text-cocoa-700">
              Спробуйте ще раз або надішліть її в месенджер — текст скопіюється сам.
            </p>
            <MessengerButtons :text="summary" class="mt-4" />
          </div>

          <div>
            <UButton type="submit" label="Надіслати заявку" size="xl" :loading="status === 'sending'" :disabled="status === 'sending'" />
            <p class="mt-3 text-xs text-cocoa-600">
              Надсилаючи заявку, ви погоджуєтеся з <NuxtLink to="/pryvatnist/" class="underline">політикою конфіденційності</NuxtLink>.
            </p>
          </div>
        </form>
      </div>

      <!-- Альтернатива формі на комп'ютері: збоку, поруч із полями -->
      <aside class="hidden lg:block">
        <div class="sticky top-24 rounded-[1.5rem] bg-rose/60 p-6">
          <h2 class="title-md">
            Простіше написати?
          </h2>
          <p class="mt-2 text-[15px] leading-relaxed text-cocoa-700">
            Напишіть у месенджер — текст підставиться або скопіюється сам, разом з тим, що ви вже заповнили.
          </p>
          <MessengerButtons :text="summary" size="md" class="mt-4" />
        </div>
      </aside>
    </div>
  </UContainer>
</template>
