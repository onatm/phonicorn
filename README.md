# Phonicorn

A self-hosted phonics flashcard app for helping kids practice word sounds, pronunciations, and decoding patterns.

## What It Is

- A single-page React app for browsing phonics cards.
- Card data comes from `data/words.json`.
- Audio comes from `data/sounds/*.mp3`.
- The app shows the word, IPA, sound parts, description, example, and whether a word is made up.

## How It Works

- The web app lives in `web/` and runs with Bun.
- The app fetches `data/words.json` and plays audio from `data/sounds/`.
- The TTS script lives in `tts/` and uses Google Cloud Text-to-Speech to generate one MP3 per word.
- The TTS script currently writes audio to `tts/output/`, so generated files must be copied into `data/sounds/` for the app to use them.

## Prepare

### Web App

```bash
cd web
bun install
```

### TTS

You need Google Cloud CLI, a selected project, and application default credentials.

```bash
gcloud auth application-default login
gcloud services enable texttospeech.googleapis.com --project "$(gcloud config get-value project)"
cd tts
uv sync
```

## Create Audio

Generate MP3 files from `data/words.json`:

```bash
cd tts
uv run main.py
```

Generated files are written to `tts/output/`.

Copy them into `data/sounds/`:

```bash
cp tts/output/*.mp3 data/sounds/
```

Notes:

- Existing files in `tts/output/` are skipped by the script.
- The spoken output uses the `word` and `ipa` fields.

## Run

Start the web app:

```bash
cd web
bun run dev
```

Then open the local Vite URL shown in the terminal.
