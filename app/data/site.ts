// Усі тексти й контакти сайту. MOCK — уточнити в Тетяни перед запуском (див. SPEC.md §14)
import type { Faq } from './types'

export const company = {
  // MOCK: назви бренду поки немає
  name: 'Солодкі букети від Тетяни',
  shortName: 'Солодкі букети',
  master: 'Тетяна Луцкова-Ковальська',
  // Той самий номер для дзвінків, Viber і Telegram (підтверджено 23.10.2026)
  phone: '+380672680947',
  phoneDisplay: '067 268 09 47',
  // Username у Telegram немає, посилання йде за номером
  telegram: '',
  instagram: 'tatyanalutskovakovalskaia',
  city: 'Жмеринка',
  // Самовивіз (підтверджено 23.10.2026)
  pickup: 'Браїлів',
  region: 'Вінницька область',
  // MOCK: реальний час відповіді на заявку
  replyTime: 'найближчим часом'
}

export const instagramUrl = `https://www.instagram.com/${company.instagram}/`

export interface Option {
  slug: string
  label: string
}

/** Приводи. Слаги використовуються в даних букетів і в адресах фільтрів */
export const occasions: Option[] = [
  { slug: 'birthday', label: 'День народження' },
  { slug: 'march8', label: '8 Березня' },
  { slug: 'valentine', label: '14 лютого' },
  { slug: 'teacher', label: 'Вчителю' },
  { slug: 'man', label: 'Чоловіку' },
  { slug: 'kids', label: 'Дитині' },
  { slug: 'wedding', label: 'Весілля, ювілей' },
  { slug: 'corporate', label: 'Корпоратив' }
]

export const recipients: Option[] = [
  { slug: 'woman', label: 'Жінці' },
  { slug: 'man', label: 'Чоловіку' },
  { slug: 'child', label: 'Дитині' },
  { slug: 'teacher', label: 'Вчителю' },
  { slug: 'colleagues', label: 'Колегам' }
]

export interface BudgetRange {
  slug: string
  label: string
  /** Включно */
  min: number
  /** Не включно; null — без верхньої межі */
  max: number | null
}

// MOCK: межі бюджетів. Межа належить верхньому діапазону: букет за 800 грн — у «800–1 500»
export const budgetRanges: BudgetRange[] = [
  { slug: 'do-800', label: 'до 800 грн', min: 0, max: 800 },
  { slug: '800-1500', label: '800–1 500 грн', min: 800, max: 1500 },
  { slug: '1500-2500', label: '1 500–2 500 грн', min: 1500, max: 2500 },
  { slug: 'vid-2500', label: 'від 2 500 грн', min: 2500, max: null }
]

export const sizes = {
  S: 'Невеликий',
  M: 'Середній',
  L: 'Великий',
  XL: 'Дуже великий'
} as const

export const steps = [
  { title: 'Обираєте або описуєте', text: 'Покажіть букет з галереї або розкажіть, що любить людина, якій даруєте.' },
  { title: 'Узгоджуємо', text: 'Цукерки, алкоголь, кольори й бюджет. Надішлю фото схожих робіт, щоб ви бачили, що вийде.' },
  { title: 'Збираю вручну', text: 'Кожен букет роблю під конкретне замовлення, а не беру з полиці.' },
  { title: 'Отримуєте', text: 'Самовивіз у Браїлові або доставка по Жмеринці, Вінниці та області.' }
]

export const deliveryOptions = [
  { value: 'pickup', label: 'Самовивіз, Браїлів', needs: null },
  { value: 'zhmerynka', label: 'Доставка по Жмеринці', needs: 'address' },
  { value: 'vinnytsia', label: 'Доставка по Вінниці', needs: 'address' },
  { value: 'region', label: 'Доставка по області', needs: 'address' },
  { value: 'novaposhta', label: 'Нова пошта', needs: 'np' }
] as const

export type DeliveryValue = typeof deliveryOptions[number]['value']

export const alcoholOptions = [
  { value: 'none', label: 'Без алкоголю' },
  { value: 'champagne', label: 'Шампанське' },
  { value: 'wine', label: 'Вино' },
  { value: 'strong', label: 'Міцний' },
  { value: 'custom', label: 'Свій варіант' }
]

export const contactMethods = [
  { value: 'viber', label: 'Viber' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'call', label: 'Дзвінок' },
  { value: 'instagram', label: 'Instagram' }
]

// MOCK: відповіді треба перевірити з Тетяною (SPEC.md §9)
export const faq: Faq[] = [
  {
    q: 'За скільки днів треба замовляти?',
    a: 'Краще за 1–2 дні, щоб я встигла купити потрібні цукерки й алкоголь. Перед святами (8 Березня, 14 лютого, 1 вересня) — раніше. Термінове замовлення на сьогодні — уточнюйте, іноді вдається.'
  },
  {
    q: 'Чи можна обрати свої цукерки й алкоголь?',
    a: 'Так, майже кожен букет я збираю під замовника. Назвіть улюблені цукерки й напій, або залиште вибір мені. Алкоголь купую в магазинах, лише офіційну продукцію.'
  },
  {
    q: 'Скільки коштує букет?',
    a: 'Ціна залежить від складу і розміру. У галереї біля кожної роботи вказана її реальна ціна. Скажіть свій бюджет, і я підберу склад під нього.'
  },
  {
    q: 'Чи доставляєте по Вінниці та області?',
    a: 'Так, доставляю по Жмеринці, Вінниці та населених пунктах області. Вартість доставки залежить від адреси, її обговорюємо під час замовлення. Забрати самостійно можна в Браїлові.'
  },
  {
    q: 'Чи можна відправити букет в інше місто?',
    a: 'Компактні букети й бокси можна відправити Новою поштою в жорсткій коробці. Великі букети краще не возити так далеко. Напишіть, куди потрібно, і я підкажу, що доїде без пошкоджень.'
  },
  {
    q: 'Як оплатити?',
    a: 'Спосіб оплати узгоджуємо під час замовлення.'
  },
  {
    q: 'Чи можна додати листівку, іграшку чи кульки?',
    a: 'Так, листівку з вашим текстом, м\'яку іграшку чи інший декор можна додати до букета. Скажіть про це під час замовлення.'
  }
]

/** Навігація шапки й футера */
export const nav = [
  { to: '/roboty/', label: 'Роботи' },
  { to: '/zibraty-svij/', label: 'Зібрати свій' },
  { to: '/dostavka/', label: 'Доставка' },
  { to: '/pro-mene/', label: 'Про мене' },
  { to: '/kontakty/', label: 'Контакти' }
]
