import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

const TRACK = {
  src: '/audio/danza-kuduro.mp3',
  title: 'Danza Kuduro',
  artist: 'Lucenzo · Don Omar',
}

/**
 * Garage-only soundtrack widget (top-right).
 * Autoplays when possible; click toggles pause/play.
 */
function GarageMusic({ suspended = false }) {
  const audioRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (reducedMotion) return undefined

    const audio = new Audio(TRACK.src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.6
    audioRef.current = audio

    const markPlaying = () => setPlaying(true)
    const markPaused = () => setPlaying(false)
    const markMissing = () => setMissing(true)

    audio.addEventListener('playing', markPlaying)
    audio.addEventListener('pause', markPaused)
    audio.addEventListener('ended', markPaused)
    audio.addEventListener('error', markMissing)

    const armGestureUnmute = () => {
      const unmute = () => {
        audio.muted = false
        setPlaying(!audio.paused)
      }
      window.addEventListener('pointerdown', unmute, { once: true, passive: true })
      window.addEventListener('keydown', unmute, { once: true })
      window.addEventListener('touchstart', unmute, { once: true, passive: true })
    }

    const tryPlay = () => {
      audio.muted = false
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          audio.muted = true
          audio
            .play()
            .then(() => {
              setPlaying(true)
              armGestureUnmute()
            })
            .catch(() => setPlaying(false))
        })
    }

    audio.addEventListener('loadeddata', tryPlay)
    tryPlay()

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        audio.pause()
      } else {
        tryPlay()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      audio.pause()
      audio.removeEventListener('playing', markPlaying)
      audio.removeEventListener('pause', markPaused)
      audio.removeEventListener('ended', markPaused)
      audio.removeEventListener('error', markMissing)
      audio.removeEventListener('loadeddata', tryPlay)
      audio.src = ''
      audioRef.current = null
    }
  }, [reducedMotion])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || reducedMotion || missing) return

    if (suspended) {
      audio.pause()
      setPlaying(false)
      return
    }

    audio.muted = false
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [suspended, reducedMotion, missing])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || missing || suspended) return

    if (audio.paused) {
      audio.muted = false
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  if (reducedMotion) return null

  return (
    <motion.div
      className="pointer-events-auto fixed right-4 top-[max(4.75rem,calc(env(safe-area-inset-top)+3.25rem))] z-50 sm:right-6"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.45, ease: EASE }}
    >
      <button
        type="button"
        data-cursor-hover="true"
        disabled={missing || suspended}
        onClick={toggle}
        className="group flex cursor-pointer items-center gap-3 border border-white/70 bg-black/85 px-3 py-2 transition-colors duration-200 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--garage-gold)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-pressed={playing}
        aria-label={
          missing
            ? 'Music file missing'
            : suspended
              ? 'Garage music paused in F1 section'
            : playing
              ? 'Pause Danza Kuduro'
              : 'Play Danza Kuduro'
        }
      >
        <span className="relative flex h-9 w-9 items-center justify-center" aria-hidden>
          <span className="garage-music-bars flex h-5 items-end gap-[3px]">
            <span
              className={`w-[3px] ${playing ? 'bg-[#E87722]' : 'bg-white/35'}`}
              style={{ height: '40%' }}
            />
            <span
              className={`w-[3px] ${playing ? 'bg-[#E87722]' : 'bg-white/35'}`}
              style={{ height: '70%' }}
            />
            <span
              className={`w-[3px] ${playing ? 'bg-[#E87722]' : 'bg-white/35'}`}
              style={{ height: '100%' }}
            />
          </span>
          <span className="absolute bottom-0.5 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </span>

        <span className="min-w-0 pr-1 text-left">
          <span className="block font-studio text-[9px] uppercase tracking-[0.22em] text-white/45">
            {missing ? 'Track missing' : suspended ? 'Paused for F1' : 'Now playing'}
          </span>
          <span className="mt-0.5 block truncate font-heading text-[13px] font-semibold text-white">
            {TRACK.title}
          </span>
          <span className="block truncate font-studio text-[10px] text-white/45">
            {TRACK.artist}
          </span>
        </span>
      </button>
    </motion.div>
  )
}

export default GarageMusic
