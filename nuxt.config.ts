// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from 'node:fs'
import { landingPaths } from './app/data/landings'

// Сторінки букетів: по одній на кожен файл app/data/bouquets/<slug>.json
const bouquetRoutes = readdirSync('app/data/bouquets')
  .filter((f: string) => f.endsWith('.json'))
  .map((f: string) => `/roboty/${f.slice(0, -5)}/`)

const staticRoutes = [
  '/',
  '/roboty/',
  '/zibraty-svij/',
  '/dostavka/',
  '/pro-mene/',
  '/kontakty/',
  '/pryvatnist/',
  ...landingPaths,
  ...bouquetRoutes
]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxtjs/sitemap', '@nuxtjs/robots'],

  // Стилі імпортуються в app.vue, а не тут: тоді Nuxt вбудовує їх прямо в HTML (inlineStyles)
  // і браузер не чекає окремого CSS-файлу перед першим показом сторінки
  features: {
    inlineStyles: true
  },

  typescript: {
    strict: true
  },

  app: {
    head: {
      htmlAttrs: { lang: 'uk' },
      meta: [{ name: 'theme-color', content: '#faf5ef' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  // Сайт світлий, без перемикача теми
  ui: {
    colorMode: false,
    // Стилі лише для компонентів, які є на сайті
    experimental: {
      componentDetection: true
    }
  },

  // Сторінки однакові для всіх, тож збираємо їх під час білду. Заявки (/api/order) обробляє Worker.
  // /tsiny/ — службова сторінка для Тетяни (вписати ціни), не індексується й не потрапляє в sitemap
  routeRules: {
    ...Object.fromEntries(staticRoutes.map(path => [path, { prerender: true }])),
    '/tsiny/': { prerender: true, robots: false }
  },

  // Пререндер бере ту саму сторінку ще й без слеша в кінці. Такі адреси не потрібні (на сайті всі зі слешем),
  // а на Windows дві копії ще й падають, пишучи один файл кешу (EPERM)
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/sitemap.xml', '/robots.txt', '/404.html'],
      ignore: [(path: string) => !path.endsWith('/') && !/\.[a-z]+$/.test(path)]
    }
  },

  // Іконки лише ті, що є на сайті, вбудовані в клієнт. Повні набори lucide й simple-icons
  // у серверному бандлі важать ~5 МБ, а безкоштовний Cloudflare Worker вміщує лише 3 МБ
  icon: {
    serverBundle: false,
    clientBundle: {
      scan: true,
      // Іконки самого Nuxt UI (акордеон, селект, закриття шторки, завантаження кнопки, тости)
      icons: ['lucide:chevron-down', 'lucide:x', 'lucide:loader-circle', 'lucide:check', 'lucide:circle-check', 'lucide:circle-x', 'lucide:circle-alert', 'lucide:info', 'lucide:upload', 'lucide:calendar']
    }
  },

  fonts: {
    defaults: {
      subsets: ['cyrillic', 'cyrillic-ext', 'latin']
    },
    families: [
      { name: 'Cormorant', provider: 'google', weights: [500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Manrope', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  },

  site: {
    // TODO: домен ще не обрано. До запуску індексацію вимкнено
    url: 'https://solodki-buketi.example',
    name: 'Солодкі букети від Тетяни',
    indexable: false,
    // Сторінки пререндеряться як папка/index.html, а Cloudflare віддає їх за адресою зі слешем
    trailingSlash: true
  },

  sitemap: {
    // Усі адреси відомі під час збірки, тож sitemap.xml пререндериться і Worker його не генерує
    zeroRuntime: true,
    exclude: ['/tsiny/']
  },

  // Заявки з сайту йдуть у Telegram (див. .env.example)
  runtimeConfig: {
    telegramBotToken: '',
    telegramChatId: '',
    turnstileSecret: '',
    public: {
      turnstileSiteKey: ''
    }
  }
})
