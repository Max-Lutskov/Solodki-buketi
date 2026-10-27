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
type Group = 'budget' | 'pryvid' | 'komu' | 'alkohol'

// У кожній групі можна обрати кілька значень: усередині групи «або», між групами «і».
// Букет, що підходить під два обрані приводи, показується один раз
const filters = reactive<Record<Group, string[]>>({ budget: [], pryvid: [], komu: [], alkohol: [] })
const sort = ref<Sort>('new')

// Фільтри живуть в адресі (?pryvid=birthday,march8&komu=…), щоб посиланням на добірку можна було поділитися.
// Сторінка пререндерена без параметрів, тож читаємо їх лише в браузері, інакше розмітка не збіжиться
const route = useRoute()
const router = useRouter()
function fromQuery() {
  const q = route.query
  const many = (v: unknown, allowed: string[]) =>
    typeof v === 'string' ? [...new Set(v.split(','))].filter(x => allowed.includes(x)) : []
  Object.assign(filters, {
    budget: many(q.budget, budgetRanges.map(r => r.slug)),
    pryvid: many(q.pryvid, occasions.map(o => o.slug)),
    komu: many(q.komu, recipients.map(r => r.slug)),
    alkohol: many(q.alkohol, ['tak', 'ni'])
  })
  sort.value = typeof q.sort === 'string' && ['cheap', 'expensive'].includes(q.sort) ? q.sort as Sort : 'new'
}
onMounted(fromQuery)
watch(() => route.query, fromQuery)

function pushQuery() {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(filters)) {
    if (v.length) query[k] = v.join(',')
  }
  if (sort.value !== 'new') query.sort = sort.value
  router.replace({ query })
  shown.value = PAGE
}

function toggle(key: Group, value: string) {
  const v = filters[key]
  filters[key] = v.includes(value) ? v.filter(x => x !== value) : [...v, value]
  pushQuery()
}

function setSort(value: Sort) {
  sort.value = value
  pushQuery()
}

const any = (selected: string[], has: (x: string) => boolean) => !selected.length || selected.some(has)

const list = computed(() => {
  const out = bouquets.filter(b =>
    any(filters.budget, x => budgetOf(b.price)?.slug === x)
    && any(filters.pryvid, x => b.occasions.includes(x))
    && any(filters.komu, x => b.recipients.includes(x))
    && any(filters.alkohol, x => (x === 'tak') === !!b.alcohol)
  )
  if (sort.value === 'cheap') return [...out].sort((a, b) => a.price - b.price)
  if (sort.value === 'expensive') return [...out].sort((a, b) => b.price - a.price)
  return out
})

const PAGE = 12
const shown = ref(PAGE)

// «Показати ще» переживає перехід на букет і назад: скільки показано — у sessionStorage для кожної адреси
// з фільтрами. Без цього список знову з 12 карток і браузеру нікуди повернути прокрутку
const SHOWN_KEY = 'roboty-shown'
function readShown(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(SHOWN_KEY) ?? '{}')
  } catch {
    return {}
  }
}
watch(shown, (n) => {
  try {
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify({ ...readShown(), [route.fullPath]: n }))
  } catch {}
})
onMounted(async () => {
  // scroll у history.state Vue Router записує лише туди, звідки пішли далі, тобто це повернення «назад»
  const scroll = (history.state as { scroll?: { top: number } } | null)?.scroll
  const saved = readShown()[route.fullPath]
  if (!scroll || !saved) return
  shown.value = saved
  await nextTick()
  // instant: на html стоїть scroll-behavior: smooth, а повернення має бути одразу на місці
  window.scrollTo({ top: scroll.top, behavior: 'instant' })
})

const anyFilter = computed(() => Object.values(filters).some(v => v.length))

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
          :aria-pressed="filters[g.key].includes(o.value)"
          class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine-700"
          :class="filters[g.key].includes(o.value) ? 'border-wine-700 bg-wine-700 text-white' : 'border-cocoa-200 bg-white hover:border-wine-400'"
          @click="toggle(g.key, o.value)"
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
          :aria-pressed="sort === s.value"
          class="rounded-full px-3 py-1.5 text-sm"
          :class="sort === s.value ? 'bg-cocoa-900 text-white' : 'text-cocoa-700 hover:bg-cocoa-100'"
          @click="setSort(s.value)"
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
