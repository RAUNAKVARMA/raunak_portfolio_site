import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { favoriteCars } from '../../../data/favoriteCars'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import { isCarWarmed, prefetchDracoDecoder, warmCar, warmCars } from './carGltf'

const GOLD = '#CA8A04'
const EASE = [0.16, 1, 0.3, 1]
/** Instant when cached; otherwise open as soon as first bytes are ready. */
const ENTRY_MIN_MS = 0
const ENTRY_MAX_MS = 520
const DOOR_OUT_MS = 40
const ENTRY_MIN_CACHED_MS = 0

/**
 * Fullscreen garage-door opening sequence.
 * Locks scroll, warms first car with real progress, then reveals the page.
 */
function GarageEntryOverlay({ onComplete }) {
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis()
  const doneRef = useRef(false)
  const carReadyRef = useRef(false)
  const [phase, setPhase] = useState('boot')
  const [rosterIndex, setRosterIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(true)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    document.body.style.overflow = ''
    lenisRef?.current?.start?.()
    onComplete?.()
  }

  const roster = useMemo(
    () =>
      favoriteCars.map((car, i) => ({
        id: car.id,
        label: car.short,
        year: car.year,
        n: String(i + 1).padStart(2, '0'),
        accent: car.accent,
      })),
    [],
  )

  useEffect(() => {
    if (reducedMotion) {
      setOpen(false)
      finish()
      return undefined
    }

    const lenis = lenisRef?.current
    lenis?.stop?.()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    prefetchDracoDecoder()

    const firstUrl = favoriteCars[0]?.modelUrl
    const alreadyWarm = isCarWarmed(firstUrl)
    if (alreadyWarm) carReadyRef.current = true

    let cancelled = false
    let loadProgress = alreadyWarm ? 1 : 0
    let cinemaProgress = 0

    const syncProgress = () => {
      // Prefer real asset progress; blend a light cinematic floor so the bar never feels stuck.
      const next = Math.max(cinemaProgress * 0.18, loadProgress)
      setProgress(next)
    }

    if (alreadyWarm) {
      setProgress(1)
      setPhase('open')
      setOpen(false)
      // finish via exit; if exit skipped, finish next tick
      window.queueMicrotask?.(() => finish())
      window.setTimeout(() => finish(), 0)
      return () => {
        cancelled = true
        document.body.style.overflow = prevOverflow
        if (!doneRef.current) lenis?.start?.()
      }
    }

    // First car is critical path; rest warm in parallel immediately (don't wait for first).
    warmCar(firstUrl, (p) => {
      if (cancelled) return
      loadProgress = p
      if (p >= 0.7) carReadyRef.current = true
      syncProgress()
    }).then(() => {
      if (cancelled) return
      carReadyRef.current = true
      loadProgress = 1
      syncProgress()
    })

    warmCars(
      favoriteCars.slice(1).map((c) => c.modelUrl),
      { concurrency: 5 },
    )

    const boot = window.setTimeout(() => setPhase('brand'), 20)
    const rosterT = window.setTimeout(() => setPhase('roster'), 70)
    const openDoor = window.setTimeout(() => setPhase('open'), 140)

    const started = performance.now()
    let raf = 0
    let closed = false
    const minMs = ENTRY_MIN_MS

    const tryClose = (now) => {
      if (closed || cancelled) return
      const elapsed = now - started
      const ready = carReadyRef.current || loadProgress >= 0.7
      if ((ready && elapsed >= minMs) || elapsed >= ENTRY_MAX_MS) {
        closed = true
        setProgress(1)
        setPhase('open')
        window.setTimeout(() => {
          if (!cancelled) setOpen(false)
        }, DOOR_OUT_MS)
      }
    }

    const tick = (now) => {
      if (cancelled) return
      cinemaProgress = Math.min(1, (now - started) / ENTRY_MAX_MS)
      syncProgress()
      tryClose(now)
      if (!closed) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (boot) window.clearTimeout(boot)
      if (rosterT) window.clearTimeout(rosterT)
      window.clearTimeout(openDoor)
      cancelAnimationFrame(raf)
      document.body.style.overflow = prevOverflow
      if (!doneRef.current) lenis?.start?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, lenisRef])

  useEffect(() => {
    if (phase !== 'roster') return undefined
    const id = window.setInterval(() => {
      setRosterIndex((i) => (i + 1) % roster.length)
    }, 420)
    return () => window.clearInterval(id)
  }, [phase, roster.length])

  const skip = () => {
    setPhase('open')
    setProgress(1)
    window.setTimeout(() => setOpen(false), 80)
  }

  const active = roster[rosterIndex] ?? roster[0]

  return (
    <AnimatePresence onExitComplete={finish}>
      {open ? (
        <motion.div
          className="garage-entry fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#030303] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label="Entering the garage"
        >
          <div className="garage-entry-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="garage-entry-vignette pointer-events-none absolute inset-0" aria-hidden />
          <div className="garage-entry-grain pointer-events-none absolute inset-0 opacity-40" aria-hidden />

          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left bg-[color:var(--garage-gold)]"
            style={{ ['--garage-gold']: GOLD }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === 'boot' ? 0 : 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            aria-hidden
          />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5">
            <motion.p
              className="font-studio text-[10px] uppercase tracking-[0.42em] text-[color:var(--garage-gold)] sm:text-[11px]"
              style={{ ['--garage-gold']: GOLD }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: phase === 'boot' ? 0 : 1,
                y: phase === 'boot' ? 10 : 0,
              }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              Interests — Cars
            </motion.p>

            <div className="relative mt-5 overflow-hidden">
              <motion.h1
                className="garage-entry-title select-none font-display text-[clamp(3.5rem,16vw,9rem)] font-bold uppercase leading-none tracking-[-0.07em]"
                initial={{ y: '110%', opacity: 0 }}
                animate={{
                  y: phase === 'boot' ? '110%' : '0%',
                  opacity: phase === 'boot' ? 0 : 1,
                }}
                transition={{ duration: 0.75, ease: EASE, delay: 0.04 }}
              >
                The Garage
              </motion.h1>
            </div>

            <motion.div
              className="garage-entry-horizon mt-6 h-px w-[min(72vw,420px)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: phase === 'boot' ? 0 : 1,
                opacity: phase === 'boot' ? 0 : 1,
              }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              aria-hidden
            />

            <div className="mt-10 flex h-14 w-full max-w-md items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === 'roster' || phase === 'open' ? (
                  <motion.div
                    key={active?.id}
                    className="flex items-baseline gap-4"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <span
                      className="font-studio text-[11px] tracking-[0.28em]"
                      style={{ color: active?.accent || GOLD }}
                    >
                      {active?.n}
                    </span>
                    <span className="font-heading text-[clamp(1.35rem,4vw,2rem)] font-bold uppercase tracking-tight text-white">
                      {active?.label}
                    </span>
                    <span className="font-studio text-[11px] tracking-[0.2em] text-white/35">
                      {active?.year}
                    </span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="warming"
                    className="font-studio text-[10px] uppercase tracking-[0.32em] text-white/35"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Warming machines
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 w-full max-w-[280px]">
              <div className="h-[2px] w-full overflow-hidden bg-white/10">
                <motion.div
                  className="h-full origin-left bg-[color:var(--garage-gold)]"
                  style={{ ['--garage-gold']: GOLD, scaleX: progress }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between font-studio text-[9px] uppercase tracking-[0.24em] text-white/35">
                <span>{progress >= 0.97 ? 'Ready' : 'Loading first car'}</span>
                <span>{String(Math.round(progress * 100)).padStart(2, '0')}%</span>
              </div>
            </div>
          </div>

          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 origin-top bg-[#050505]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: phase === 'open' ? 0 : 1 }}
            transition={{ duration: 0.85, ease: EASE }}
            aria-hidden
          >
            <div className="garage-entry-shutter absolute inset-0" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1/2 origin-bottom bg-[#050505]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: phase === 'open' ? 0 : 1 }}
            transition={{ duration: 0.85, ease: EASE }}
            aria-hidden
          >
            <div className="garage-entry-shutter absolute inset-0" />
          </motion.div>

          <button
            type="button"
            onClick={skip}
            className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 cursor-pointer font-studio text-[10px] uppercase tracking-[0.28em] text-white/40 transition-colors hover:text-[color:var(--garage-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--garage-gold)] sm:right-8"
            style={{ ['--garage-gold']: GOLD }}
            data-cursor-hover="true"
          >
            Skip
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default GarageEntryOverlay
