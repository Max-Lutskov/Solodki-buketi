"""
Доводка вирізаних букетів після process_images.py, перед import_telegram.py.

Основа — birefnet-general-lite (photos/redo/lite/transparent): чистіше за isnet на білій плівці.
Для окремих фото — правила нижче. Результат: photos/final/<name>.webp (прозорий фон).

  photos/.venv/Scripts/python scripts/retouch.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
LITE = ROOT / "photos/redo/lite/transparent"
ISNET = ROOT / "photos/telegram-out/transparent"
OUT = ROOT / "photos/final"

# Де isnet вийшов краще за lite
USE_ISNET = {"2056459_1"}
# Руки, що заходять у кадр з краю
HANDS = {"2056444_1", "2056449_1", "2056488_1", "2056513_1", "2056521_1", "2056524_1", "2056546_1",
         "2056547_1", "2056548_1", "2056551_1", "2056552_1", "2056556_1", "2056576_1", "2056577_1"}


def load(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"))


def keep_main(rgba: np.ndarray, min_share: float = 0.15) -> np.ndarray:
    mask = rgba[:, :, 3] > 20
    labels, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum(mask, labels, range(1, n + 1))
        keep = np.isin(labels, [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * min_share])
        rgba[:, :, 3] = np.where(keep, rgba[:, :, 3], 0)
    return rgba


def skin(rgb: np.ndarray) -> np.ndarray:
    """Класичне правило шкіри в YCrCb + RGB, щоб не чіпати рожеву плівку (у неї B високий)."""
    r, g, b = (rgb[:, :, i].astype(np.int16) for i in range(3))
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cr = (r - y) * 0.713 + 128
    cb = (b - y) * 0.564 + 128
    return (cr > 138) & (cr < 175) & (cb > 85) & (cb < 125) & (r > g) & (g > b) & (r - b > 25) & (y > 50)


def remove_hands(rgba: np.ndarray) -> np.ndarray:
    a = rgba[:, :, 3] > 20
    s = ndimage.binary_opening(skin(rgba[:, :, :3]) & a, iterations=2)
    s = ndimage.binary_dilation(s, iterations=3) & a
    labels, n = ndimage.label(s)
    # Лише плями, що торкаються краю видимого об'єкта збоку чи знизу і досить великі
    ys, xs = np.nonzero(a)
    x0, x1, y1 = xs.min(), xs.max(), ys.max()
    for i in range(1, n + 1):
        comp = labels == i
        cy, cx = np.nonzero(comp)
        touches = cx.min() <= x0 + 6 or cx.max() >= x1 - 6 or cy.max() >= y1 - 6
        if touches and comp.sum() > 1500:
            rgba[:, :, 3][comp] = 0
    # Ремінець годинника/браслет темний, лишається острівцем — його прибере keep_main
    return keep_main(rgba, 0.05)


def union_with_isnet(name: str) -> np.ndarray:
    """Букет обрізаний кадром: lite губить верх, isnet лишає туман. Беремо lite + щільне з isnet."""
    lite, isn = load(LITE / f"{name}.webp"), load(ISNET / f"{name}.webp")
    solid = np.where(isn[:, :, 3] > 90, isn[:, :, 3], 0)
    out = np.where((solid > lite[:, :, 3])[:, :, None], isn, lite)
    return keep_main(out)


def drop_green(rgba: np.ndarray) -> np.ndarray:
    r, g, b = (rgba[:, :, i].astype(np.int16) for i in range(3))
    green = (g > r + 10) & (g > b)
    rgba[:, :, 3][ndimage.binary_dilation(green, iterations=2)] = 0
    return keep_main(rgba)


def drop_thin_columns(rgba: np.ndarray) -> np.ndarray:
    """Смуга від краю скриншота: стовпці, де непрозорого менше 3 % висоти об'єкта."""
    a = rgba[:, :, 3] > 20
    cols = a.sum(axis=0)
    rgba[:, cols < a.any(axis=1).sum() * 0.03, 3] = 0
    return keep_main(rgba)


def hide_watermark(rgba: np.ndarray) -> np.ndarray:
    """Білий напис TikTok внизу праворуч на темно-зеленій плівці: світлі пікселі → колір навколо."""
    h, w = rgba.shape[:2]
    y0, x0 = int(h * 0.7), int(w * 0.45)
    reg = rgba[y0:, x0:, :3].astype(np.float32)
    solid = rgba[y0:, x0:, 3] > 200
    # Плівка жовта й зелена, у них синій канал низький; білий текст — усі канали високі
    text = ndimage.binary_dilation((reg.min(axis=2) > 150) & solid, iterations=3)
    # Нормована згортка: колір кожного пікселя тексту — з сусідів, які не текст
    valid = (solid & ~text).astype(np.float32)
    for _ in range(3):
        num = np.stack([ndimage.gaussian_filter(reg[:, :, c] * valid, 6) for c in range(3)], axis=2)
        den = ndimage.gaussian_filter(valid, 6)[:, :, None]
        fill = num / np.maximum(den, 1e-3)
        reg[text] = fill[text]
    rgba[y0:, x0:, :3] = reg.clip(0, 255).astype(np.uint8)
    return rgba


SPECIAL = {
    "2056477_1": lambda: union_with_isnet("2056477_1"),
    "2056570_1": lambda: drop_green(load(LITE / "2056570_1.webp")),
    "2056520_1": lambda: drop_thin_columns(load(LITE / "2056520_1.webp")),
    "2056515_1": lambda: hide_watermark(load(LITE / "2056515_1.webp")),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for path in sorted(LITE.glob("*.webp")):
        name = path.stem
        if name in SPECIAL:
            rgba = SPECIAL[name]()
        else:
            rgba = load((ISNET if name in USE_ISNET else LITE) / path.name)
        Image.fromarray(rgba).save(OUT / path.name, "WEBP", lossless=True)
    print(f"Готово → {OUT}")


if __name__ == "__main__":
    main()
