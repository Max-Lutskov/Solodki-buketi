import { company } from '~/data/site'

export interface Messenger {
  name: string
  icon: string
  href: string
  /** Текст, який копіюємо в буфер: туди, де месенджер не вміє підставити його сам */
  copy?: string
}

/** Посилання на месенджери з готовим текстом повідомлення (SPEC.md §6) */
export function messengerLinks(text = 'Добрий день! Хочу замовити солодкий букет.'): Messenger[] {
  const phone = encodeURIComponent(company.phone)
  return [
    {
      name: 'Viber',
      icon: 'i-simple-icons-viber',
      // draft підставляє текст на телефоні; на комп'ютері Viber його ігнорує, тож ще й копіюємо
      href: `viber://chat?number=${phone}&draft=${encodeURIComponent(text)}`,
      copy: text
    },
    {
      name: 'Telegram',
      icon: 'i-simple-icons-telegram',
      href: company.telegram ? `https://t.me/${company.telegram}` : `https://t.me/${company.phone}`,
      copy: text
    },
    {
      name: 'Instagram',
      icon: 'i-simple-icons-instagram',
      href: `https://ig.me/m/${company.instagram}`,
      copy: text
    }
  ]
}

export function useCopyForMessenger() {
  const toast = useToast()
  return async (m: Messenger) => {
    if (!m.copy) return
    try {
      await navigator.clipboard.writeText(m.copy)
      toast.add({ title: 'Текст скопійовано', description: `Вставте його в чат ${m.name}.`, icon: 'i-lucide-check', color: 'success' })
    } catch {
      // Буфер недоступний (старий браузер чи без дозволу) — посилання все одно відкриється
    }
  }
}
