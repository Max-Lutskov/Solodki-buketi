// Ціни від Тетяни зі сторінки /tsiny/ → Telegram. Поля — як у app/pages/tsiny.vue
import { unpriced } from '~/data/unpriced'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

interface Body {
  items?: { id?: unknown, price?: unknown, note?: unknown }[]
  website?: unknown
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event).catch(() => null)
  if (!body || !Array.isArray(body.items)) throw createError({ statusCode: 400, statusMessage: 'Порожньо' })
  // Бот заповнив приховане поле — відповідаємо «ок», але нічого не шлемо
  if (body.website) return { ok: true }

  const lines: string[] = []
  for (const [i, b] of unpriced.entries()) {
    const item = body.items.find(x => x.id === b.id)
    if (!item) continue
    const price = typeof item.price === 'number' && item.price > 0 && item.price < 100000 ? Math.round(item.price) : null
    const note = typeof item.note === 'string' ? item.note.trim().slice(0, 300) : ''
    if (!price && !note) continue
    lines.push(`№${i + 1} (${b.id}, ${escapeHtml(b.group)}): ${price ? `<b>${price} грн</b>` : '—'}${note ? ` — ${escapeHtml(note)}` : ''}`)
  }
  if (!lines.length) throw createError({ statusCode: 400, statusMessage: 'Не вписано жодної ціни' })

  const text = [`<b>💰 Ціни на букети: ${lines.length} з ${unpriced.length}</b>`, '', ...lines].join('\n')

  const config = useRuntimeConfig(event)
  // Один числовий id з env Nuxt перетворює на число, тож спершу в рядок
  const chatIds = String(config.telegramChatId ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (!config.telegramBotToken || !chatIds.length) {
    console.warn('[prices] Telegram не налаштований, ціни:\n' + text)
    return { ok: true, delivered: false }
  }

  try {
    for (const chatId of chatIds) {
      await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
        method: 'POST',
        body: { chat_id: chatId, text, parse_mode: 'HTML' }
      })
    }
  } catch (error) {
    console.error('[prices] Не вдалося надіслати в Telegram', error)
    throw createError({ statusCode: 502, statusMessage: 'Не вдалося надіслати' })
  }

  return { ok: true, delivered: true }
})
