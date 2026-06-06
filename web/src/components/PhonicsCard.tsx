import { Volume2 } from 'lucide-react'
import type { WordEntry } from '../lib/types'

type CardTheme = {
  accentSoft: string
  accentBorder: string
  badge: string
}

type PhonicsCardProps = {
  entry: WordEntry
  theme: CardTheme
  isPlaying: boolean
  onPlay: () => void
}

export function PhonicsCard({ entry, theme, isPlaying, onPlay }: PhonicsCardProps) {
  const soundParts = entry.sound.split('-')
  const isMadeUp = !entry.description && !entry.example

  return (
    <article className="card-enter relative overflow-hidden rounded-[2rem] bg-white px-5 py-5 shadow-[0_24px_70px_rgba(103,67,46,0.14)] sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          background: `radial-gradient(circle at top, ${theme.accentSoft} 0%, rgba(255,255,255,0) 62%)`,
        }}
      />

      <div
        className="relative rounded-[1.6rem] border-2 bg-white/92 px-5 py-6 sm:px-7 sm:py-8"
        style={{ borderColor: theme.accentBorder }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
              Phonics card
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-stone-700"
                style={{ backgroundColor: theme.badge }}
              >
                {isMadeUp ? 'Made-up word' : 'Real word'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onPlay}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-[0_10px_25px_rgba(103,67,46,0.12)] transition hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
            aria-label={isPlaying ? `Replay ${entry.word}` : `Play ${entry.word}`}
            title={`Play ${entry.word}`}
          >
            <Volume2 className={isPlaying ? 'h-5 w-5 animate-pulse' : 'h-5 w-5'} />
          </button>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[clamp(3rem,9vw,5.8rem)] leading-[0.95] tracking-[-0.03em] text-stone-950">
            {entry.word}
          </p>
          <p className="mt-4 text-lg tracking-[0.16em] text-stone-500 sm:text-xl">/{entry.ipa}/</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10">
          {soundParts.map((part, index) => (
            <span
              key={`${entry.word}-${part}-${index}`}
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm tracking-[0.08em] text-stone-700 sm:text-base"
            >
              {part}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5">
          {/* {entry.description ? (
            <section className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/80 px-4 py-4 text-left sm:px-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
                Description
              </p>
              <p className="mt-2 text-base leading-7 text-stone-700 sm:text-lg">{entry.description}</p>
            </section>
          ) : null} */}

          {entry.example ? (
            <section className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/80 px-4 py-4 text-left sm:px-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
                Example
              </p>
              <p className="mt-2 text-base leading-7 text-stone-700 sm:text-lg">{entry.example}</p>
            </section>
          ) : null}

          {isMadeUp ? (
            <section className="rounded-[1.35rem] border border-dashed border-stone-300 bg-stone-50/60 px-4 py-4 text-left sm:px-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
                Practice note
              </p>
              <p className="mt-2 text-base leading-7 text-stone-700 sm:text-lg">
                This is a made-up word for phonics practice, so it does not have a description or an example sentence.
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  )
}
