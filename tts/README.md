## TTS

Generates one MP3 per word from `../data/words.json` using Google Cloud Text-to-Speech.

### Setup

```bash
gcloud auth application-default login
gcloud services enable texttospeech.googleapis.com --project "$(gcloud config get-value project)"
uv sync
```

### Run

```bash
uv run main.py
```

Audio files are written to `tts/output/`.

Notes:

- Only the `word` field is spoken.
- The `ipa` field is used through SSML phoneme tags.
- Existing MP3 files are skipped.
