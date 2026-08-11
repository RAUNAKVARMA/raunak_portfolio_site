import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import HamiltonFerrariCanvas from './HamiltonFerrariCanvas'
import { preloadCar } from './carGltf'

const EASE = [0.16, 1, 0.3, 1]
const F1_RED = '#E10600'
const F1_MODEL = '/models/cars/ferrari-f1-2026-concept.glb?v=4'

const CHAPTERS = [
  {
    id: 'resilience',
    tag: '01',
    title: 'Resilience',
    line: 'Keep going when people doubt you.',
    body: 'Setbacks, criticism, and pressure never stopped him. That refusal to quit is the part I try to carry into my own work.',
  },
  {
    id: 'craft',
    tag: '02',
    title: 'Craft',
    line: 'Consistency beats comfort.',
    body: 'His discipline and continuous improvement remind me that progress is built in quiet reps — as a student, researcher, and builder.',
  },
  {
    id: 'pressure',
    tag: '03',
    title: 'Pressure',
    line: 'Pressure builds champions.',
    body: 'Race weekends taught me that calm under intensity is a skill. The hardest moments are often where the next version of you appears.',
  },
  {
    id: 'ferrari',
    tag: '04',
    title: 'Ferrari era',
    line: 'Still waking up for him in red.',
    body: 'I followed him through Mercedes and still support him today in Ferrari red — the story keeps evolving, and so does the inspiration.',
  },
]

const STATS = [
  {
    id: 'titles',
    label: '7×',
    value: 'World Champion',
    detail: 'History made through relentless seasons — not a single lucky weekend.',
    numeric: 7,
    suffix: '×',
  },
  {
    id: 'wins',
    label: '105+',
    value: 'Grand Prix Wins',
    detail: 'Proof that elite performance is a long game of precision and belief.',
    numeric: 105,
    suffix: '+',
  },
  {
    id: 'mindset',
    label: 'Mindset',
    value: 'Never Stop Improving',
    detail: 'The standard I try to hold when building, learning, and shipping.',
    numeric: null,
  },
  {
    id: 'lesson',
    label: 'Lesson',
    value: 'Pressure Builds Champions',
    detail: 'When it gets hard, that is usually the signal to lean in — not retreat.',
    numeric: null,
  },
]

const TIMELINE = [
  { year: '2008', event: 'First World Championship' },
  { year: '2014–2020', event: 'Mercedes Dominance' },
  { year: '2021', event: 'Never Gave Up' },
  { year: '2025', event: 'Ferrari' },
  { year: 'Today', event: 'Still Inspiring Me' },
]

function useCountUp(target, active, reducedMotion) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null) return undefined
    if (reducedMotion || !active) {
      setValue(target)
      return undefined
    }
    let frame = 0
    const start = performance.now()
    const duration = 1100
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, reducedMotion])
  return value
}

function SplitWords({
  text,
  className = '',
  reducedMotion,
  delay = 0,
  stagger = 0.06,
  play = 'view',
}) {
  const words = text.split(' ')
  if (reducedMotion) {
    return <span className={className}>{text}</span>
  }
  return (
    <span className={className}>
      {words.map((word, i) => {
        const transition = { delay: delay + i * stagger, duration: 0.62, ease: EASE }
        const target = { y: '0%', opacity: 1, rotate: 0 }
        return (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pb-[0.08em]">
            <motion.span
              className="inline-block will-change-transform"
              initial={{ y: '115%', opacity: 0, rotate: 2 }}
              {...(play === 'mount'
                ? { animate: target }
                : { whileInView: target, viewport: { once: true, amount: 0.55 } })}
              transition={transition}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

function FadeWords({ text, className = '', reducedMotion, delay = 0, play = 'view', lite = false }) {
  const words = text.split(' ')
  if (reducedMotion) {
    return <p className={className}>{text}</p>
  }
  // Mobile: fade whole block — word+blur staggers are expensive
  if (lite) {
    return (
      <motion.p
        className={className}
        initial={{ opacity: 0, y: 12 }}
        {...(play === 'mount'
          ? { animate: { opacity: 1, y: 0 } }
          : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.35 } })}
        transition={{ delay, duration: 0.45, ease: EASE }}
      >
        {text}
      </motion.p>
    )
  }
  return (
    <p className={className}>
      {words.map((word, i) => {
        const transition = { delay: delay + i * 0.028, duration: 0.42, ease: EASE }
        const target = { opacity: 1, y: 0, filter: 'blur(0px)' }
        return (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            {...(play === 'mount'
              ? { animate: target }
              : { whileInView: target, viewport: { once: true, amount: 0.35 } })}
            transition={transition}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        )
      })}
    </p>
  )
}

function StatCard({ stat, active, reducedMotion, selected, onSelect, index = 0 }) {
  const count = useCountUp(stat.numeric, active, reducedMotion)
  const display =
    stat.numeric != null ? `${count}${stat.suffix || ''}` : stat.label

  return (
    <motion.button
      type="button"
      data-cursor-hover="true"
      onClick={onSelect}
      className={`garage-hamilton-stat group relative overflow-hidden border px-4 py-4 text-left transition-colors duration-250 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--f1-red)] sm:py-5 sm:backdrop-blur-[3px] ${
        selected
          ? 'border-[color:var(--f1-red)]/80 bg-black/50'
          : 'border-white/20 bg-black/35 hover:border-[color:var(--f1-red)]/55'
      }`}
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.5, ease: EASE }}
      aria-pressed={selected}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-[color:var(--f1-red)]"
        style={{ transform: selected ? 'scaleX(1)' : 'scaleX(0.25)' }}
        aria-hidden
      />
      <p className="garage-hamilton-readable font-display text-[clamp(1.4rem,3vw,1.85rem)] font-bold tracking-tight text-white">
        {display}
      </p>
      <p className="garage-hamilton-readable mt-1 font-studio text-[11px] uppercase tracking-[0.16em] text-white/80">
        {stat.value}
      </p>
      <AnimatePresence initial={false}>
        {selected ? (
          <motion.p
            key="detail"
            className="garage-hamilton-readable mt-3 font-studio text-[12px] leading-[18px] text-white/85"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {stat.detail}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.button>
  )
}

function HamiltonSection() {
  const reducedMotion = useReducedMotion()
  const { isTouchLike } = useReducedMotionProfile()
  const lite = Boolean(isTouchLike || reducedMotion)
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const storyRef = useRef(null)
  const inView = useInView(stageRef, { amount: 0.2, margin: '-6% 0px' })
  const nearStage = useInView(stageRef, { amount: 0, margin: '120% 0px' })
  const storyInView = useInView(storyRef, { amount: 0.2, once: true })

  const [chapterId, setChapterId] = useState(CHAPTERS[0].id)
  const [statId, setStatId] = useState(STATS[0].id)
  const [orbitPaused, setOrbitPaused] = useState(false)
  const [mountCanvas, setMountCanvas] = useState(false)
  const chapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0]

  useEffect(() => {
    // Warm F1 as early as this section mounts (way before sticky stage)
    preloadCar(F1_MODEL)
  }, [])

  useEffect(() => {
    if (nearStage) setMountCanvas(true)
  }, [nearStage])

  useEffect(() => {
    if (!nearStage) return undefined
    preloadCar(F1_MODEL)
    return undefined
  }, [nearStage])

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 })
  const spotX = useTransform(smoothX, [0, 1], ['0%', '100%'])
  const spotY = useTransform(smoothY, [0, 1], ['0%', '100%'])
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${spotX} ${spotY}, rgba(225,6,0,0.18), transparent 55%)`
  const watermarkParallaxX = useTransform(smoothX, [0, 1], [-28, 28])
  const watermarkParallaxY = useTransform(smoothY, [0, 1], [-16, 16])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const rawWatermarkOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0.18, 0.55, 0.22])
  const watermarkOpacity = useSpring(rawWatermarkOpacity, { stiffness: 70, damping: 22 })
  const posterY = useTransform(scrollYProgress, [0, 1], lite ? ['0%', '0%'] : ['-6%', '6%'])

  const onStageMove = (event) => {
    if (lite) return
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set((event.clientX - rect.left) / rect.width)
    mouseY.set((event.clientY - rect.top) / rect.height)
  }

  return (
    <section
      ref={sectionRef}
      className="garage-hamilton relative overflow-hidden border-t border-white/[0.08] bg-black text-white"
      aria-labelledby="hamilton-heading"
      style={{ ['--f1-red']: F1_RED }}
    >
      <div
        ref={stageRef}
        className="garage-hamilton-stage relative h-[100svh] min-h-[100svh] w-full overflow-hidden bg-black sm:min-h-[640px]"
        onMouseMove={onStageMove}
        onMouseEnter={() => {
          if (!lite) setOrbitPaused(false)
        }}
      >
        {!lite && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: spotlight }}
            aria-hidden
          />
        )}

        <div className="garage-hamilton-stage-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden />

        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.32] sm:opacity-[0.38]"
          style={lite ? undefined : { y: posterY }}
          aria-hidden
        >
          <img
            src="/images/lewis-hamilton-always.png"
            alt=""
            className="h-full w-full object-cover object-[center_18%] sm:object-[center_22%]"
            draggable={false}
            decoding="async"
            fetchPriority="low"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-black/90" />
        </motion.div>

        {!lite && (
          <div className="garage-hamilton-scan pointer-events-none absolute inset-0 z-[1] opacity-[0.07]" aria-hidden />
        )}

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[9%] z-[2] select-none overflow-hidden px-2 text-center sm:top-[8%]"
          style={
            lite
              ? { opacity: 0.32 }
              : {
                  x: watermarkParallaxX,
                  y: watermarkParallaxY,
                  opacity: watermarkOpacity,
                }
          }
          aria-hidden
        >
          <p className="garage-hamilton-watermark mx-auto max-w-full truncate font-heading text-[clamp(2.6rem,15vw,13rem)] font-bold uppercase leading-none tracking-[-0.06em] sm:text-[clamp(3.4rem,18vw,13rem)]">
            HAMILTON
          </p>
        </motion.div>

        <div className="absolute inset-0 z-[3]">
          {mountCanvas ? (
            <HamiltonFerrariCanvas
              reducedMotion={Boolean(reducedMotion)}
              active={inView}
              autoRotate={!orbitPaused && !reducedMotion}
              mobileLite={isTouchLike}
              allowOrbit={!reducedMotion}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="font-studio text-[10px] uppercase tracking-[0.22em] text-white/30">
                Loading stage…
              </p>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:gap-4 sm:px-8">
          <motion.div
            className="pointer-events-auto mt-3 flex flex-wrap items-center gap-2 sm:mt-4"
            initial={reducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="border border-[color:var(--f1-red)]/50 bg-black/55 px-2.5 py-1.5 font-studio text-[10px] uppercase tracking-[0.22em] text-[color:var(--f1-red)] sm:bg-black/45 sm:px-3 sm:backdrop-blur-md">
              No. 44
            </span>
            <span className="hidden border border-white/12 bg-black/45 px-3 py-1.5 font-studio text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-md sm:inline-block">
              Inspired by
            </span>
          </motion.div>

          {!reducedMotion && (
            <motion.button
              type="button"
              data-cursor-hover="true"
              className="pointer-events-auto mt-3 cursor-pointer border border-white/15 bg-black/50 px-3 py-1.5 font-studio text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md transition-colors duration-200 hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--f1-red)] sm:mt-4"
              onClick={() => setOrbitPaused((v) => !v)}
              aria-pressed={orbitPaused}
              initial={reducedMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: EASE }}
            >
              {orbitPaused ? 'Resume orbit' : isTouchLike ? 'Drag to orbit' : 'Drag to orbit · Pause'}
            </motion.button>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/88 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:px-8 sm:pb-10 sm:pt-32">
          <div className="pointer-events-auto mx-auto w-full max-w-[1200px]">
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <motion.p
                  className="font-studio text-[10px] uppercase tracking-[0.22em] text-[color:var(--f1-red)]"
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  Mindset · Race weekends · Ferrari red
                </motion.p>
                <h2
                  id="hamilton-heading"
                  className="mt-2 break-words font-heading text-[clamp(1.25rem,5.2vw,2.7rem)] font-bold tracking-tight text-white"
                >
                  <SplitWords
                    text="Inspired by Lewis Hamilton"
                    reducedMotion={Boolean(reducedMotion) || lite}
                    delay={0.05}
                    stagger={0.07}
                  />
                </h2>
                <div className="mt-3 max-w-prose overflow-hidden break-words font-studio text-[12px] leading-[20px] text-white/88 max-sm:line-clamp-3 sm:font-display sm:text-[clamp(1.05rem,2.2vw,1.35rem)] sm:font-semibold sm:leading-snug sm:tracking-tight sm:text-[13px] sm:leading-[21px]">
                  <FadeWords
                    text="I started watching Formula 1 in 2016 because of Lewis Hamilton. What began as admiration for a driver grew into a passion for the sport and a mindset that continues to inspire me."
                    reducedMotion={Boolean(reducedMotion)}
                    delay={0.2}
                    lite={lite}
                  />
                </div>
              </div>

              <motion.p
                className="shrink-0 font-heading text-[clamp(2.1rem,12vw,5rem)] font-bold leading-none tracking-tight text-[color:var(--f1-red)]"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12, duration: 0.55, ease: EASE }}
                aria-hidden
              >
                44
              </motion.p>
            </div>

            <p className="mt-5 font-studio text-[10px] uppercase tracking-[0.2em] text-white/45 sm:mt-6">
              {isTouchLike ? 'Scroll for story · chapters' : 'Scroll for story · collage · chapters'}
            </p>
          </div>
        </div>
      </div>

      <div ref={storyRef} className="relative z-10 overflow-hidden border-t border-white/[0.08] bg-black">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src="/images/lewis-hamilton-collage.png"
            alt=""
            className="h-full w-full scale-[1.02] object-cover object-[center_22%] sm:scale-[1.04] sm:object-[center_28%]"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30 sm:from-black/55 sm:via-black/28 sm:to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="garage-hamilton-story-glow absolute inset-0 opacity-70" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1200px] gap-8 overflow-x-hidden px-4 py-12 sm:gap-10 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12 lg:py-20">
          <div className="flex min-h-[220px] flex-col gap-6 sm:min-h-[260px] sm:gap-7">
            <div
              className="garage-hamilton-chapters relative flex flex-wrap gap-2 pb-1"
              role="tablist"
              aria-label="Hamilton mindset chapters"
            >
              {CHAPTERS.map((item) => {
                const selected = item.id === chapterId
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    data-cursor-hover="true"
                    onClick={() => setChapterId(item.id)}
                    className={`shrink-0 cursor-pointer border px-3.5 py-2.5 font-studio text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--f1-red)] sm:py-2 sm:backdrop-blur-[4px] ${
                      selected
                        ? 'border-[color:var(--f1-red)] bg-[color:var(--f1-red)]/25 text-white'
                        : 'border-white/20 bg-black/35 text-white/70 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    <span className="text-[color:var(--f1-red)]/90">{item.tag}</span>
                    <span className="ml-2">{item.title}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={chapter.id}
                className="relative max-w-xl"
                initial={reducedMotion ? false : { opacity: 0, y: lite ? 16 : 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: lite ? -10 : -18 }}
                transition={{ duration: lite ? 0.3 : 0.45, ease: EASE }}
              >
                <motion.p
                  className="garage-hamilton-readable font-studio text-[11px] uppercase tracking-[0.28em] text-[color:var(--f1-red)]"
                  initial={reducedMotion ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04, duration: 0.4, ease: EASE }}
                >
                  Chapter {chapter.tag} · {chapter.title}
                </motion.p>

                <h3 className="garage-hamilton-readable mt-3 font-display text-[clamp(1.45rem,4.5vw,2.35rem)] font-bold tracking-tight text-white sm:mt-4">
                  <SplitWords
                    text={chapter.line}
                    reducedMotion={Boolean(reducedMotion) || lite}
                    delay={0.1}
                    stagger={0.07}
                    play="mount"
                  />
                </h3>

                <FadeWords
                  text={chapter.body}
                  className="garage-hamilton-readable mt-4 max-w-xl font-studio text-[14px] leading-[24px] text-white sm:mt-5 sm:text-[15px] sm:leading-[26px]"
                  reducedMotion={Boolean(reducedMotion)}
                  delay={0.2}
                  play="mount"
                  lite={lite}
                />

                <FadeWords
                  text="Lewis Hamilton has been the biggest reason I fell in love with Formula 1. I've followed his journey since the Mercedes era and continue supporting him today in Ferrari red."
                  className="garage-hamilton-readable mt-5 max-w-xl border-l-2 border-[color:var(--f1-red)] pl-4 font-studio text-[13px] leading-[22px] text-white/92 sm:mt-6 sm:text-[14px] sm:leading-[24px]"
                  reducedMotion={Boolean(reducedMotion)}
                  delay={0.32}
                  play="mount"
                  lite={lite}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="garage-hamilton-stats relative grid grid-cols-1 gap-2.5 self-start sm:grid-cols-2 sm:gap-3 lg:grid-cols-1 xl:grid-cols-2">
            {STATS.map((stat, index) => (
              <StatCard
                key={stat.id}
                stat={stat}
                index={index}
                active={storyInView}
                reducedMotion={Boolean(reducedMotion) || lite}
                selected={statId === stat.id}
                onSelect={() => setStatId((prev) => (prev === stat.id ? '' : stat.id))}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-8 sm:pb-20"
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="garage-hamilton-readable font-studio text-[10px] uppercase tracking-[0.24em] text-white/75">
            Timeline
          </p>

          <ol className="garage-hamilton-timeline mt-6 flex gap-0 overflow-x-auto overscroll-x-contain pb-2 sm:mt-8 sm:pb-1">
            {TIMELINE.map((item, index) => (
              <motion.li
                key={item.year}
                className="relative flex min-w-[132px] flex-1 flex-col sm:min-w-0"
                initial={reducedMotion || lite ? false : { opacity: 0, y: 22, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: lite ? 0 : 0.1 + index * 0.1, duration: 0.45, ease: EASE }}
              >
                <div className="flex items-center">
                  <span
                    className="relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--f1-red)] shadow-[0_0_12px_rgba(225,6,0,0.45)]"
                    aria-hidden
                  />
                  {index < TIMELINE.length - 1 ? (
                    <span
                      className="h-px w-full bg-gradient-to-r from-[color:var(--f1-red)]/55 to-white/20"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p className="garage-hamilton-readable mt-4 font-studio text-[11px] uppercase tracking-[0.18em] text-[color:var(--f1-red)]">
                  {item.year}
                </p>
                <p className="garage-hamilton-readable mt-1.5 max-w-[140px] font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-white">
                  {item.event}
                </p>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  )
}

export default HamiltonSection
