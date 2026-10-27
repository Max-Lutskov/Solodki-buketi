// Букети з Telegram мами (26.10.2026), до яких не було ціни. Решту Тетяна вписала 27.10.2026, лишились ці. Сторінка /tsiny/ збирає ціни й шле в Telegram.
// Фото — public/tsiny/<photo>.jpg (оригінали, щоб Тетяна впізнала роботу). id — номер повідомлення в чаті
export interface UnpricedBouquet {
  id: number
  /** Під яким заголовком мама надіслала фото */
  group: string
  photos: string[]
  /** Що було написано в чаті замість ціни */
  note?: string
}

export const unpriced: UnpricedBouquet[] = [
  { id: 2056462, group: 'Жіночі', photos: ['2056462_1'] },
  { id: 2056569, group: 'Дитячі', photos: ['2056569_1'] }
]
