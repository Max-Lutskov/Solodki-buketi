import { company, instagramUrl } from '~/data/site'
import type { Bouquet, Faq } from '~/data/types'
import { bouquets } from '~/data/bouquets'
import { bouquetImage } from '~/utils/img'

const prices = bouquets.map(b => b.price)

/** Спільний вузол бізнесу для JSON-LD на всіх сторінках */
export function businessSchema(siteUrl: string) {
  const main = bouquets.find(b => b.images.length)
  return {
    '@type': 'Florist',
    '@id': `${siteUrl}/#business`,
    'name': company.name,
    'description': 'Солодкі та їстівні букети з цукерок, кошики й бокси з алкоголем ручної роботи. Жмеринка, Вінниця, Вінницька область.',
    'url': `${siteUrl}/`,
    'telephone': company.phone,
    ...(main && { image: `${siteUrl}${bouquetImage(main.images[0]!)}` }),
    ...(prices.length && { priceRange: `${Math.min(...prices)}–${Math.max(...prices)} грн` }),
    'address': {
      '@type': 'PostalAddress',
      // Самовивіз у Браїлові — це і є точка бізнесу
      'addressLocality': company.pickup,
      'addressRegion': company.region,
      'addressCountry': 'UA'
    },
    'areaServed': [
      { '@type': 'City', 'name': 'Браїлів' },
      { '@type': 'City', 'name': 'Жмеринка' },
      { '@type': 'City', 'name': 'Вінниця' },
      { '@type': 'AdministrativeArea', 'name': 'Вінницька область' }
    ],
    'sameAs': [instagramUrl]
  }
}

export function faqSchema(items: Faq[]) {
  return {
    '@type': 'FAQPage',
    'mainEntity': items.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
    }))
  }
}

/** crumbs — проміжні рівні після «Головна», останній — поточна сторінка */
export function breadcrumbSchema(siteUrl: string, crumbs: { name: string, path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': [{ name: 'Головна', path: '/' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': c.name,
      'item': `${siteUrl}${c.path}`
    }))
  }
}

/** Букет як товар під замовлення: ціна саме цієї роботи */
export function productSchema(siteUrl: string, b: Bouquet) {
  return {
    '@type': 'Product',
    'name': b.title,
    'description': b.description || `Солодкий букет: ${b.composition.join(', ')}.`,
    'url': `${siteUrl}/roboty/${b.slug}/`,
    'sku': `buket-${b.id}`,
    'brand': { '@id': `${siteUrl}/#business` },
    ...(b.images.length && { image: b.images.map(i => `${siteUrl}${bouquetImage(i)}`) }),
    'offers': {
      '@type': 'Offer',
      'price': b.price,
      'priceCurrency': 'UAH',
      'availability': 'https://schema.org/PreOrder',
      'url': `${siteUrl}/roboty/${b.slug}/`,
      'seller': { '@id': `${siteUrl}/#business` }
    }
  }
}

/** Додає JSON-LD на сторінку. Ключ, щоб схема сторінки не затирала схему бізнесу з app.vue */
export function useJsonLd(graph: () => object[], key = 'page') {
  useHead({
    script: [{
      key: `ld-${key}`,
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({ '@context': 'https://schema.org', '@graph': graph() }))
    }]
  })
}
