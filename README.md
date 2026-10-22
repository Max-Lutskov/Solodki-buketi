# Солодкі букети від Тетяни

Сайт солодких букетів: Жмеринка, Вінниця, Вінницька область. ТЗ — `SPEC.md`.

Nuxt 4 + Vue 3 + TypeScript (strict) + Nuxt UI 4, хостинг — Cloudflare Worker.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000
```

## Як додати роботу в галерею

1. Фото без фону, однакова підкладка, до 1600 px по довшій стороні → `public/images/bouquets/<id>/1.jpg`, `2.jpg`…
2. `npm run images` — зробить WebP-варіанти.
3. Файл `app/data/bouquets/<slug>.json` (slug латиницею, він стане адресою `/roboty/<slug>/`):

```json
{
  "id": 14,
  "title": "Червоні тюльпани з Ferrero",
  "date": "2026-02-23",
  "price": 1200,
  "images": ["14/1", "14/2"],
  "occasions": ["birthday", "march8"],
  "recipients": ["woman"],
  "alcohol": null,
  "shippable": false,
  "size": "M",
  "composition": ["Ferrero Rocher — 15 шт", "Цукерки-тюльпани з гофропаперу"],
  "featured": true
}
```

Приводи й отримувачі — лише зі списків у `app/data/site.ts`, інакше збірка підкаже помилку.

## Заявки в Telegram

1. Створіть бота через @BotFather і скопіюйте токен.
2. Кожен, хто має отримувати заявки, пише боту будь-що. Потім відкрийте `https://api.telegram.org/bot<TOKEN>/getUpdates` і візьміть `chat.id`.
3. Скопіюйте `.env.example` у `.env` і впишіть значення (кілька chat id — через кому).
4. На Cloudflare: `npx.cmd wrangler secret put NUXT_TELEGRAM_BOT_TOKEN` і так само `NUXT_TELEGRAM_CHAT_ID`.

Без налаштування заявки виводяться в консоль сервера.

## Деплой

```bash
npm run deploy     # nuxt build --preset cloudflare_module && wrangler deploy
```

## Чекліст запуску (поза кодом)

- [ ] Відповіді Тетяни на питання з `SPEC.md` §14, замінити все з позначкою `MOCK`
- [ ] Реальні роботи з фото й цінами замість прикладів (`"mock": true`)
- [ ] Домен (NS на Cloudflare), `routes` у `wrangler.jsonc`, `redirect-www/`, `site.url` і `indexable: true` у `nuxt.config.ts`
- [ ] Cloudflare Turnstile: ключі в секрети Worker'а
- [ ] Cloudflare Web Analytics (без cookie)
- [ ] Google Search Console (ресурс «Домен», TXT-запис у Cloudflare), надіслати `sitemap.xml`
- [ ] Google Business Profile: категорія «Флорист» / «Магазин подарунків», зона обслуговування Жмеринка, Вінниця, область, посилання на сайт, фото робіт
- [ ] Посилання на сайт в Instagram-профілі й агрегаторах (list.in.ua тощо)
