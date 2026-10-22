<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main class="flex-1 pb-20 md:pb-0">
      <slot />
    </main>
    <LazyAppFooter hydrate-on-visible />
    <MobileOrderBar />
  </div>
</template>
