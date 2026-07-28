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

function StageFallback({ name }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
      <p className="font-studio text-[12px] tracking-wide text-white/35">{name}</p>
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

function CarStage({ car, index, total, onActive, reducedMotion, isActive }) {
  const ref = useRef(null)
  const [near, setNear] = useState(index === 0)
  const [inView, setInView] = useState(index === 0)
  const [warmed, setWarmed] = useState(index === 0)
  const [revealed, setRevealed] = useState(false)
  const [entranceActive, setEntranceActive] = useState(false)
  const entrancePlayed = useRef(false)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  const mountCanvas = (warmed || near) && !prefersReducedMotion
  // Only the on-screen stage runs WebGL — biggest smoothness win
  const renderLive = inView && isActive

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

    const warmObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          setWarmed(true)
        } else {
          setNear(false)
        }
      },
      { rootMargin: '80% 0px 80% 0px', threshold: 0 },
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

    warmObserver.observe(node)
    activeObserver.observe(node)
    return () => {
      warmObserver.disconnect()
      activeObserver.disconnect()
    }
  }, [car.id, onActive, reducedMotion, prefersReducedMotion])

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
        className="pointer-events-none absolute inset-x-0 top-[16%] z-[1] select-none overflow-hidden px-2 text-center sm:top-[12%]"
        style={{ y: watermarkY, opacity: watermarkOpacity }}
        aria-hidden
      >
        <p
          className={`garage-gold-watermark font-heading text-[clamp(4.5rem,22vw,13rem)] font-bold uppercase leading-none tracking-[-0.06em] ${
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
            fallback={<StageFallback name={car.name} />}
          >
            {!revealed && <StageFallback name={car.name} />}
            <motion.div
              className="absolute inset-0 will-change-[opacity]"
              initial={false}
              animate={{
                opacity: revealed ? (inView ? 1 : 0) : 0,
              }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <CarStageCanvas
                key={car.modelUrl}
                modelUrl={car.modelUrl}
                active={renderLive}
                mobileLite={isTouchLike}
                autoRotate={!reducedMotion && renderLive && !entranceActive}
                reducedMotion={reducedMotion || prefersReducedMotion}
                playIntro={entranceActive && inView}
                onReady={handleReady}
              />
            </motion.div>
          </WebGLErrorBoundary>
        ) : (
          <StageFallback name={car.name} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/75 to-transparent px-5 pb-8 pt-28 sm:px-8 sm:pb-10">
        <motion.div
          className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 10 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="min-w-0 max-w-xl">
            <p
              className={`font-studio text-[10px] uppercase tracking-[0.2em] ${
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
            <h2 className="mt-2 font-heading text-[clamp(1.5rem,4vw,2.35rem)] font-bold tracking-tight text-white">
              {car.name}
            </h2>
            {car.line ? (
              <p className="mt-2 font-studio text-[12px] leading-[18px] text-white/65 sm:text-[13px] sm:leading-[20px]">
                {car.line}
              </p>
            ) : null}
            {car.tribute ? (
              <div
                className={`mt-3 max-w-lg border-l pl-3 sm:pl-3.5 border-[color:var(--car-accent)]/50`}
              >
                {car.tributeLabel ? (
                  <p
                    className={`font-studio text-[9px] font-medium uppercase tracking-[0.24em] sm:text-[10px] text-[color:var(--car-accent)]`}
                  >
                    {car.tributeLabel}
                  </p>
                ) : null}
                <p className="mt-1.5 font-display text-[13px] font-semibold leading-[1.45] tracking-[-0.015em] text-white/90 sm:text-[15px] sm:leading-[1.4]">
                  {car.tribute}
                </p>
              </div>
            ) : null}
          </div>

          <div className="sm:text-right">
            <p
              className={`garage-gold-year font-heading text-[clamp(3rem,10vw,4.5rem)] font-bold leading-none tracking-tight ${
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
              className={`mt-2 font-studio text-[10px] uppercase tracking-[0.16em] ${
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

        <div className="garage-hairline mx-auto mt-6 flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 pt-4 font-studio text-[10px] uppercase tracking-[0.16em] text-white/30">
          <span>Drag to orbit</span>
          <span className="hidden sm:inline">Scroll for next</span>
          <span>
            {index + 1} of {total}
          </span>
        </div>
      </div>
    </section>
  )
}

function FavoriteCarsShowcase() {
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis()
  const [activeId, setActiveId] = useState(favoriteCars[0]?.id)

  useEffect(() => {
    let cancelled = false
    let i = 0

    const preloadNext = () => {
      if (cancelled || i >= favoriteCars.length) return
      try {
        useGLTF.preload(favoriteCars[i].modelUrl)
      } catch {
        /* */
      }
      i += 1
      if (i < favoriteCars.length) {
        window.setTimeout(preloadNext, 450)
      }
    }

    const start = window.setTimeout(preloadNext, 1600)
    return () => {
      cancelled = true
      window.clearTimeout(start)
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
          onActive={setActiveId}
          reducedMotion={Boolean(reducedMotion)}
          isActive={activeId === car.id}
        />
      ))}
    </div>
  )
}

export default FavoriteCarsShowcase
