import { bouquets } from '~/data/bouquets'
import { bouquetImage } from '~/utils/img'

/** title (≤60) і description (≤155) сторінки + Open Graph. image — шлях від кореня сайту */
export function usePageMeta(opts: { title: string, description: string, image?: string }) {
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const fallback = bouquets.find(b => b.images.length)
  const image = opts.image ?? (fallback ? bouquetImage(fallback.images[0]!) : undefined)
  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogType: 'website',
    ogLocale: 'uk_UA',
    ...(image && { ogImage: siteUrl + image }),
    twitterCard: 'summary_large_image'
  })
}
