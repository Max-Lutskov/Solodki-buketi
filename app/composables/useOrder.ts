/** Мінімальна перевірка українського номера: 10 цифр з 0 на початку або 12 з 380 */
export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return /^0\d{9}$/.test(digits) || /^380\d{9}$/.test(digits)
}

/** Завтрашня дата YYYY-MM-DD за місцевим часом: раніше замовити не можна */
export function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Стискає фото-референс у браузері до 1600 px і JPEG ~0.8, щоб заявка з трьома фото
 * не важила 15 МБ на мобільному інтернеті. Якщо браузер не вміє — віддає оригінал
 */
export async function compressImage(file: File, max = 1600): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}
