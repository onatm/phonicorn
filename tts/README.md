## TTS

Generates one MP3 per word from `../data/words.json` using Google Cloud Text-to-Speech.

### Prepare

```bash
gcloud auth application-default login
gcloud services enable texttospeech.googleapis.com --project "$(gcloud config get-value project)"
uv sync
```

### Run

```bash
uv run main.py
```

### Output

- Files are written to `tts/output/`.
- Copy them into `../data/sounds/` for the web app:

```bash
cp output/*.mp3 ../data/sounds/
```

### Notes

- The script speaks the `word` field.
- The `ipa` field is used through SSML phoneme tags.
- Existing MP3 files in `tts/output/` are skipped.
