<script setup lang="ts">
import { budgetRanges, occasions, recipients } from '~/data/site'
import { bouquets, budgetOf } from '~/data/bouquets'
import { breadcrumbSchema, useJsonLd } from '~/utils/schema'

usePageMeta({
  title: 'Роботи й ціни — солодкі букети, Вінниця і Жмеринка',
  description: 'Галерея букетів з цукерок, кошиків і боксів з алкоголем з реальними цінами. Оберіть за бюджетом, приводом чи кому даруєте.'
})
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useJsonLd(() => [breadcrumbSchema(siteUrl, [{ name: 'Роботи', path: '/roboty/' }])])

type Sort = 'new' | 'cheap' | 'expensive'
interface Filters {
  budget: string | null
  pryvid: string | null
  komu: string | null
  alkohol: 'tak' | 'ni' | null
  sort: Sort
}

const empty = (): Filters => ({ budget: null, pryvid: null, komu: null, alkohol: null, sort: 'new' })
const filters = reactive<Filters>(empty())

// Фільтри живуть в адресі (?budget=…&pryvid=…), щоб посиланням на добірку можна було поділитися.
// Сторінка пререндерена без параметрів, тож читаємо їх лише в браузері, інакше розмітка не збіжиться
const route = useRoute()
const router = useRouter()
function fromQuery() {
  const q = route.query
  const one = (v: unknown, allowed: string[]) => (typeof v === 'string' && allowed.includes(v) ? v : null)
  Object.assign(filters, {
    budget: one(q.budget, budgetRanges.map(r => r.slug)),
    pryvid: one(q.pryvid, occasions.map(o => o.slug)),
    komu: one(q.komu, recipients.map(r => r.slug)),
    alkohol: one(q.alkohol, ['tak', 'ni']),
    sort: one(q.sort, ['cheap', 'expensive']) ?? 'new'
  })
}
onMounted(fromQuery)
watch(() => route.query, fromQuery)

function set<K extends keyof Filters>(key: K, value: Filters[K]) {
  filters[key] = filters[key] === value && key !== 'sort' ? null as Filters[K] : value
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(filters)) {
    if (v && !(k === 'sort' && v === 'new')) query[k] = v
  }
  router.replace({ query })
  shown.value = PAGE
}

const list = computed(() => {
  const out = bouquets.filter(b =>
    (!filters.budget || budgetOf(b.price)?.slug === filters.budget)
    && (!filters.pryvid || b.occasions.includes(filters.pryvid))
    && (!filters.komu || b.recipients.includes(filters.komu))
    && (!filters.alkohol || (filters.alkohol === 'tak') === !!b.alcohol)
  )
  if (filters.sort === 'cheap') return [...out].sort((a, b) => a.price - b.price)
  if (filters.sort === 'expensive') return [...out].sort((a, b) => b.price - a.price)
  return out
})

const PAGE = 12
const shown = ref(PAGE)
const anyFilter = computed(() => !!(filters.budget || filters.pryvid || filters.komu || filters.alkohol))

const groups = [
  { key: 'budget', title: 'Бюджет', options: budgetRanges.map(r => ({ value: r.slug, label: r.label })) },
  { key: 'pryvid', title: 'Привід', options: occasions.map(o => ({ value: o.slug, label: o.label })) },
  { key: 'komu', title: 'Кому', options: recipients.map(r => ({ value: r.slug, label: r.label })) },
  { key: 'alkohol', title: 'Алкоголь', options: [{ value: 'tak', label: 'З алкоголем' }, { value: 'ni', label: 'Без алкоголю' }] }
] as const

const sorts: { value: Sort, label: string }[] = [
  { value: 'new', label: 'Спершу нові' },
  { value: 'cheap', label: 'Дешевші' },
  { value: 'expensive', label: 'Дорожчі' }
]
</script>

<template>
  <UContainer class="pt-10 pb-8">
    <h1 class="title-xl">
      Роботи й ціни
    </h1>
    <p class="mt-4 max-w-xl text-lg leading-relaxed text-cocoa-700">
      Букети, які я вже збирала. Ціна — саме цієї роботи. Схожий можна зробити з іншими цукерками, тоді ціна зміниться.
    </p>

    <div class="mt-8 space-y-4">
      <div v-for="g in groups" :key="g.key" class="flex flex-wrap items-center gap-2" role="group" :aria-label="g.title">
        <span class="w-20 shrink-0 text-sm text-cocoa-600">{{ g.title }}</span>
        <button
          v-for="o in g.options"
          :key="o.value"
          type="button"
          :aria-pressed="filters[g.key] === o.value"
          class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine-700"
          :class="filters[g.key] === o.value ? 'border-wine-700 bg-wine-700 text-white' : 'border-cocoa-200 bg-white hover:border-wine-400'"
          @click="set(g.key, o.value as never)"
        >
          {{ o.label }}
        </button>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-cocoa-200 pt-5">
      <p class="text-sm text-cocoa-600" aria-live="polite">
        Знайдено: {{ list.length }}
        <button v-if="anyFilter" type="button" class="ml-3 text-wine-700 underline underline-offset-2" @click="router.replace({ query: {} })">
          Скинути фільтри
        </button>
      </p>
      <div class="flex gap-1" role="group" aria-label="Сортування">
        <button
          v-for="s in sorts"
          :key="s.value"
          type="button"
          :aria-pressed="filters.sort === s.value"
          class="rounded-full px-3 py-1.5 text-sm"
          :class="filters.sort === s.value ? 'bg-cocoa-900 text-white' : 'text-cocoa-700 hover:bg-cocoa-100'"
          @click="set('sort', s.value)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <div v-if="list.length" class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      <BouquetCard v-for="b in list.slice(0, shown)" :key="b.slug" :bouquet="b" />
    </div>
    <div v-else class="mt-10 rounded-2xl bg-rose/60 px-6 py-10 text-center">
      <p class="text-lg">
        Таких робіт у галереї поки немає, але я можу зібрати саме такий букет.
      </p>
      <UButton to="/zibraty-svij/" label="Описати свій букет" size="lg" class="mt-5" />
    </div>

    <div v-if="list.length > shown" class="mt-10 text-center">
      <UButton label="Показати ще" color="neutral" variant="outline" size="lg" @click="shown += PAGE" />
    </div>
  </UContainer>
</template>
