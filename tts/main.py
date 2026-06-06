from __future__ import annotations

import html
import json
import time
from pathlib import Path

from google.cloud import texttospeech


LANGUAGE_CODE = "en-GB"
VOICE_NAME = "en-GB-Neural2-A"
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "words.json"
OUTPUT_DIR = Path(__file__).resolve().parent / "output"


def build_ssml(word: str, ipa: str) -> str:
    return (
        f'<speak><phoneme alphabet="ipa" ph="{html.escape(ipa, quote=True)}">'
        f"{html.escape(word)}</phoneme></speak>"
    )


def main() -> int:
    words = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(exist_ok=True)

    client = texttospeech.TextToSpeechClient()
    voice = texttospeech.VoiceSelectionParams(
        language_code=LANGUAGE_CODE,
        name=VOICE_NAME,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
    )

    failures: list[str] = []

    for index, entry in enumerate(words, start=1):
        word = entry.get("word")
        ipa = entry.get("ipa")

        if not word or not ipa:
            failures.append(f"[{index}] missing word or ipa")
            continue

        output_path = OUTPUT_DIR / f"{word}.mp3"
        if output_path.exists():
            print(f"[{index}/{len(words)}] skipped {output_path.name}")
            continue

        try:
            response = client.synthesize_speech(
                input=texttospeech.SynthesisInput(ssml=build_ssml(word, ipa)),
                voice=voice,
                audio_config=audio_config,
            )
            output_path.write_bytes(response.audio_content)
            print(f"[{index}/{len(words)}] wrote {output_path.name}")
        except Exception as exc:
            failures.append(f"[{index}] {word}: {exc}")
        finally:
            time.sleep(0.1)

    if failures:
        print("Failed entries:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
