# Солодкі букети — сайт

Сайт майстрині солодких (їстівних) букетів Тетяни Луцкової-Ковальської: Жмеринка, Вінниця, Вінницька область.
Мова спілкування з користувачем — українська. Мова сайту — лише українська.
Повне ТЗ: `SPEC.md` (там же список відкритих питань до Тетяни, §14).

## Стек
- Nuxt 4 + Vue 3 + TypeScript (strict), Nuxt UI 4 (Tailwind 4), `@nuxtjs/sitemap`, `@nuxtjs/robots`
- Технічна база взята з `D:\sadovi-mrii` (конфіги, Worker, скрипт фото, schema). Дизайн і структура блоків — свої, на Процков Буд і Садові мрії сайт не має бути схожим
- Іконки лише в клієнтському бандлі (`icon.serverBundle: false`): безкоштовний Worker — 3 МБ (зараз сервер ~2 МБ)
- Скіли проєкту лежать у `.claude/skills/`. Користуйся ними
- Node 22 (`.nvmrc`). На Windows у PowerShell — `npm.cmd` / `npx.cmd`

## Дані
- Контакти, довідники (приводи, кому, бюджети), FAQ, кроки — `app/data/site.ts`
- Букети — по файлу на букет `app/data/bouquets/<slug>.json`, тип у `app/data/types.ts`. `app/data/bouquets.ts` збирає їх через `import.meta.glob` і падає на збірці, якщо привід/отримувач не з довідника або `id` повторюється. Адреси `/roboty/<slug>/` додаються в пререндер самі (`nuxt.config.ts`)
- `import.meta.glob` працює лише у Vite, тож **сервер (`server/`) не імпортує `bouquets.ts`**: форма шле `ref` (slug) і `refTitle`
- Лендінги міст — `app/data/landings.ts` (файл читає й `nuxt.config.ts`, тому без аліасів `~`), сторінка — тонка обгортка `<LandingPage path="…" />`
- Телефон, Viber і Telegram — +380672680947 (Telegram за номером, без username). Самовивіз — Браїлів, вартість доставки обговорюється (підтверджено 23.10.2026)
- Букети — 95 реальних робіт з цінами з Telegram мами (26–27.10.2026), імпорт `scripts/import_telegram.py` (там же розмітка приводів/кому/алкоголю, назви й склад — проставлені за фото, уточнити в Тетяни). Дата у всіх однакова, розмір — від ціни
- **MOCK:** шкала розмірів, час відповіді, тексти «Про мене» і доставки (вартість, зони, оплата), FAQ. Шукати `MOCK` у коді
- **Не додавати:** вигаданих відгуків, цифр («500 букетів»), фактів про доставку/оплату, яких Тетяна не підтвердила

## Дизайн
- Кольори в `main.css`: `wine-*` (primary, кнопки — `wine-700`), `cocoa-*` (neutral, `cocoa-900` — текст), `rose` (підкладка фото), `foil` (золото, лише дрібні деталі), `milk` (фон)
- Шрифти: Cormorant (заголовки, `.title-xl/-lg/-md`), Manrope (текст)
- Фірмове: фото букета в арці (`.arch`), бирка з ціною на першому екрані. Поки фото немає — `BouquetArt.vue` малює букет-заглушку (псевдовипадковість на цілочисельному хеші, бо `Math.sin` дає розбіжність SSR/клієнт)
- Анімація при завантаженні одна: арка першого екрана «розгортається» (`.hero-arch`, CSS, вимикається `prefers-reduced-motion`). Інших не додавати, лише реакції на дії
- Без ALL-CAPS лейблів, номери — лише в «Як замовити» (це послідовність)

## Фото
`public/images/bouquets/<id>/<n>.jpg` (до 1600 px, для schema/OG) + WebP 400/600/800/1200/1600 для `srcset`: після додавання — `npm run images`. У JSON букета — `"images": ["<id>/1", …]`. Оригінали з телефона — у `photos/` (gitignore). Фон прибирати, підкладка однакова: `scripts/process_images.py --model birefnet-general-lite` (rembg, venv у `photos/.venv`; повна `birefnet-general` з'їдає RAM і валить WebStorm, isnet лишає «туман» на білій плівці) → `scripts/retouch.py` (правила для окремих фото) → вирізаний букет кладеться на `rose` у 3:4 (`compose()` в `import_telegram.py`). Фото, які треба перезняти (руки в кадрі тощо), — `photos/perezniaty.md`.

## Сторінки
`/`, `/roboty/` (фільтри в query: `budget`, `pryvid`, `komu`, `alkohol` — кілька значень через кому, у групі «або», між групами «і»; `sort`; читаються лише після монтування, бо сторінка пререндерена без параметрів), `/roboty/<slug>/`, `/zibraty-svij/` (`?ref=<slug>`), `/dostavka/`, `/pro-mene/`, `/kontakty/`, `/vinnytsia/`, `/zhmerynka/`, `/pryvatnist/`. Усі пререндеряться, адреси зі слешем у кінці.

SEO: `Florist` на всіх сторінках (`app.vue`), `Product`+`Offer` (PreOrder) на букетах, `FAQPage`, `BreadcrumbList` — `app/utils/schema.ts`. Мета — `usePageMeta()`. Canonical без query. Індексація вимкнена (`site.indexable: false`), поки немає домену.

## Заявки й хостинг
- `server/api/order.post.ts`: multipart, перевірка полів як у формі, honeypot `website`, Cloudflare Turnstile (якщо задано `NUXT_TURNSTILE_SECRET` / `NUXT_PUBLIC_TURNSTILE_SITE_KEY`), Telegram `sendMessage` + `sendMediaGroup` у кожен чат з `NUXT_TELEGRAM_CHAT_ID` (через кому). Без токена заявка пишеться в лог
- Фото-референси стискаються в браузері до 1600 px (`compressImage` у `useOrder.ts`)
- Хостинг: Cloudflare Worker `solodki-buketi` (`wrangler.jsonc`), деплой вручну `npm run deploy` (автодеплою з GitHub немає). Поки що адреса https://solodki-buketi.makslutskov1.workers.dev (задеплоєно 23.10.2026, секрети Telegram задані через `wrangler secret`, Turnstile ще ні). Домену ще немає: коли буде — `routes` з `custom_domain`, `workers_dev: false`, домен у `redirect-www/`, `site.url` і `indexable` у `nuxt.config.ts`
