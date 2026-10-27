<script setup lang="ts">
import { unpriced } from '~/data/unpriced'

// Службова сторінка для Тетяни: вписати ціни до робіт з Telegram. Не в меню, не в пошуку
useSeoMeta({ title: 'Ціни на букети', robots: 'noindex, nofollow' })

interface Entry { price: number | undefined, note: string }
const entries = reactive<Record<number, Entry>>(
  Object.fromEntries(unpriced.map(b => [b.id, { price: undefined, note: '' }]))
)
const website = ref('')

// Чернетка в браузері: можна закрити вкладку й дописати пізніше
const KEY = 'tsiny-draft'
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Entry>
    for (const [id, e] of Object.entries(saved)) {
      if (entries[+id]) Object.assign(entries[+id]!, e)
    }
  } catch {}
  watch(entries, () => {
    try { localStorage.setItem(KEY, JSON.stringify(entries)) } catch {}
  }, { deep: true })
})

const filled = computed(() => unpriced.filter(b => entries[b.id]!.price || entries[b.id]!.note.trim()).length)

const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorText = ref('')
async function send() {
  if (!filled.value) {
    status.value = 'error'
    errorText.value = 'Впишіть хоча б одну ціну'
    return
  }
  status.value = 'sending'
  try {
    await $fetch('/api/prices', {
      method: 'POST',
      body: {
        website: website.value,
        items: unpriced.map(b => ({ id: b.id, price: entries[b.id]!.price, note: entries[b.id]!.note }))
      }
    })
    status.value = 'sent'
  } catch (e) {
    status.value = 'error'
    errorText.value = (e as { statusMessage?: string }).statusMessage || 'Не вдалося надіслати, спробуйте ще раз'
  }
}
</script>

<template>
  <UContainer class="pt-10 pb-32">
    <h1 class="title-xl">
      Ціни на букети
    </h1>
    <p class="mt-4 max-w-xl text-lg leading-relaxed text-cocoa-700">
      Під кожним букетом впишіть, скільки він коштував. Якщо не пам'ятаєте точно — орієнтовну ціну або залиште порожнім. У коментарі можна дописати, для кого букет чи що в ньому.
    </p>
    <p class="mt-2 text-sm text-cocoa-600">
      Вписане зберігається на цьому пристрої, можна закрити й дописати пізніше. Коли закінчите — натисніть «Надіслати» внизу.
    </p>

    <div class="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="(b, i) in unpriced" :key="b.id" class="flex flex-col">
        <div class="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-2xl [scrollbar-width:none]">
          <img
            v-for="p in b.photos"
            :key="p"
            :src="`/tsiny/${p}.jpg`"
            :alt="`Букет ${i + 1}`"
            loading="lazy"
            class="aspect-[3/4] w-full shrink-0 snap-center rounded-2xl bg-rose object-cover"
            :class="b.photos.length > 1 && 'w-[85%]'"
          >
        </div>
        <p class="mt-3 text-sm text-cocoa-600">
          Букет {{ i + 1 }} · {{ b.group }}<template v-if="b.photos.length > 1">
            · {{ b.photos.length }} фото, гортайте
          </template>
          <template v-if="b.note">
            · у чаті було «{{ b.note }}»
          </template>
        </p>
        <div class="mt-2 flex gap-2">
          <UInput
            v-model.number="entries[b.id]!.price"
            type="number"
            inputmode="numeric"
            min="1"
            placeholder="Ціна"
            size="xl"
            class="w-32 shrink-0"
            :aria-label="`Ціна букета ${i + 1}, грн`"
          >
            <template #trailing>
              <span class="text-sm text-cocoa-500">грн</span>
            </template>
          </UInput>
          <UInput
            v-model="entries[b.id]!.note"
            placeholder="Коментар"
            size="xl"
            class="min-w-0 flex-1"
            :aria-label="`Коментар до букета ${i + 1}`"
          />
        </div>
      </article>
    </div>

    <!-- Пастка для ботів: людина цього поля не бачить -->
    <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="absolute -left-[9999px]">

    <div class="fixed inset-x-0 bottom-0 z-10 border-t border-cocoa-200 bg-milk/95 backdrop-blur">
      <UContainer class="flex flex-wrap items-center justify-between gap-3 py-3">
        <p class="text-sm" aria-live="polite">
          <span v-if="status === 'sent'" class="font-medium text-wine-700">Надіслано, дякую! Якщо щось виправите — надішліть ще раз.</span>
          <span v-else-if="status === 'error'" class="text-wine-700">{{ errorText }}</span>
          <span v-else class="text-cocoa-600">Заповнено {{ filled }} з {{ unpriced.length }}</span>
        </p>
        <UButton label="Надіслати" size="xl" :loading="status === 'sending'" @click="send" />
      </UContainer>
    </div>
  </UContainer>
</template>
