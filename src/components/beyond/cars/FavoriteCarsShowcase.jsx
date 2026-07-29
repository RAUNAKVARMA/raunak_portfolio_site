import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGLTF } from '@react-three/drei'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { favoriteCars } from '../../../data/favoriteCars'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import CarStageCanvas from './CarStageCanvas'

const GOLD = '#CA8A04'
const EASE = [0.16, 1, 0.3, 1]

function StageFallback({ name, accent }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-transparent">
      <span
        className="h-10 w-10 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle, ${accent || GOLD}aa 0%, transparent 70%)`,
        }}
        aria-hidden
      />
      <p className="font-studio text-[12px] tracking-wide text-white/40">{name}</p>
    </div>
  )
}

function GarageRail({ activeId, onSelect }) {
  return (
    <div className="garage-rail pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <Link
          to="/beyond"
          className="cursor-pointer font-studio text-[11px] uppercase tracking-[0.16em] text-white/50 transition-colors duration-200 hover:text-[color:var(--garage-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--garage-gold)]"
          data-cursor-hover="true"
        >
          ← Beyond
        </Link>

        <nav
          className="hidden items-center gap-1 border border-white/10 bg-black/60 px-1.5 py-1 backdrop-blur-sm sm:flex"
          aria-label="Garage progress"
        >
          {favoriteCars.map((car, i) => {
            const active = car.id === activeId
            return (
              <button
                key={car.id}
                type="button"
                data-cursor-hover="true"
                onClick={() => onSelect(car.id)}
                className={`cursor-pointer px-3 py-1.5 font-studio text-[10px] uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--garage-gold)] ${
                  active
                    ? 'bg-[color:var(--garage-gold)]/15 text-[color:var(--garage-gold)]'
                    : 'text-white/40 hover:text-white/75'
                }`}
                aria-current={active ? 'true' : undefined}
              >
                {String(i + 1).padStart(2, '0')} {car.short}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 sm:hidden" aria-label="Garage progress">
          {favoriteCars.map((car) => {
            const active = car.id === activeId
            return (
              <button
                key={car.id}
                type="button"
                data-cursor-hover="true"
                aria-label={car.name}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(car.id)}
                className={`h-2 w-2 cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--garage-gold)] ${
                  active ? 'scale-125 bg-[color:var(--garage-gold)]' : 'bg-white/25'
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * One full-viewport stage per car (original scroll). Smoothness rules:
 * - Only the active stage mounts a WebGL canvas (never 7 contexts).
 * - Next car GLB is preloaded in the background (no canvas).
 * - Inactive stages are plain DOM — scroll stays free.
 */
function CarStage({
  car,
  index,
  total,
  onActive,
  reducedMotion,
  isActive,
  onNear,
}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(index === 0)
  const [revealed, setRevealed] = useState(false)
  const [entranceActive, setEntranceActive] = useState(false)
  const entrancePlayed = useRef(false)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  // Single live canvas — biggest smoothness win in this layout
  const mountCanvas = isActive && !prefersReducedMotion
  const renderLive = isActive && inView

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const watermarkY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion || isTouchLike ? [0, 0] : [28, -28],
  )
  const watermarkOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    reducedMotion ? [0.45, 0.45, 0.45, 0.45] : [0.16, 0.42, 0.42, 0.16],
  )

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onNear?.(car.id)
      },
      { rootMargin: '55% 0px 55% 0px', threshold: 0 },
    )

    const activeObserver = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.4
        setInView(visible)
        if (visible) {
          onActive(car.id)
          if (!entrancePlayed.current && !reducedMotion && !prefersReducedMotion) {
            entrancePlayed.current = true
            setEntranceActive(true)
          }
        }
      },
      { threshold: [0.25, 0.4, 0.55] },
    )

    nearObserver.observe(node)
    activeObserver.observe(node)
    return () => {
      nearObserver.disconnect()
      activeObserver.disconnect()
    }
  }, [car.id, onActive, onNear, reducedMotion, prefersReducedMotion])

  useEffect(() => {
    if (!entranceActive) return undefined
    const timer = window.setTimeout(() => setEntranceActive(false), 1300)
    return () => window.clearTimeout(timer)
  }, [entranceActive])

  useEffect(() => {
    if (index !== 0 || reducedMotion || prefersReducedMotion) return undefined
    if (entrancePlayed.current) return undefined
    const timer = window.setTimeout(() => {
      entrancePlayed.current = true
      setEntranceActive(true)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [index, reducedMotion, prefersReducedMotion])

  // Reset reveal when this stage becomes active again after unmount
  useEffect(() => {
    if (!isActive) setRevealed(false)
  }, [isActive])

  const handleReady = useCallback(() => {
    setRevealed(true)
  }, [])

  return (
    <section
      id={`garage-${car.id}`}
      ref={ref}
      className="garage-stage relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-black text-white"
      data-car={car.id}
      aria-label={`${car.name} showcase`}
      style={{ ['--car-accent']: car.accent }}
    >
      <div className="garage-stage-glow pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-[42%] z-[1] h-[50vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `radial-gradient(circle, ${car.accent}${
            car.id === 'bugatti' ||
            car.id === 'stradale' ||
            car.id === 'm4' ||
            car.id === 'valour' ||
            car.id === 'aventador' ||
            car.id === 'spyder' ||
            car.id === 'supra'
              ? '66'
              : '28'
          } 0%, transparent 72%)`,
        }}
        initial={false}
        animate={revealed && inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[14%] z-[1] select-none overflow-hidden px-3 text-center sm:top-[12%] sm:px-2"
        style={{ y: watermarkY, opacity: watermarkOpacity }}
        aria-hidden
      >
        <p
          className={`garage-gold-watermark mx-auto max-w-full truncate font-heading text-[clamp(2.75rem,16vw,13rem)] font-bold uppercase leading-none tracking-[-0.06em] sm:text-[clamp(4.5rem,22vw,13rem)] ${
            car.id === 'm4'
              ? 'garage-m4-watermark'
              : car.id === 'valour'
                ? 'garage-valour-watermark'
                : car.id === 'aventador'
                  ? 'garage-lambo-watermark'
                  : car.id === 'spyder'
                    ? 'garage-porsche-watermark'
                    : car.id === 'supra'
                      ? 'garage-supra-watermark'
                      : car.id === 'stradale'
                        ? 'garage-ferrari-watermark'
                        : ''
          }`}
        >
          {car.watermark}
        </p>
      </motion.div>

      <div className="absolute inset-0 z-[2]">
        {mountCanvas ? (
          <WebGLErrorBoundary
            resetKey={car.modelUrl}
            fallback={<StageFallback name={car.name} accent={car.accent} />}
          >
            {!revealed && <StageFallback name={car.name} accent={car.accent} />}
            <motion.div
              className="absolute inset-0 will-change-[opacity]"
              initial={false}
              animate={{
                opacity: revealed ? (inView ? 1 : 0) : 0,
              }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <CarStageCanvas
                key={car.modelUrl}
                modelUrl={car.modelUrl}
                active={renderLive}
                mobileLite={isTouchLike}
                autoRotate={!reducedMotion && renderLive && !entranceActive}
                reducedMotion={reducedMotion || prefersReducedMotion}
                playIntro={entranceActive && inView && !isTouchLike}
                onReady={handleReady}
              />
            </motion.div>
          </WebGLErrorBoundary>
        ) : (
          <StageFallback name={car.name} accent={car.accent} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-24 sm:px-8 sm:pb-10 sm:pt-28">
        {/* Touch-scroll zone: drag here to scroll the page; drag the car area above to orbit */}
        <motion.div
          className="pointer-events-auto mx-auto flex w-full max-w-[1200px] flex-col gap-3 touch-pan-y sm:flex-row sm:items-end sm:justify-between sm:gap-5"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 10 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="min-w-0 max-w-xl overflow-hidden">
            <p
              className={`font-studio text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.2em] ${
                car.id === 'm4' ||
                car.id === 'valour' ||
                car.id === 'aventador' ||
                car.id === 'spyder' ||
                car.id === 'supra' ||
                car.id === 'stradale'
                  ? 'text-[color:var(--car-accent)]'
                  : 'text-[color:var(--garage-gold)]'
              }`}
            >
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {car.badge}
            </p>
            <h2 className="mt-1.5 break-words font-heading text-[clamp(1.25rem,5.5vw,2.35rem)] font-bold tracking-tight text-white sm:mt-2">
              {car.name}
            </h2>
            {car.line ? (
              <p className="mt-1.5 break-words font-studio text-[12px] leading-[18px] text-white/65 sm:mt-2 sm:text-[13px] sm:leading-[20px]">
                {car.line}
              </p>
            ) : null}
            {car.tribute ? (
              <div className="mt-2.5 max-w-lg overflow-hidden border-l border-[color:var(--car-accent)]/50 pl-3 sm:mt-3 sm:pl-3.5">
                {car.tributeLabel ? (
                  <p className="font-studio text-[9px] font-medium uppercase tracking-[0.2em] text-[color:var(--car-accent)] sm:text-[10px] sm:tracking-[0.24em]">
                    {car.tributeLabel}
                  </p>
                ) : null}
                <p className="mt-1 break-words font-display text-[12px] font-semibold leading-[1.45] tracking-[-0.015em] text-white/90 sm:mt-1.5 sm:text-[15px] sm:leading-[1.4]">
                  {car.tribute}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-end justify-between gap-4 sm:block sm:text-right">
            <p
              className={`garage-gold-year font-heading text-[clamp(2.25rem,11vw,4.5rem)] font-bold leading-none tracking-tight ${
                car.id === 'm4'
                  ? 'garage-m4-year'
                  : car.id === 'valour'
                    ? 'garage-valour-year'
                    : car.id === 'aventador'
                      ? 'garage-lambo-year'
                      : car.id === 'spyder'
                        ? 'garage-porsche-year'
                        : car.id === 'supra'
                          ? 'garage-supra-year'
                          : car.id === 'stradale'
                            ? 'garage-ferrari-year'
                            : ''
              }`}
            >
              {car.year}
            </p>
            <p
              className={`mt-0 max-w-[11rem] break-words text-right font-studio text-[9px] uppercase leading-snug tracking-[0.14em] sm:mt-2 sm:max-w-none sm:text-[10px] sm:tracking-[0.16em] ${
                car.id === 'm4' ||
                car.id === 'valour' ||
                car.id === 'aventador' ||
                car.id === 'spyder' ||
                car.id === 'supra' ||
                car.id === 'stradale'
                  ? 'text-[color:var(--car-accent)]'
                  : 'text-white/35'
              }`}
            >
              {car.accentNote}
            </p>
          </div>
        </motion.div>

        <div className="garage-hairline pointer-events-auto mx-auto mt-4 flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-2 touch-pan-y pt-3 font-studio text-[9px] uppercase tracking-[0.14em] text-white/30 sm:mt-6 sm:gap-3 sm:pt-4 sm:text-[10px] sm:tracking-[0.16em]">
          <span>Drag car to orbit</span>
          <span>Scroll for next</span>
          <span>
            {index + 1} of {total}
          </span>
        </div>
      </div>
    </section>
  )
}

function FavoriteCarsShowcase({ onEnter }) {
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis()
  const [activeId, setActiveId] = useState(favoriteCars[0]?.id)
  const enteredRef = useRef(false)
  const activeIndex = Math.max(
    0,
    favoriteCars.findIndex((c) => c.id === activeId),
  )

  const handleActive = useCallback(
    (id) => {
      setActiveId(id)
      if (!enteredRef.current) {
        enteredRef.current = true
        onEnter?.()
      }
    },
    [onEnter],
  )

  // Warm only active + next GLB (never dump all 7 / never mount extra canvases)
  useEffect(() => {
    const urls = [favoriteCars[activeIndex], favoriteCars[activeIndex + 1]]
      .filter(Boolean)
      .map((c) => c.modelUrl)
    urls.forEach((url) => {
      try {
        useGLTF.preload(url)
      } catch {
        /* */
      }
    })
  }, [activeIndex])

  const handleNear = useCallback((id) => {
    const car = favoriteCars.find((c) => c.id === id)
    if (!car) return
    try {
      useGLTF.preload(car.modelUrl)
    } catch {
      /* */
    }
  }, [])

  const scrollToCar = useCallback(
    (id) => {
      const el = document.getElementById(`garage-${id}`)
      if (!el) return
      const lenis = lenisRef?.current
      if (lenis && !reducedMotion) {
        lenis.scrollTo(el, { offset: 0, duration: 1.15 })
      } else {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
      }
    },
    [lenisRef, reducedMotion],
  )

  return (
    <div className="garage-root" style={{ ['--garage-gold']: GOLD }}>
      <GarageRail activeId={activeId} onSelect={scrollToCar} />
      {favoriteCars.map((car, index) => (
        <CarStage
          key={car.id}
          car={car}
          index={index}
          total={favoriteCars.length}
          onActive={handleActive}
          onNear={handleNear}
          reducedMotion={Boolean(reducedMotion)}
          isActive={activeId === car.id}
        />
      ))}
    </div>
  )
}

export default FavoriteCarsShowcase
