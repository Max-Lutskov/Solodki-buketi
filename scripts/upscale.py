"""
Real-ESRGAN 4x для оригіналів з Telegram (800 px) перед прибиранням фону.

Апскейл до process_images.py, а не після: на оригіналі модель чистить JPEG-артефакти й дає чіткий текст
на обгортках, а вирізаний букет потім має чистий край без сірого ореолу. Апскейл готового 1.jpg майже нічого
не дає — сайт однаково показує до 1600 px. Ціна — «пластик»: тканина, плюш і вишивка втрачають фактуру,
тому такі фото лишаємо як є (SKIP).

realesrgan-ncnn-vulkan (github.com/xinntao/Real-ESRGAN, v0.2.5.0) лежить у photos/tools/realesrgan/, працює на GPU.

  photos/.venv/Scripts/python scripts/upscale.py
  photos/.venv/Scripts/python scripts/process_images.py photos/telegram-up photos/redo/up --model birefnet-general-lite
  + той самий прогін з has_black_background = False у photos/redo/up-black (див. LITE_ON_BLACK у retouch.py)
"""

import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "photos/telegram"
OUT = ROOT / "photos/telegram-up"
EXE = ROOT / "photos/tools/realesrgan/realesrgan-ncnn-vulkan.exe"

# Тканина, плюш, вишивка, папір — модель робить їх гладкими, як пластик.
# А ще ті, що в retouch.py беруться з isnet: isnet рахували на оригіналі, з апскейлом він не зійдеться
SKIP = {
    "2056568_1",  # шкарпетки
    "2056584_1", "2056584_2",  # зайчик на мотоциклі з підгузків
    "2056553_2", "2056559_1", "2056573_1", "2056576_1", "2056581_1",  # плюшеві й в'язані іграшки
    "2056487_1", "2056514_1", "2056531_1",  # вишиті рушники
    "2056506_1",  # туалетний папір
    "2056477_1", "2056523_1", "2056574_1",  # isnet
    # Після апскейлу lite вирізає гірше: клапті плівки по краях; шматок фону з трояндами; дірка в плівці
    "2056457_2", "2056479_1", "2056480_1",
}


def main() -> None:
    names = [p for p in sorted(SRC.glob("*.jpg")) if p.stem not in SKIP and not (OUT / f"{p.stem}.png").exists()]
    if not names:
        print("Нічого нового")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    # Exe вміє обробити папку за один запуск (модель вантажиться раз) — збираємо потрібні файли в тимчасову
    with tempfile.TemporaryDirectory() as tmp:
        for p in names:
            shutil.copy(p, tmp)
        subprocess.run([str(EXE), "-i", tmp, "-o", str(OUT), "-n", "realesrgan-x4plus", "-f", "png"], check=True)
    print(f"Готово: {len(names)} фото → {OUT}")


if __name__ == "__main__":
    main()
