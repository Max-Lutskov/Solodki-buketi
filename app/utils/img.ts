// Фото букетів: public/images/bouquets/<name>.jpg + WebP-варіанти від scripts/optimize-images.mjs
// (name.jpg → name-800.webp). Ширини мають збігатися з тими, що задані в скрипті.
export const WIDTHS = [400, 600, 800, 1200, 1600]

export const bouquetImage = (name: string) => `/images/bouquets/${name}.jpg`

export function srcset(src: string, widths: number[] = WIDTHS) {
  const base = src.replace(/\.jpg$/, '')
  return widths.map(w => `${base}-${w}.webp ${w}w`).join(', ')
}
