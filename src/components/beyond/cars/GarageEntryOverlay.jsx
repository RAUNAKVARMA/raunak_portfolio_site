import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { favoriteCars } from '../../../data/favoriteCars'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import { preloadCar } from './carGltf'

const GOLD = '#CA8A04'
const EASE = [0.16, 1, 0.3, 1]
/** ~7s cinematic — also warms the first car GLBs. */
const ENTRY_MS = 7200

/**
 * Fullscreen garage-door opening sequence.
 * Locks scroll, preloads first cars, then reveals the page.
 */
function GarageEntryOverlay({ onComplete }) {
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis()
  const doneRef = useRef(false)
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

    preloadCar(favoriteCars[0]?.modelUrl)
    const warm1 = window.setTimeout(() => preloadCar(favoriteCars[1]?.modelUrl), 900)
    const warm2 = window.setTimeout(() => preloadCar(favoriteCars[2]?.modelUrl), 1800)

    const boot = window.setTimeout(() => setPhase('brand'), 280)
    const rosterT = window.setTimeout(() => setPhase('roster'), 1400)
    const openDoor = window.setTimeout(() => setPhase('open'), 5600)
    const end = window.setTimeout(() => setOpen(false), ENTRY_MS)

    const started = performance.now()
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - started) / ENTRY_MS)
      setProgress(t)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.clearTimeout(warm1)
      window.clearTimeout(warm2)
      window.clearTimeout(boot)
      window.clearTimeout(rosterT)
      window.clearTimeout(openDoor)
      window.clearTimeout(end)
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
    }, 520)
    return () => window.clearInterval(id)
  }, [phase, roster.length])

  const skip = () => {
    setPhase('open')
    setProgress(1)
    window.setTimeout(() => setOpen(false), 700)
  }

  const active = roster[rosterIndex] ?? roster[0]

  return (
    <AnimatePresence onExitComplete={finish}>
      {open ? (
        <motion.div
          className="garage-entry fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#030303] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
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
            transition={{ duration: 1.1, ease: EASE }}
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
              transition={{ duration: 0.55, ease: EASE }}
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
                transition={{ duration: 0.85, ease: EASE, delay: 0.05 }}
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
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
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
                    transition={{ duration: 0.35, ease: EASE }}
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
                <span>Opening doors</span>
                <span>{String(Math.round(progress * 100)).padStart(2, '0')}%</span>
              </div>
            </div>
          </div>

          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 origin-top bg-[#050505]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: phase === 'open' ? 0 : 1 }}
            transition={{ duration: 1.05, ease: EASE }}
            aria-hidden
          >
            <div className="garage-entry-shutter absolute inset-0" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1/2 origin-bottom bg-[#050505]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: phase === 'open' ? 0 : 1 }}
            transition={{ duration: 1.05, ease: EASE }}
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
