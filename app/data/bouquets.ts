// Усі букети з app/data/bouquets/*.json. Збираються під час білду, на сервері нічого не читається.
// Нову роботу додаємо файлом <slug>.json + фото в public/images/bouquets/<id>/ (див. README)
import type { Bouquet, BouquetFile } from './types'
import { budgetRanges, occasions, recipients } from './site'

const files = import.meta.glob<BouquetFile>('./bouquets/*.json', { eager: true, import: 'default' })

const occasionSlugs = new Set(occasions.map(o => o.slug))
const recipientSlugs = new Set(recipients.map(r => r.slug))
const ids = new Set<number>()

export const bouquets: Bouquet[] = Object.entries(files)
  .map(([path, data]) => {
    const slug = path.slice('./bouquets/'.length, -'.json'.length)
    // Помилка в даних має зупинити збірку, а не тихо зламати фільтри
    for (const o of data.occasions) {
      if (!occasionSlugs.has(o)) throw new Error(`${slug}.json: невідомий привід "${o}"`)
    }
    for (const r of data.recipients) {
      if (!recipientSlugs.has(r)) throw new Error(`${slug}.json: невідомо кому "${r}"`)
    }
    if (ids.has(data.id)) throw new Error(`${slug}.json: id ${data.id} уже зайнятий`)
    ids.add(data.id)
    return { ...data, slug }
  })
  // Нові спочатку
  .sort((a, b) => b.date.localeCompare(a.date))

export function findBouquet(slug: string) {
  return bouquets.find(b => b.slug === slug)
}

export function budgetOf(price: number) {
  return budgetRanges.find(r => price >= r.min && (r.max === null || price < r.max))
}

/** Схожі роботи: спільний привід або той самий бюджет */
export function similarBouquets(b: Bouquet, limit = 4) {
  const budget = budgetOf(b.price)?.slug
  return bouquets
    .filter(x => x.slug !== b.slug)
    .map(x => ({
      x,
      score: x.occasions.filter(o => b.occasions.includes(o)).length * 2 + (budgetOf(x.price)?.slug === budget ? 1 : 0)
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.x)
}

export const formatPrice = (n: number) => `${n.toLocaleString('uk-UA').replace(/\s/g, ' ')} грн`
