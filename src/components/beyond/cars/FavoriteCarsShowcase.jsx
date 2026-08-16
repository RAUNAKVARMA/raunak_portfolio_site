import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { favoriteCars } from '../../../data/favoriteCars'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import CarStageCanvas from './CarStageCanvas'
import { warmCar, warmCars } from './carGltf'

const GOLD = '#CA8A04'
const EASE = [0.16, 1, 0.3, 1]
const GARAGE_POOL_URLS = favoriteCars.map((c) => c.modelUrl)

function StageFallback({ name, accent }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-black">
      <span
        className="pointer-events-none absolute left-1/2 top-[42%] h-[46vmin] w-[68vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${accent || GOLD}55 0%, transparent 68%)`,
        }}
        aria-hidden
      />
      <p className="relative z-[1] font-studio text-[11px] uppercase tracking-[0.22em] text-white/45">
        {name}
      </p>
    </div>
  )
}

function GarageRail({ activeId, onSelect }) {
  return (
    <div className="garage-rail pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 sm:bottom-8">
      <div className="pointer-events-auto rounded-full border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {favoriteCars.map((car) => {
            const active = activeId === car.id
            return (
              <button
                key={car.id}
                type="button"
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

/** UI + scroll marker only — 3D lives in the shared sticky canvas. */
function CarStage({ car, index, total, onActive, reducedMotion, isActive, onNear }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(index === 0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onNear?.(car.id)
      },
      { rootMargin: '60% 0px 60% 0px', threshold: 0 },
    )

    const activeObserver = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.15
        setInView(visible)
        if (visible) onActive(car.id)
      },
      { rootMargin: '10% 0px 10% 0px', threshold: [0.08, 0.15, 0.35, 0.55] },
    )

    nearObserver.observe(node)
    activeObserver.observe(node)
    return () => {
      nearObserver.disconnect()
      activeObserver.disconnect()
    }
  }, [car.id, onActive, onNear])

  return (
    <section
      id={`garage-${car.id}`}
      ref={ref}
      className="garage-stage pointer-events-none relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-transparent text-white"
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
              ? '50'
              : '24'
          } 0%, transparent 72%)`,
        }}
        initial={false}
        animate={isActive && inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-20 sm:px-8 sm:pb-10 sm:pt-24">
        <motion.div
          className="pointer-events-auto mx-auto flex w-full max-w-[1200px] flex-col gap-3 touch-pan-y sm:flex-row sm:items-end sm:justify-between sm:gap-5"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 8 }}
          transition={{ duration: 0.35, ease: EASE }}
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
              <div className="mt-2.5 max-w-lg overflow-hidden border-l border-[color:var(--car-accent)]/50 pl-3 sm:mt-3">
                {car.tributeLabel ? (
                  <p className="font-studio text-[9px] font-medium uppercase tracking-[0.2em] text-[color:var(--car-accent)] sm:text-[10px]">
                    {car.tributeLabel}
                  </p>
                ) : null}
                <p className="mt-1 break-words font-display text-[12px] font-semibold leading-[1.45] tracking-[-0.015em] text-white/90 sm:text-[15px]">
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
              className={`max-w-[11rem] font-studio text-[9px] uppercase tracking-[0.14em] sm:mt-2 sm:max-w-none sm:text-[10px] ${
                car.id === 'm4' ||
                car.id === 'valour' ||
                car.id === 'aventador' ||
                car.id === 'spyder' ||
                car.id === 'supra' ||
                car.id === 'stradale'
                  ? 'text-[color:var(--car-accent)]/80'
                  : 'text-white/35'
              }`}
            >
              {car.accentNote}
            </p>
          </div>
        </motion.div>

        <div className="garage-hairline pointer-events-none mx-auto mt-4 flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-2 pt-3 font-studio text-[9px] uppercase tracking-[0.14em] text-white/30 sm:mt-6 sm:text-[10px]">
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

function FavoriteCarsShowcase({ onEnter, forceArm = false, focusCarId = null }) {
  const reducedMotion = useReducedMotion()
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const lenisRef = useLenis()
  const rootRef = useRef(null)
  const [armed, setArmed] = useState(Boolean(forceArm))
  const [activeId, setActiveId] = useState(favoriteCars[0]?.id)
  const [displayId, setDisplayId] = useState(favoriteCars[0]?.id)
  const enteredRef = useRef(false)
  const swapTimer = useRef(null)
  const effectivelyArmed = armed || forceArm
  const activeIndex = Math.max(
    0,
    favoriteCars.findIndex((c) => c.id === displayId),
  )
  const activeCar = favoriteCars[activeIndex] ?? favoriteCars[0]
  // Sticky canvas stays inside the garage flow (never overlays the intro).
  // Mount as soon as armed so WebGL + GLBs warm during the intro → instant on scroll-in.
  const showCanvas = effectivelyArmed && !prefersReducedMotion && !reducedMotion && activeCar

  useEffect(() => {
    if (forceArm) setArmed(true)
  }, [forceArm])

  useEffect(() => {
    if (!focusCarId) return
    setArmed(true)
    setActiveId(focusCarId)
    setDisplayId(focusCarId)
  }, [focusCarId])

  useEffect(() => {
    const node = rootRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setArmed(true)
      },
      { threshold: [0, 0.02] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Debounced model swap — stops mid-scroll thrash / glitch
  useEffect(() => {
    if (activeId === displayId) return undefined
    if (swapTimer.current) window.clearTimeout(swapTimer.current)
    const car = favoriteCars.find((c) => c.id === activeId)
    if (car) warmCar(car.modelUrl)
    swapTimer.current = window.setTimeout(() => {
      setDisplayId(activeId)
      swapTimer.current = null
    }, 70)
    return () => {
      if (swapTimer.current) window.clearTimeout(swapTimer.current)
    }
  }, [activeId, displayId])

  // Closest stage to viewport focus — reliable on fast Lenis scroll
  useEffect(() => {
    if (!effectivelyArmed) return undefined

    let raf = 0
    const pick = () => {
      raf = 0
      const focusY = window.innerHeight * 0.42
      let bestId = null
      let bestDist = Infinity
      for (let i = 0; i < favoriteCars.length; i += 1) {
        const el = document.getElementById(`garage-${favoriteCars[i].id}`)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue
        const center = (rect.top + rect.bottom) * 0.5
        const dist = Math.abs(center - focusY)
        if (dist < bestDist) {
          bestDist = dist
          bestId = favoriteCars[i].id
        }
      }
      if (bestId) {
        setActiveId(bestId)
        if (!enteredRef.current) {
          enteredRef.current = true
          onEnter?.()
        }
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(pick)
    }

    pick()
    window.addEventListener('scroll', onScroll, { passive: true })
    const lenis = lenisRef?.current
    lenis?.on?.('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      lenis?.off?.('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [effectivelyArmed, lenisRef, onEnter])

  useEffect(() => {
    if (!effectivelyArmed) return undefined
    warmCars(
      favoriteCars.map((c) => c.modelUrl),
      { concurrency: isTouchLike ? 3 : 4 },
    )
    return undefined
  }, [effectivelyArmed, isTouchLike])

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

  const handleNear = useCallback((id) => {
    const car = favoriteCars.find((c) => c.id === id)
    if (car) warmCar(car.modelUrl)
  }, [])

  const scrollToCar = useCallback(
    (id) => {
      const car = favoriteCars.find((c) => c.id === id)
      if (car) warmCar(car.modelUrl)
      setArmed(true)
      setActiveId(id)
      setDisplayId(id)
      const el = document.getElementById(`garage-${id}`)
      if (!el) return
      const lenis = lenisRef?.current
      if (lenis && !reducedMotion) {
        lenis.scrollTo(el, { offset: 0, duration: 2.35 })
      } else {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
      }
    },
    [lenisRef, reducedMotion],
  )

  return (
    <div className="garage-root relative bg-black" ref={rootRef} style={{ ['--garage-gold']: GOLD }}>
      <GarageRail activeId={displayId} onSelect={scrollToCar} />

      {showCanvas ? (
        <div className="pointer-events-none sticky top-0 z-[2] h-[100svh] w-full">
          <div className="relative h-full w-full">
            <p
              className={`pointer-events-none absolute inset-x-0 top-[11%] z-0 select-none truncate px-3 text-center font-heading text-[clamp(2.75rem,16vw,13rem)] font-bold uppercase leading-none tracking-[-0.06em] text-white/[0.12] sm:text-[clamp(4.5rem,22vw,13rem)] ${
                activeCar.id === 'm4'
                  ? 'garage-m4-watermark'
                  : activeCar.id === 'valour'
                    ? 'garage-valour-watermark'
                    : activeCar.id === 'aventador'
                      ? 'garage-lambo-watermark'
                      : activeCar.id === 'spyder'
                        ? 'garage-porsche-watermark'
                        : activeCar.id === 'supra'
                          ? 'garage-supra-watermark'
                          : activeCar.id === 'stradale'
                            ? 'garage-ferrari-watermark'
                            : 'garage-gold-watermark'
              }`}
              aria-hidden
            >
              {activeCar.watermark}
            </p>
            <div className="pointer-events-auto absolute inset-0 z-[1]">
              <WebGLErrorBoundary
                resetKey="garage-canvas"
                fallback={
                  <StageFallback name={activeCar.name} accent={activeCar.accent} />
                }
              >
                <CarStageCanvas
                  modelUrl={activeCar.modelUrl}
                  poolUrls={GARAGE_POOL_URLS}
                  carId={activeCar.id}
                  active
                  mobileLite
                  autoRotate={false}
                  reducedMotion={Boolean(reducedMotion || prefersReducedMotion)}
                  playIntro={false}
                />
              </WebGLErrorBoundary>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`pointer-events-none relative z-[3] ${showCanvas ? '-mt-[100svh]' : ''}`}>
        {favoriteCars.map((car, index) => (
          <CarStage
            key={car.id}
            car={car}
            index={index}
            total={favoriteCars.length}
            onActive={handleActive}
            onNear={handleNear}
            reducedMotion={Boolean(reducedMotion)}
            isActive={displayId === car.id}
          />
        ))}
      </div>
    </div>
  )
}

export default FavoriteCarsShowcase
