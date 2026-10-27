"""
Масова уніфікація фото букетів для сайту.

Що робить з кожним фото:
  1. Прибирає фон (будь-який: чорний, сірий Photoroom, рушник, білий) + водяні знаки,
     що лежать на фоні (Photoroom, TikTok у кутку).
  2. Обрізає по контуру букета.
  3. Ставить букет по центру на однакове полотно 4:5 (1080x1350) з однаковими відступами,
     тож усі букети виходять одного масштабу.
  4. Зберігає два варіанти:
       out/transparent/<name>.webp  — прозорий фон (для сайту, фон задає CSS)
       out/bg/<name>.webp           — з фірмовим фоном і м'якою тінню (для соцмереж, OG-картинок)

Встановлення:
  pip install "rembg[cpu]" pillow numpy scipy
  (на GPU: pip install "rembg[gpu]")

Запуск:
  python process_images.py raw/ out/
  python process_images.py raw/ out/ --model birefnet-general --bg "#F7F1EA"
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def largest_object_alpha(alpha: np.ndarray, min_share: float = 0.15) -> np.ndarray:
    """Прибирає дрібне сміття (залишки вотермарки, крихти фону), лишає великі шматки."""
    try:
        from scipy import ndimage
    except ImportError:
        return alpha  # без scipy просто пропускаємо цей крок
    mask = alpha > 20
    labels, n = ndimage.label(mask)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(mask, labels, range(1, n + 1))
    keep = np.zeros_like(mask)
    biggest = sizes.max()
    for i, s in enumerate(sizes, start=1):
        if s >= biggest * min_share:
            keep |= labels == i
    return np.where(keep, alpha, 0).astype(np.uint8)


def has_black_background(rgb: np.ndarray) -> bool:
    """Мама вже вирізала букет на чорний фон — тоді надійніше прибрати саме чорне."""
    c = np.concatenate([rgb[:20, :20], rgb[:20, -20:], rgb[-20:, :20], rgb[-20:, -20:]]).reshape(-1, 3)
    return c.max(axis=1).mean() < 15


def black_key(img: Image.Image) -> Image.Image:
    from scipy import ndimage
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    alpha = np.clip((a.max(axis=2) - 18) / 22, 0, 1) * 255
    solid = ndimage.binary_fill_holes(alpha > 128)  # темні місця всередині букета не дірявимо
    alpha = np.where(solid, 255, alpha).astype(np.uint8)
    out = img.convert("RGBA")
    out.putalpha(Image.fromarray(alpha))
    return out


def process(path: Path, out_dir: Path, session, args) -> None:
    img = Image.open(path).convert("RGBA")

    if has_black_background(np.asarray(img.convert("RGB"))):
        cut = black_key(img)
    else:
        cut = remove(
            img,
            session=session,
            alpha_matting=args.matting,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
        )

    rgba = np.array(cut)
    rgba[:, :, 3] = largest_object_alpha(rgba[:, :, 3])
    cut = Image.fromarray(rgba)

    bbox = cut.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox()
    if not bbox:
        print(f"  ! {path.name}: букет не знайдено, пропускаю")
        return
    obj = cut.crop(bbox)

    W, H = args.width, args.height
    max_w, max_h = W * (1 - 2 * args.pad), H * (1 - 2 * args.pad)
    scale = min(max_w / obj.width, max_h / obj.height)
    obj = obj.resize((round(obj.width * scale), round(obj.height * scale)), Image.LANCZOS)

    x = (W - obj.width) // 2
    y = (H - obj.height) // 2

    # 1) прозорий варіант
    transparent = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    transparent.alpha_composite(obj, (x, y))
    (out_dir / "transparent").mkdir(parents=True, exist_ok=True)
    transparent.save(out_dir / "transparent" / f"{path.stem}.webp", "WEBP", quality=90, method=6)

    # 2) варіант з фоном і тінню
    bg = Image.new("RGBA", (W, H), (*hex_to_rgb(args.bg), 255))
    shadow_alpha = obj.getchannel("A").point(lambda a: int(a * 0.28))
    shadow = Image.new("RGBA", obj.size, (60, 40, 30, 0))
    shadow.putalpha(shadow_alpha)
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_layer.alpha_composite(shadow, (x + 12, y + 22))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(28))
    bg.alpha_composite(shadow_layer)
    bg.alpha_composite(obj, (x, y))
    (out_dir / "bg").mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(out_dir / "bg" / f"{path.stem}.webp", "WEBP", quality=88, method=6)

    small = min(obj.width / scale, obj.height / scale) < 700
    print(f"  ✓ {path.name}" + ("  (мала роздільність — краще знайти оригінал)" if small else ""))


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("src", type=Path)
    p.add_argument("out", type=Path)
    p.add_argument("--model", default="isnet-general-use",
                   help="isnet-general-use (перевірено), birefnet-general (точніший, повільніший), u2net")
    p.add_argument("--bg", default="#F7F1EA", help="колір фону для out/bg")
    p.add_argument("--width", type=int, default=1080)
    p.add_argument("--height", type=int, default=1350)
    p.add_argument("--pad", type=float, default=0.06, help="відступ від країв, частка")
    p.add_argument("--matting", action="store_true", help="точніші краї стрічок/плівки (повільніше)")
    args = p.parse_args()

    files = sorted(f for f in args.src.iterdir() if f.suffix.lower() in EXTS)
    if not files:
        sys.exit(f"У {args.src} немає зображень")

    if any(f.suffix.lower() == ".heic" for f in files):
        try:
            from pillow_heif import register_heif_opener
            register_heif_opener()
        except ImportError:
            sys.exit("Є .heic файли — встанови: pip install pillow-heif")

    session = new_session(args.model)
    print(f"Обробляю {len(files)} фото моделлю {args.model}…")
    for f in files:
        try:
            process(f, args.out, session, args)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {f.name}: {e}")
    print(f"Готово → {args.out}/transparent і {args.out}/bg")


if __name__ == "__main__":
    main()
