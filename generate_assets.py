"""
Script untuk membuat placeholder foto aesthetic dan file musik.
Jalankan: python generate_assets.py
Ganti foto di folder /images dengan foto asli kalian.
Ganti music/song.mp3 dengan lagu romantis pilihan kalian.
"""

import os
import struct
import math
import random
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE, "images")
MUSIC_DIR = os.path.join(BASE, "music")

CAPTIONS = [
    "Momen yang tak terlupakan",
    "Senyummu yang manis",
    "Petualangan bersama",
    "Hari yang sempurna",
    "Tawa kita berdua",
    "Kehangatan bersama",
    "Cinta dalam setiap detik",
    "Selamanya bersamamu",
]

COLORS = [
    (245, 230, 211),
    (255, 248, 240),
    (234, 219, 200),
    (212, 196, 176),
    (201, 169, 110),
    (232, 213, 196),
    (228, 210, 190),
    (240, 225, 205),
]


def create_placeholder_images():
    os.makedirs(IMAGES_DIR, exist_ok=True)

    for i in range(1, 9):
        size = 800
        base_color = COLORS[i - 1]
        img = Image.new("RGB", (size, size), base_color)
        draw = ImageDraw.Draw(img)

        # Soft gradient circles
        for _ in range(6):
            cx = random.randint(100, 700)
            cy = random.randint(100, 700)
            r = random.randint(80, 200)
            overlay = Image.new("RGB", (size, size), base_color)
            od = ImageDraw.Draw(overlay)
            accent = (
                min(255, base_color[0] + 20),
                min(255, base_color[1] + 15),
                min(255, base_color[2] + 10),
            )
            od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent)
            img = Image.blend(img, overlay, 0.3)

        draw = ImageDraw.Draw(img)

        # Decorative frame
        margin = 40
        draw.rectangle(
            [margin, margin, size - margin, size - margin],
            outline=(201, 169, 110),
            width=2,
        )

        # Heart icon center
        heart_color = (201, 169, 110)
        cx, cy = size // 2, size // 2 - 20
        draw.ellipse([cx - 30, cy - 20, cx, cy + 10], fill=heart_color)
        draw.ellipse([cx, cy - 20, cx + 30, cy + 10], fill=heart_color)
        draw.polygon([(cx - 30, cy), (cx + 30, cy), (cx, cy + 45)], fill=heart_color)

        # Label text
        label = f"Photo {i}"
        sub = CAPTIONS[i - 1]
        try:
            font_lg = ImageFont.truetype("arial.ttf", 28)
            font_sm = ImageFont.truetype("arial.ttf", 18)
        except OSError:
            font_lg = ImageFont.load_default()
            font_sm = ImageFont.load_default()

        draw.text((size // 2, size // 2 + 60), label, fill=(107, 91, 79), anchor="mm", font=font_lg)
        draw.text((size // 2, size // 2 + 95), sub, fill=(139, 123, 111), anchor="mm", font=font_sm)
        draw.text(
            (size // 2, size - 60),
            "Ganti dengan foto asli",
            fill=(201, 169, 110),
            anchor="mm",
            font=font_sm,
        )

        path = os.path.join(IMAGES_DIR, f"photo{i}.jpg")
        img.save(path, "JPEG", quality=90)
        print(f"Created: {path}")


def create_silent_mp3():
    """Minimal valid MP3 placeholder — ganti dengan lagu romantis asli."""
    os.makedirs(MUSIC_DIR, exist_ok=True)
    path = os.path.join(MUSIC_DIR, "song.mp3")

    # Create a very short silent WAV and note user should replace
    # For MP3 we'll write minimal bytes - actually better to use wave for placeholder
    # User will replace with real song - create a tiny valid approach

    # Generate simple tone WAV as fallback, user replaces song.mp3
    import wave

    wav_path = os.path.join(MUSIC_DIR, "song_placeholder.wav")
    sample_rate = 44100
    duration = 3
    frequency = 440

    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for t in range(int(sample_rate * duration)):
            # Soft romantic sine wave at low volume
            val = int(8000 * math.sin(2 * math.pi * frequency * t / sample_rate) * 0.3)
            wf.writeframes(struct.pack("<h", val))

    # Copy wav info - user needs mp3. Try ffmpeg, else create readme
    try:
        import subprocess
        subprocess.run(
            ["ffmpeg", "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "5", path],
            check=True,
            capture_output=True,
        )
        os.remove(wav_path)
        print(f"Created: {path} (soft tone placeholder — ganti dengan lagu romantis)")
    except (FileNotFoundError, subprocess.CalledProcessError):
        # Write instruction file if no ffmpeg
        readme = os.path.join(MUSIC_DIR, "README.txt")
        with open(readme, "w", encoding="utf-8") as f:
            f.write(
                "Letakkan file musik romantis di sini dengan nama: song.mp3\n"
                "Contoh: lagu favorit kalian berdua.\n"
                f"Placeholder WAV tersedia di: song_placeholder.wav\n"
            )
        print(f"FFmpeg not found. Created {wav_path} and {readme}")
        print("Please add music/song.mp3 manually or install ffmpeg and re-run.")


if __name__ == "__main__":
    create_placeholder_images()
    create_silent_mp3()
    print("\nDone! Replace images/photo*.jpg with your real photos.")
    print("Replace music/song.mp3 with your romantic song.")
