<script setup lang="ts">
// Намальований букет-заглушка, поки немає фото роботи. Склад кульок залежить від seed,
// щоб картки в галереї не були однаковими
const props = defineProps<{ seed: number, alcohol?: boolean }>()

// Псевдовипадкові числа від seed на цілочисельному хеші: Math.sin на сервері й у браузері
// дає різні останні знаки, і розмітка не збігається
function rand(i: number) {
  let h = Math.imul(props.seed + 1, 2654435761) ^ Math.imul(i + 1, 40503)
  h = Math.imul(h ^ (h >>> 15), 2246822519)
  return ((h ^ (h >>> 13)) >>> 0) % 1000 / 1000
}
const round = (n: number) => Math.round(n * 10) / 10

const wraps = [
  ['#e7c3c0', '#d7a5a2'],
  ['#efe2d2', '#dcc7ae'],
  ['#d9c2d4', '#c3a2bb'],
  ['#c9d3c1', '#aebda3']
] as const
const wrap = computed(() => wraps[props.seed % wraps.length]!)

// Кульки: золоті (Ferrero), білі (Raffaello), тюльпани
const candies = computed(() => {
  const out: { x: number, y: number, r: number, kind: 'gold' | 'white' | 'tulip' }[] = []
  const rows = [
    { y: 150, n: 3, spread: 70 },
    { y: 118, n: 4, spread: 96 },
    { y: 178, n: 4, spread: 92 },
    { y: 92, n: 3, spread: 64 }
  ]
  let i = 0
  for (const row of rows) {
    for (let k = 0; k < row.n; k++) {
      const t = row.n === 1 ? 0.5 : k / (row.n - 1)
      const r = rand(i++)
      out.push({
        x: round(150 - row.spread + t * row.spread * 2 + (rand(i++) - 0.5) * 10),
        y: round(row.y + (rand(i++) - 0.5) * 12),
        r: round(17 + r * 5),
        kind: r < 0.45 ? 'gold' : r < 0.75 ? 'white' : 'tulip'
      })
    }
  }
  return out.sort((a, b) => a.y - b.y)
})
</script>

<template>
  <svg viewBox="0 0 300 400" class="h-full w-full" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <rect width="300" height="400" fill="#f4e4df" />
    <circle cx="150" cy="150" r="130" fill="#f9eeea" />
    <!-- Пляшка позаду кульок -->
    <g v-if="alcohol">
      <rect x="168" y="20" width="16" height="44" rx="4" fill="#3f2a22" />
      <rect x="160" y="56" width="32" height="110" rx="12" fill="#4b3128" />
      <rect x="165" y="20" width="22" height="14" rx="3" fill="#c29a5b" />
    </g>
    <!-- Обгортка -->
    <path d="M40 150 L150 360 L260 150 Z" :fill="wrap[1]" />
    <path d="M62 160 L150 360 L120 175 Z" :fill="wrap[0]" opacity=".9" />
    <path d="M238 160 L150 360 L180 175 Z" :fill="wrap[0]" opacity=".9" />
    <!-- Цукерки -->
    <g v-for="(c, i) in candies" :key="i">
      <template v-if="c.kind === 'gold'">
        <circle :cx="c.x" :cy="c.y" :r="c.r" fill="#c29a5b" />
        <circle :cx="c.x - c.r * .3" :cy="c.y - c.r * .3" :r="c.r * .35" fill="#e2c48e" />
        <circle :cx="c.x" :cy="c.y" :r="c.r" fill="none" stroke="#9c7841" stroke-width="1.5" />
      </template>
      <template v-else-if="c.kind === 'white'">
        <circle :cx="c.x" :cy="c.y" :r="c.r" fill="#fffaf4" />
        <circle :cx="c.x" :cy="c.y" :r="c.r" fill="none" stroke="#e6d6c6" stroke-width="2" stroke-dasharray="2 3" />
      </template>
      <template v-else>
        <path :d="`M${c.x - c.r * .8} ${c.y + c.r * .6} Q${c.x - c.r} ${c.y - c.r} ${c.x - c.r * .3} ${c.y - c.r * .7} L${c.x} ${c.y - c.r * .2} L${c.x + c.r * .3} ${c.y - c.r * .7} Q${c.x + c.r} ${c.y - c.r} ${c.x + c.r * .8} ${c.y + c.r * .6} Z`" fill="#9b3d4c" />
      </template>
    </g>
    <!-- Стрічка -->
    <path d="M128 300 Q150 290 172 300 L166 312 Q150 304 134 312 Z" fill="#7f2f3d" />
  </svg>
</template>
