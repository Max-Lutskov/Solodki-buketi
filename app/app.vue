<script setup lang="ts">
import '~/assets/css/main.css'
import { businessSchema, useJsonLd } from '~/utils/schema'

// Канонічна адреса кожної сторінки: без параметрів (?bjudzhet=…) і зі слешем у кінці, як у sitemap
const route = useRoute()
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
useHead({
  link: [{ rel: 'canonical', href: computed(() => siteUrl + route.path) }]
})

// LocalBusiness на всіх сторінках
useJsonLd(() => [businessSchema(siteUrl)])
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
