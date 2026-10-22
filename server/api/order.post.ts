// Заявка з форми «Зібрати свій букет» → Telegram. Поля — як у app/pages/zibraty-svij.vue
import { alcoholOptions, budgetRanges, contactMethods, deliveryOptions, occasions } from '~/data/site'

const MAX_PHOTOS = 3
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const labelOf = (list: readonly { value: string, label: string }[], v: string) => list.find(x => x.value === v)?.label

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts) throw createError({ statusCode: 400, statusMessage: 'Порожня заявка' })

  const fields: Record<string, string> = {}
  const photos: { data: Uint8Array, type: string }[] = []
  for (const p of parts) {
    if (p.name === 'photos' && p.filename) {
      if (photos.length < MAX_PHOTOS && p.data.length <= MAX_PHOTO_SIZE && p.type?.startsWith('image/')) {
        photos.push({ data: p.data, type: p.type })
      }
    } else if (p.name) {
      fields[p.name] = new TextDecoder().decode(p.data).trim().slice(0, 1000)
    }
  }
  const f = (k: string, max = 200) => (fields[k] ?? '').slice(0, max)

  // Бот заповнив приховане поле — відповідаємо «ок», але нічого не шлемо
  if (f('website')) return { ok: true }

  const config = useRuntimeConfig(event)

  if (config.turnstileSecret) {
    const check = await $fetch<{ success: boolean }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: { secret: config.turnstileSecret, response: f('turnstile', 2048), remoteip: getRequestIP(event, { xForwardedFor: true }) }
    }).catch(() => ({ success: false }))
    if (!check.success) throw createError({ statusCode: 400, statusMessage: 'Не пройдено перевірку від ботів, оновіть сторінку' })
  }

  // Та сама перевірка, що й на сторінці: обійти форму не вийде
  const phone = f('phone', 32)
  const digits = phone.replace(/\D/g, '')
  if (!/^0\d{9}$/.test(digits) && !/^380\d{9}$/.test(digits)) {
    throw createError({ statusCode: 400, statusMessage: 'Невірний номер телефону' })
  }
  // Обов'язкові лише ім'я й телефон, решта — якщо людина захотіла вказати
  const name = f('name', 80)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Вкажіть ім\'я' })
  const budget = budgetRanges.find(b => b.slug === f('budget'))
  const delivery = deliveryOptions.find(d => d.value === f('delivery'))
  const date = /^\d{4}-\d{2}-\d{2}$/.test(f('date', 10)) ? f('date', 10) : ''
  const alcohol = f('alcohol')
  const withAlcohol = alcohol && alcohol !== 'none'
  if (withAlcohol && !f('adult')) throw createError({ statusCode: 400, statusMessage: 'Букет з алкоголем — лише від 18 років' })

  // Дані букетів збираються лише у фронтенд, тож тут тільки посилання на сторінку прикладу
  const ref = /^[a-z0-9-]{1,80}$/.test(f('ref')) ? f('ref') : ''
  const occasion = occasions.find(o => o.slug === f('occasion'))?.label
  const siteUrl = getSiteConfig(event).url.replace(/\/$/, '')

  const line = (label: string, value?: string | false | null) => value && `${label}: ${escapeHtml(value)}`
  const lines = [
    '<b>🍬 Нова заявка на букет</b>',
    ref && `Як приклад: <a href="${siteUrl}/roboty/${ref}/">${escapeHtml(f('refTitle')) || ref}</a>`,
    line('Ім\'я', name),
    line('Телефон', phone),
    line('Зв\'язок', labelOf(contactMethods, f('contact'))),
    '',
    line('Побажання', f('wish', 1000)),
    line('Бюджет', budget?.label),
    line('Дата', date && date.split('-').reverse().join('.')),
    line('Привід', occasion),
    withAlcohol && `${line('Алкоголь', labelOf(alcoholOptions, alcohol))} (18+ підтверджено)`,
    line('Отримання', delivery?.label),
    line(delivery?.needs === 'np' ? 'Нова пошта' : 'Адреса', f('address')),
    photos.length > 0 && `Фото-приклади: ${photos.length}`
  ].filter(l => l !== false && l !== undefined && l !== null)
  const text = lines.join('\n').replace(/\n{3,}/g, '\n\n')

  // Один числовий id з env Nuxt перетворює на число, тож спершу в рядок
  const chatIds = String(config.telegramChatId ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (!config.telegramBotToken || !chatIds.length) {
    // Бот ще не налаштований: у розробці просто показуємо заявку в консолі
    console.warn('[order] Telegram не налаштований, заявка:\n' + text)
    return { ok: true, delivered: false }
  }

  const api = `https://api.telegram.org/bot${config.telegramBotToken}`
  try {
    for (const chatId of chatIds) {
      await $fetch(`${api}/sendMessage`, {
        method: 'POST',
        body: { chat_id: chatId, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }
      })
      if (photos.length) {
        const body = new FormData()
        body.append('chat_id', chatId)
        body.append('media', JSON.stringify(photos.map((_, i) => ({ type: 'photo', media: `attach://p${i}` }))))
        photos.forEach((p, i) => body.append(`p${i}`, new Blob([p.data as Uint8Array<ArrayBuffer>], { type: p.type }), `p${i}.jpg`))
        await $fetch(`${api}/sendMediaGroup`, { method: 'POST', body })
      }
    }
  } catch (error) {
    console.error('[order] Не вдалося надіслати в Telegram', error)
    throw createError({ statusCode: 502, statusMessage: 'Не вдалося надіслати заявку' })
  }

  return { ok: true, delivered: true }
})
