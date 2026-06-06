import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { PhonicsCard } from './components/PhonicsCard'
import type { WordEntry } from './lib/types'

const CARD_THEMES = [
  {
    accentSoft: 'rgba(230, 211, 111, 0.25)',
    accentBorder: '#ead97b',
    badge: 'rgba(230, 211, 111, 0.24)',
  },
  {
    accentSoft: 'rgba(181, 154, 216, 0.22)',
    accentBorder: '#c3b0e0',
    badge: 'rgba(181, 154, 216, 0.2)',
  },
  {
    accentSoft: 'rgba(125, 183, 222, 0.2)',
    accentBorder: '#91c3e4',
    badge: 'rgba(125, 183, 222, 0.18)',
  },
  {
    accentSoft: 'rgba(142, 196, 141, 0.2)',
    accentBorder: '#9fcea0',
    badge: 'rgba(142, 196, 141, 0.18)',
  },
] as const

function SideButton({
  label,
  onClick,
  direction,
}: {
  label: string
  onClick: () => void
  direction: 'previous' | 'next'
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-[0_12px_30px_rgba(103,67,46,0.12)] transition hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 sm:h-16 sm:w-16"
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
    </button>
  )
}

function App() {
  const [words, setWords] = useState<WordEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let isActive = true

    const loadWords = async () => {
      try {
        const response = await fetch('/words.json')

        if (!response.ok) {
          throw new Error(`Failed to load words (${response.status})`)
        }

        const payload = (await response.json()) as WordEntry[]

        if (!isActive) {
          return
        }

        setWords(payload)
        setError(null)
      } catch (caughtError) {
        if (!isActive) {
          return
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load words.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadWords()

    return () => {
      isActive = false
    }
  }, [])

  const stopAudio = useEffectEvent(() => {
    const audio = audioRef.current

    if (!audio) {
      setIsPlaying(false)
      return
    }

    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
  })

  const playCurrentWord = useEffectEvent(async () => {
    const entry = words[currentIndex]
    const audio = audioRef.current

    if (!entry || !audio) {
      return
    }

    stopAudio()

    const source = `/sounds/${encodeURIComponent(entry.word)}.mp3`

    if (audio.src !== new URL(source, window.location.origin).toString()) {
      audio.src = source
      audio.load()
    }

    try {
      setError(null)
      setIsPlaying(true)
      await audio.play()
    } catch (caughtError) {
      setIsPlaying(false)
      const message = caughtError instanceof Error ? caughtError.message : 'Playback was blocked.'
      setError(`Unable to play audio for ${entry.word}: ${message}`)
    }
  })

  const goToPrevious = useEffectEvent(() => {
    if (words.length === 0) {
      return
    }

    stopAudio()
    setError(null)
    setCurrentIndex((index) => (index - 1 + words.length) % words.length)
  })

  const goToNext = useEffectEvent(() => {
    if (words.length === 0) {
      return
    }

    stopAudio()
    setError(null)
    setCurrentIndex((index) => (index + 1) % words.length)
  })

  const goToRandom = useEffectEvent(() => {
    if (words.length <= 1) {
      return
    }

    stopAudio()
    setError(null)
    setCurrentIndex((index) => {
      const offset = Math.floor(Math.random() * (words.length - 1)) + 1
      return (index + offset) % words.length
    })
  })

  const goToWord = useEffectEvent((index: number) => {
    stopAudio()
    setError(null)
    setCurrentIndex(index)
  })

  useEffect(() => {
    return () => {
      const audio = audioRef.current

      if (!audio) {
        return
      }

      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }

      if (event.key === ' ' || event.key === 'Enter') {
        const target = event.target
        if (target instanceof HTMLElement && ['BUTTON', 'INPUT', 'TEXTAREA'].includes(target.tagName)) {
          return
        }

        event.preventDefault()
        void playCurrentWord()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [goToNext, goToPrevious, playCurrentWord])

  const currentWord = words[currentIndex]
  const theme = CARD_THEMES[currentIndex % CARD_THEMES.length]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7)_0%,_rgba(255,255,255,0)_52%),linear-gradient(180deg,_#f5ebe3_0%,_#eedfd3_100%)] px-4 py-6 text-stone-800 sm:px-6 sm:py-10">
      <audio
        ref={audioRef}
        preload="auto"
        className="hidden"
        onEnded={() => {
          setIsPlaying(false)
        }}
        onError={(event) => {
          const mediaError = event.currentTarget.error
          const reason = mediaError ? `Media error ${mediaError.code}` : 'Unknown media error'

          setIsPlaying(false)
          setError(currentWord ? `Unable to play audio for ${currentWord.word}: ${reason}` : reason)
        }}
      />
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-center gap-6 sm:min-h-[calc(100vh-5rem)] sm:gap-8">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Phonicorn</p>
        </header>

        {isLoading ? (
          <section className="rounded-[2rem] border border-white/60 bg-white/75 px-6 py-16 text-center shadow-[0_24px_70px_rgba(103,67,46,0.12)] backdrop-blur-sm">
            <p className="text-lg text-stone-600">Loading phonics cards...</p>
          </section>
        ) : error && words.length === 0 ? (
          <section className="rounded-[2rem] border border-rose-200 bg-white/80 px-6 py-16 text-center shadow-[0_24px_70px_rgba(103,67,46,0.12)] backdrop-blur-sm">
            <p className="text-lg text-rose-700">{error}</p>
          </section>
        ) : currentWord ? (
          <>
            {error ? (
              <div className="mx-auto w-full max-w-3xl rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
                {error}
              </div>
            ) : null}

            <section className="mx-auto w-full max-w-5xl">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
                <SideButton label="Previous card" onClick={goToPrevious} direction="previous" />

                <div className="w-full max-w-3xl">
                  <PhonicsCard
                    key={currentWord.word}
                    entry={currentWord}
                    theme={theme}
                    isPlaying={isPlaying}
                    onPlay={() => {
                      void playCurrentWord()
                    }}
                  />
                </div>

                <SideButton label="Next card" onClick={goToNext} direction="next" />
              </div>

              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row sm:gap-4">
                <p className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm tracking-[0.2em] text-stone-500 shadow-[0_12px_30px_rgba(103,67,46,0.08)] uppercase">
                  {currentIndex + 1} / {words.length}
                </p>

                <button
                  type="button"
                  onClick={goToRandom}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm tracking-[0.18em] text-stone-700 uppercase shadow-[0_12px_30px_rgba(103,67,46,0.08)] transition hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                >
                  <Shuffle className="h-4 w-4" />
                  Shuffle
                </button>
              </div>

              <section className="mt-8 rounded-[2rem] border border-white/60 bg-white/75 px-4 py-5 shadow-[0_24px_70px_rgba(103,67,46,0.1)] backdrop-blur-sm sm:mt-10 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
                      All words
                    </p>
                    <p className="mt-1 text-sm text-stone-600 sm:text-base">
                      Jump straight to any card.
                    </p>
                  </div>
                  <p className="text-sm tracking-[0.18em] text-stone-400 uppercase">{words.length} total</p>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {words.map((word, index) => {
                    const isActive = index === currentIndex

                    return (
                      <button
                        key={word.word}
                        type="button"
                        onClick={() => {
                          goToWord(index)
                        }}
                        aria-pressed={isActive}
                        className="rounded-full border px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 sm:text-base"
                        style={{
                          borderColor: isActive ? theme.accentBorder : '#e7e5e4',
                          backgroundColor: isActive ? theme.badge : 'rgba(255,255,255,0.85)',
                          color: isActive ? '#1c1917' : '#57534e',
                          boxShadow: isActive ? '0 12px 30px rgba(103,67,46,0.08)' : 'none',
                        }}
                      >
                        {word.word}
                      </button>
                    )
                  })}
                </div>
              </section>
            </section>
          </>
        ) : (
          <section className="rounded-[2rem] border border-white/60 bg-white/75 px-6 py-16 text-center shadow-[0_24px_70px_rgba(103,67,46,0.12)] backdrop-blur-sm">
            <p className="text-lg text-stone-600">No phonics cards found.</p>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
