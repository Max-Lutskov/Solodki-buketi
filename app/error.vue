<script setup lang="ts">
import '~/assets/css/main.css'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: notFound.value ? 'Сторінку не знайдено' : 'Помилка', robots: 'noindex' })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UContainer class="py-20 text-center">
        <h1 class="title-xl">
          {{ notFound ? 'Такої сторінки немає' : 'Щось пішло не так' }}
        </h1>
        <p class="mx-auto mt-5 max-w-md text-lg text-cocoa-700">
          {{ notFound ? 'Можливо, посилання застаріло. Подивіться роботи або опишіть букет, який потрібен.' : 'Оновіть сторінку або поверніться пізніше.' }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton label="Дивитись роботи" size="xl" @click="clearError({ redirect: '/roboty/' })" />
          <UButton label="Зібрати свій букет" size="xl" color="neutral" variant="outline" @click="clearError({ redirect: '/zibraty-svij/' })" />
        </div>
      </UContainer>
    </NuxtLayout>
  </UApp>
</template>
