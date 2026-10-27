export type Size = 'S' | 'M' | 'L' | 'XL'

/** Один букет з галереї. Файл: app/data/bouquets/<slug>.json */
export interface BouquetFile {
  /** Порядковий номер, показується як «Букет №14» */
  id: number
  title: string
  /** Коли зроблено, YYYY-MM-DD */
  date: string
  /** Ціна саме цього букета, грн */
  price: number
  /** Базові імена фото в public/images/bouquets/ без розширення, напр. "14/1". Перше — головне */
  images: string[]
  /** Відео з Reels, базове ім'я в public/video/bouquets/ без розширення */
  video?: string
  occasions: string[]
  recipients: string[]
  /** Напр. "Шампанське Bolgrad 0.75". Не null → бейдж 18+ */
  alcohol: string | null
  /** Можна відправити Новою поштою (поки не виводиться на сайті) */
  shippable: boolean
  size: Size
  composition: string[]
  description?: string
  /** Показувати на головній */
  featured: boolean
  /** Букет в арці на першому екрані головної (один на сайт) */
  hero?: boolean
  /** Тимчасовий приклад, поки немає реальних робіт. Прибрати, коли замінимо */
  mock?: boolean
}

export interface Bouquet extends BouquetFile {
  slug: string
}

export interface Faq {
  q: string
  a: string
}
