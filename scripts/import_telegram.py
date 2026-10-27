"""
Разовий імпорт букетів з Telegram (26.10.2026) у app/data/bouquets/*.json + фото для сайту.

Бере вирізані фото з photos/final/ (process_images.py з --model birefnet-general-lite → retouch.py),
кладе на підкладку арки (--color-rose) у 3:4 і зберігає public/images/bouquets/<id>/<n>.jpg.
Після нього: npm run images.

  photos/.venv/Scripts/python scripts/import_telegram.py
"""

import json
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "photos/final"
# Жодна модель не вирізає цілим (обрізаний кадром; коробка зливається з фоном) — поки ставимо оригінал. Потрібне нове фото
RAW = {"2056477_1", "2056459_1"}
DATA = ROOT / "app/data/bouquets"
IMG = ROOT / "public/images/bouquets"
DATE = "2026-10-26"
ROSE = (0xF1, 0xDC, 0xD8)
W, H, PAD = 1200, 1600, 0.06

# Приводи: b — день народження, m — 8 Березня, v — 14 лютого, ny — Новий рік, t — вчителю,
# man — чоловіку, kids — дитині, w — весілля/ювілей. Кому: W жінці, M чоловіку, C дитині, T вчителю, K колегам
OCC = {"b": "birthday", "m": "march8", "v": "valentine", "ny": "newyear", "t": "teacher",
       "man": "man", "kids": "kids", "w": "wedding"}
REC = {"W": "woman", "M": "man", "C": "child", "T": "teacher", "K": "colleagues"}

# (повідомлення, ціна, slug, назва, приводи, кому, алкоголь, склад, на головну)
B = [
    # Жіночі
    (2056440, 600, "smarahdovyi-z-tsukerok", "Букет з цукерок у смарагдовій плівці", "b m", "W T K", None, ["Цукерки", "Плівка й атласні стрічки"], False),
    (2056442, 650, "z-dnem-narodzhennia-bili-troiandy", "«З днем народження» з білими трояндами", "b", "W", None, ["Цукерки", "Декоративні троянди", "Топер «З днем народження»"], False),
    (2056444, 400, "biriuzovyi-z-rozhevymy-tsukerkamy", "Бірюзовий букет з рожевими цукерками", "b m", "W T K", None, ["Цукерки в рожевій обгортці", "Плівка й стрічки"], False),
    (2056445, 350, "buzkovyi-mini", "Невеликий бузковий букет", "b m", "W T K", None, ["Цукерки", "Бузкова плівка"], False),
    (2056447, 600, "ferrero-u-kapeliushnii-korobtsi", "Ferrero і троянди в капелюшній коробці", "b m v", "W", None, ["Ferrero Rocher", "Шоколад", "Декоративні троянди", "Капелюшна коробка"], True),
    (2056448, 1100, "velykyi-z-raffaello", "Великий букет з Raffaello", "b m w", "W", None, ["Raffaello", "Цукерки в рожевій обгортці"], False),
    (2056449, 500, "sumochka-just-for-you", "Сумочка «Just for you»", "b m v", "W", None, ["Цукерки", "Декоративні троянди", "Подарункова сумочка"], False),
    (2056450, 800, "z-ananasom", "Букет з ананасом", "b m", "W K", None, ["Ананас", "Мармелад", "Raffaello"], True),
    (2056451, 400, "koshyk-raffaello-i-troiandy", "Кошик з Raffaello і трояндами", "b m t", "W T", None, ["Raffaello", "Декоративні троянди", "Кошик з ручками"], False),
    (2056452, 900, "sertse-raffaello-i-troiandy", "Серце з Raffaello і трояндами", "b m v", "W", None, ["Raffaello", "Декоративні троянди", "Коробка-серце"], True),
    (2056454, 1500, "naikrashchii-vchyteltsi-z-shampanskym", "«Найкращій вчительці» з шампанським", "t b", "T W", "Шампанське", ["Ferrero Rocher", "Шампанське", "Топер «Найкращій вчительці»"], True),
    (2056455, 400, "lovare-z-tsukerkamy-sharm", "Чай Lovare з цукерками «Шарм»", "b m t", "W T K", None, ["Чай Lovare", "Цукерки «Шарм»", "Декоративні троянди"], False),
    (2056457, 1000, "bilyi-raffaello-ferrero", "Білий букет з Raffaello і Ferrero", "b m w", "W", None, ["Raffaello", "Ferrero Rocher"], False),
    (2056459, 600, "korobka-sertse-raffaello", "Коробка-серце з Raffaello", "m v", "W", None, ["Raffaello", "Декоративні троянди", "Коробка-серце"], False),
    (2056461, 600, "buzkovyi-raffaello-ferrero", "Бузковий букет з Raffaello і Ferrero", "b m", "W T", None, ["Raffaello", "Ferrero Rocher", "Декоративні троянди"], False),
    (2056463, 850, "rozhevyi-raffaello-ferrero", "Рожевий букет з Raffaello і Ferrero", "b m", "W", None, ["Raffaello", "Ferrero Rocher", "Декоративні троянди"], False),
    (2056464, 500, "korobka-z-troiandamy-i-raffaello", "Коробка з трояндами й Raffaello", "b m v", "W", None, ["Raffaello", "Декоративні троянди", "Коробка"], False),
    (2056466, 800, "sumochka-z-shampanskym", "Сумочка з цукерками й шампанським", "b m", "W K", "Шампанське", ["Цукерки", "Шоколад", "Шампанське", "Подарункова сумочка"], False),
    (2056469, 1200, "raffaello-ferrero-i-kava", "Raffaello, Ferrero і кава", "b w", "W K", None, ["Raffaello", "Ferrero Rocher", "Кава Lavazza", "Капелюшна коробка"], True),
    (2056471, 400, "lovare-z-tsukerkamy", "Чай Lovare з цукерками", "b m t", "W T K", None, ["Чай Lovare", "Цукерки «Шарм»"], False),
    (2056474, 450, "blakytnyi-z-tsukerok", "Блакитний букет з цукерок", "b", "W T K", None, ["Цукерки", "Блакитна плівка"], False),
    (2056476, 1500, "buket-smakolykiv-zelenyi", "Букет смаколиків у зеленій плівці", "b", "W M", "Мініатюрні пляшечки", ["Ferrero Rocher", "Снеки", "Мініатюрні пляшечки"], False),
    (2056477, 600, "buzkovyi-z-troiandamy", "Бузковий букет з трояндами", "b m", "W", None, ["Шоколадні цукерки", "Декоративні троянди"], False),
    (2056478, 600, "naikrashchii-vchyteltsi-rozhevyi", "«Найкращій вчительці» рожевий", "t", "T W", None, ["Raffaello", "Декоративні троянди", "Топер «Найкращій вчительці»"], False),
    (2056479, 1200, "shampanske-v-korobtsi", "Шампанське й троянди в коробці", "b m w", "W", "Шампанське", ["Шампанське", "Raffaello", "Декоративні троянди", "Капелюшна коробка"], False),
    (2056480, 1200, "ferrero-i-bili-troiandy", "Ferrero і білі троянди", "b w", "W K", None, ["Ferrero Rocher", "Декоративні троянди", "Сітка й темно-зелена плівка"], False),
    (2056481, 400, "lovare-i-troiandy", "Чай Lovare з трояндами", "b m t", "W T K", None, ["Чай Lovare", "Цукерки", "Декоративні троянди"], False),
    (2056486, 550, "korysnyi-dlia-hospodyni", "Корисний букет для господині", "b m", "W K", None, ["Губки й побутові дрібниці", "Смаколики"], False),
    (2056487, 600, "z-kukurudzy", "Букет з кукурудзи", "b", "W M", None, ["Качани кукурудзи", "Вишитий рушник"], False),
    (2056488, 1000, "rozhevyi-zi-smakolykamy", "Рожевий букет зі смаколиками", "b m", "W", None, ["Шоколадні батончики", "Снеки", "Дрібні подарунки"], False),
    (2056490, 650, "persykovyi-z-troiandamy", "Персиковий букет з трояндами", "b m", "W T", None, ["Цукерки", "Декоративні троянди"], False),
    # Чоловічі
    (2056512, 1300, "cholovichyi-z-mini-plyashkamy", "Чоловічий букет з мініатюрами", "man b", "M K", "Мініатюрні пляшки", ["Мініатюрні пляшки", "Камамбер", "Лимони", "Шоколадні батончики"], False),
    (2056513, 850, "cholovichyi-z-horilkoiu", "Чоловічий букет з горілкою", "man b", "M", "Горілка", ["Горілка", "Лимони", "Сир", "Оливки", "Снеки"], False),
    (2056514, 1800, "na-rushnyku-z-oakheart", "Букет на рушнику з Oakheart", "man b w", "M", "Ром Oakheart", ["Ром Oakheart", "Камамбер", "Лимони", "Вишитий рушник"], True),
    (2056515, 1200, "oakheart-i-frukty", "Oakheart з фруктами", "man b", "M", "Ром Oakheart", ["Ром Oakheart", "Фрукти", "Снеки"], False),
    (2056516, 800, "korobka-z-syramy-i-likerom", "Коробка з сирами", "man b", "M", "Міцний алкоголь", ["Пляшка міцного", "Брі й камамбер", "Апельсини", "Ferrero Rocher"], False),
    (2056517, 1500, "korob-smakolykiv-dlia-cholovika", "Короб смаколиків для чоловіка", "man b", "M K", None, ["Сири", "Апельсини", "Фісташки", "Ferrero Rocher", "Кава"], False),
    (2056518, 600, "cholovichyi-z-pyvom-i-kamamberom", "З пивом і камамбером", "man b", "M", "Пиво", ["Пиво", "Камамбер", "Лимони", "Ferrero Rocher"], False),
    (2056519, 800, "pyvnyi-nabir", "Пивний набір", "man b", "M", "Пиво", ["Amstel, «Львівське»", "Горішки", "Камамбер"], False),
    (2056520, 800, "z-dnem-narodzhennia-pyvnyi", "«З днем народження» пивний", "man b", "M", "Пиво", ["Пиво", "Чипси й снеки", "Топер «З днем народження»"], False),
    (2056521, 1400, "z-red-label", "Букет з Red Label", "man b w", "M", "Віскі Johnnie Walker Red Label", ["Віскі Red Label", "Камамбер", "Лимони", "Ferrero Rocher"], True),
    (2056523, 1500, "koshyk-z-pyvom-i-horishkamy", "Кошик з пивом і горішками", "man b", "M K", "Пиво", ["Пиво", "Горішки", "Снеки до пива"], False),
    (2056524, 800, "skrynka-z-pyvom", "Дерев'яна скринька з пивом", "man b", "M", "Пиво", ["Пиво", "Горішки", "Снеки до пива", "Дерев'яна скринька"], False),
    # Дитячі
    (2056541, 350, "bilyi-mini-z-tsukerkamy", "Білий мінібукет", "kids b", "C W", None, ["Шоколадні цукерки"], False),
    (2056543, 350, "rozhevyi-z-shokoladkoiu", "Рожевий з шоколадкою", "b m", "C W", None, ["Шоколад", "Декоративні троянди"], False),
    (2056545, 350, "milka-fioletovyi", "Фіолетовий з Milka", "kids b", "C W", None, ["Milka", "Декоративні троянди"], False),
    (2056546, 350, "kruhlyi-rozhevo-buzkovyi", "Круглий рожево-бузковий", "b", "C W", None, ["Цукерки", "Декоративна троянда"], False),
    (2056547, 600, "shapka-dida-moroza", "Шапка Діда Мороза", "ny kids", "C", None, ["Цукерки", "Шоколад", "Новорічний декор"], True),
    (2056548, 450, "blakytnyi-z-batonchykamy", "Блакитний з батончиками", "kids b", "C M", None, ["Шоколадні батончики"], False),
    (2056549, 450, "novorichnyi-z-lodianykamy", "Новорічний з льодяниками", "ny kids", "C", None, ["Цукерки", "Льодяники-палички", "Новорічні кульки"], False),
    (2056550, 600, "milka-i-picnic", "Milka і Picnic", "kids b", "C W", None, ["Milka", "Picnic", "Шоколадні цукерки"], False),
    (2056551, 350, "rozhevyi-z-tsukerkamy", "Рожевий з цукерками", "kids b", "C", None, ["Цукерки"], False),
    (2056552, 350, "korobochka-sweet", "Коробочка «Sweet»", "b m", "C W T", None, ["Цукерки «Шарм»", "Декоративна троянда", "Коробочка"], False),
    (2056556, 500, "chervono-chornyi-z-tsukerkamy", "Червоно-чорний з цукерками", "b", "C W", None, ["Цукерки", "Декоративні троянди"], False),
    (2056570, 350, "pomaranchevyi-buket", "Помаранчевий букет", "kids b", "C", None, ["Цукерки", "Помаранчева плівка в горошок"], False),
    (2056571, 400, "sharm-u-korobtsi-love", "«Шарм» у коробці «Love»", "b m", "C W", None, ["Цукерки «Шарм»", "Декоративні троянди", "Коробка"], False),
    (2056572, 450, "raffaello-v-rozhevii-korobtsi", "Raffaello в рожевій коробці", "b m", "C W", None, ["Raffaello", "Декоративні троянди", "Коробка"], False),
    (2056576, 200, "z-vedmedykamy", "З ведмедиками", "kids v", "C W", None, ["Іграшкові ведмедики", "Декоративні троянди", "Цукерки"], False),
    (2056577, 450, "milky-way-u-sitsi", "Milky Way у сітці", "kids b", "C M", None, ["Milky Way", "Шоколадні батончики"], False),
    # До жіночих
    (2056581, 600, "sumochka-z-zaichykom", "Сумочка з плетеним зайчиком", "b kids", "W C", None, ["Цукерки", "В'язаний зайчик", "Подарункова сумочка"], False),
    (2056582, 500, "synio-zhovtyi-z-pepsi", "Синьо-жовтий з Pepsi", "b", "C M W", None, ["Pepsi", "Цукерки"], False),
    (2056583, 550, "skrynka-z-dnem-narodzhennia", "Скринька «З днем народження»", "b", "W M K", None, ["Цукерки", "Дерев'яна скринька", "Топер «З днем народження»"], False),
]

SIZES = [(500, "S"), (900, "M"), (1500, "L")]


def size_of(price: int) -> str:
    return next((s for limit, s in SIZES if price < limit), "XL")


def crop_raw(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGB")
    scale = max(W / img.width, H / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    x, y = (img.width - W) // 2, (img.height - H) // 2
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.crop((x, y, x + W, y + H)).save(dst, "JPEG", quality=88, optimize=True)


def compose(src: Path, dst: Path) -> None:
    cut = Image.open(src).convert("RGBA")
    obj = cut.crop(cut.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox())
    scale = min(W * (1 - 2 * PAD) / obj.width, H * (1 - 2 * PAD) / obj.height)
    obj = obj.resize((round(obj.width * scale), round(obj.height * scale)), Image.LANCZOS)
    x, y = (W - obj.width) // 2, (H - obj.height) // 2
    bg = Image.new("RGBA", (W, H), (*ROSE, 255))
    # Тінь як у process_images.py, щоб стиль збігався
    shadow = Image.new("RGBA", obj.size, (60, 40, 30, 0))
    shadow.putalpha(obj.getchannel("A").point(lambda a: int(a * 0.28)))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.alpha_composite(shadow, (x + 12, y + 22))
    bg.alpha_composite(layer.filter(ImageFilter.GaussianBlur(28)))
    bg.alpha_composite(obj, (x, y))
    dst.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(dst, "JPEG", quality=88, optimize=True)


def main() -> None:
    index = {m["mid"]: m for m in json.loads((ROOT / "photos/telegram/index.json").read_text("utf-8"))}
    slugs = set()
    for n, (mid, price, slug, title, occ, rec, alcohol, comp, featured) in enumerate(B, start=1):
        assert slug not in slugs, slug
        slugs.add(slug)
        images = []
        for i, f in enumerate(index[mid]["files"], start=1):
            if f[:-4] in RAW:
                crop_raw(ROOT / "photos/telegram" / f, IMG / str(n) / f"{i}.jpg")
            else:
                compose(SRC / f.replace(".jpg", ".webp"), IMG / str(n) / f"{i}.jpg")
            images.append(f"{n}/{i}")
        data = {
            "id": n,
            "title": title,
            "date": DATE,
            "price": price,
            "images": images,
            "occasions": [OCC[o] for o in occ.split()],
            "recipients": [REC[r] for r in rec.split()],
            "alcohol": alcohol,
            "shippable": False,
            "size": size_of(price),
            "composition": comp,
            "featured": featured,
        }
        DATA.mkdir(exist_ok=True)
        (DATA / f"{slug}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8", newline="\n")
    print(f"{len(B)} букетів")


if __name__ == "__main__":
    main()
