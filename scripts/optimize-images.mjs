// Генерує WebP-варіанти фото з public/images для srcset: name.jpg → name-400.webp, name-800.webp тощо.
// Запускати після додавання чи заміни фото: `npm run images`. Готові .webp комітимо разом із .jpg.
// Ширини мають збігатися з тими, що передаються в srcset() у компонентах (app/utils/img.ts).
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = 'public/images'

/** Ширини для кожного фото; ключ — шлях без розширення відносно public/images */
const WIDTHS = {}
// Фото букетів бувають і картками в галереї, і великими (перший екран, сторінка букета).
// Оригінали експортуємо до 1600 px по довшій стороні (SPEC.md §10).
const DEFAULT_WIDTHS = [400, 600, 800, 1200, 1600]

async function* jpgs(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name)
    if ((await stat(path)).isDirectory()) yield* jpgs(path)
    else if (name.endsWith('.jpg')) yield path
  }
}

let made = 0
for await (const path of jpgs(ROOT)) {
  // На Windows join() дає зворотні слеші, а ключі WIDTHS записані з прямими
  const key = path.slice(ROOT.length + 1, -4).replaceAll('\\', '/')
  const { width: srcWidth } = await sharp(path).metadata()
  for (const w of WIDTHS[key] ?? DEFAULT_WIDTHS) {
    // Не роздуваємо фото понад оригінал: така ширина в srcset просто віддасть найбільший варіант
    await sharp(path)
      .resize({ width: Math.min(w, srcWidth) })
      .webp({ quality: 72, effort: 6 })
      .toFile(`${path.slice(0, -4)}-${w}.webp`)
    made++
  }
}
console.log(`WebP: ${made} файлів`)
