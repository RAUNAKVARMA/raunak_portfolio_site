import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGLTF } from '@react-three/drei'
import {
  motion,
  useReducedMotion,
} from 'framer-motion'
import FavoriteCarsShowcase from '../components/beyond/cars/FavoriteCarsShowcase'
import F1Section from '../components/beyond/cars/F1Section'
import GarageMusic from '../components/beyond/cars/GarageMusic'
import HamiltonSection from '../components/beyond/cars/HamiltonSection'
import HotWheelsSection from '../components/beyond/cars/HotWheelsSection'
import AutoPlayVideo from '../components/ui/AutoPlayVideo'
import { favoriteCars } from '../data/favoriteCars'
import { getInterestById } from '../data/interests'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useLenis } from '../providers/SmoothScrollProvider'

const EASE = [0.16, 1, 0.3, 1]
const GOLD = '#CA8A04'

const CAR_LABELS = {
  supra: 'Supra',
  stradale: 'Stradale',
  bugatti: 'La Voiture Noire',
  spyder: '918 Spyder',
  aventador: 'Aventador',
  m4: 'M4 F82',
  valour: 'Valour',
}

function useSectionInView(ref, options = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        threshold: options.threshold ?? 0.55,
        rootMargin: options.rootMargin ?? '-10% 0px -10% 0px',
      },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, options.rootMargin, options.threshold])

  return inView
}

function SplitWords({ text, className, delay = 0, reducedMotion }) {
  const words = text.split(' ')
  if (reducedMotion) {
    return <span className={className}>{text}</span>
  }
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ delay: delay + i * 0.07, duration: 0.65, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function GarageIntro({ tag, reducedMotion, onJumpToCar }) {
  return (
    <header className="garage-intro relative flex min-h-[100svh] flex-col overflow-hidden bg-[#030303]">
      <div className="garage-intro-video pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {reducedMotion ? (
          <img
            src="/videos/garage-intro-poster.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
        ) : (
          <AutoPlayVideo
            src="/videos/garage-intro.mp4"
            poster="/videos/garage-intro-poster.jpg"
            aria-label=""
            pauseWhenHidden={false}
            loop
            className="garage-intro-video-el absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
      </div>

      <div className="garage-intro-scrim pointer-events-none absolute inset-0 z-[1]" aria-hidden />

      <div className="pointer-events-none absolute inset-x-0 top-[8%] z-[2] flex h-[36%] items-start justify-center overflow-hidden px-2 pt-6 sm:h-[42%] sm:pt-10" aria-hidden>
        <motion.p
          className="garage-intro-watermark-fill max-w-full select-none truncate font-display text-[clamp(3.25rem,18vw,11rem)] font-bold uppercase leading-none tracking-[-0.08em]"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          CARS
        </motion.p>
      </div>

      <div className="relative z-10 mt-auto w-full pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16">
          <div>
            <motion.p
              className="font-studio text-[11px] uppercase tracking-[0.32em] text-[color:var(--garage-gold)]"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: EASE }}
            >
              Interests — {tag} · The Garage
            </motion.p>

            <h1 className="mt-5 break-words font-display text-[clamp(2.25rem,10vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white sm:mt-6 sm:leading-[0.92]">
              <SplitWords text="Built on" delay={0.16} reducedMotion={reducedMotion} />
              <br />
              <span className="relative inline-block max-w-full">
                <SplitWords text="obsession" delay={0.3} reducedMotion={reducedMotion} />
                <motion.span
                  className="inline-block text-[color:var(--garage-gold)]"
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.62, duration: 0.4, ease: EASE }}
                >
                  .
                </motion.span>
              </span>
            </h1>

            <motion.p
              className="mt-5 break-words font-display text-[clamp(1.2rem,5vw,2.1rem)] font-semibold tracking-tight text-white sm:mt-6"
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.55, ease: EASE }}
            >
              My top 7 favourite cars
            </motion.p>

            <motion.p
              className="mt-4 max-w-md break-words font-studio text-[13px] leading-[21px] text-white/55 sm:mt-5 sm:text-[14px] sm:leading-[22px]"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.5, ease: EASE }}
            >
              Obsessed with cars since I was two — I learned their names before
              almost anything else. Still collecting{' '}
              <span className="text-[color:var(--garage-gold)]">Hot Wheels</span>, still an
              F1 fan, still reading Overdrive every month.
            </motion.p>
          </div>

          <motion.ol
            className="garage-intro-roster space-y-0 border-t border-white/10"
            initial={reducedMotion ? false : 'hidden'}
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
            }}
            aria-label="Top seven favourite cars"
          >
            {favoriteCars.map((car, index) => (
              <motion.li
                key={car.id}
                className="group garage-intro-roster-item border-b border-white/10"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: EASE },
                  },
                }}
              >
                <button
                  type="button"
                  onClick={() => onJumpToCar(car.id)}
                  className="flex w-full cursor-pointer items-baseline justify-between gap-4 py-4 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--garage-gold)]"
                  data-cursor-hover="true"
                >
                  <div className="flex min-w-0 items-baseline gap-4">
                    <span className="shrink-0 font-studio text-[11px] tracking-[0.2em] text-[color:var(--garage-gold)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate font-display text-[clamp(1.1rem,2.6vw,1.55rem)] font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-[color:var(--garage-gold)]">
                      {CAR_LABELS[car.id] ?? car.short}
                    </span>
                  </div>
                  <span className="shrink-0 font-studio text-[11px] tracking-[0.16em] text-white/30 transition-colors duration-200 group-hover:text-white/55">
                    {car.year}
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ol>
        </div>

        <motion.div
          className="mx-auto mt-10 flex w-full max-w-[1180px] items-end justify-between gap-6 border-t border-white/[0.08] px-5 pt-5 sm:px-8"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.55 }}
        >
          <div className="flex items-center gap-3">
            {!reducedMotion && (
              <motion.span
                className="block h-9 w-px origin-top bg-gradient-to-b from-[color:var(--garage-gold)] via-[color:var(--garage-gold)]/50 to-transparent"
                aria-hidden
                animate={{ scaleY: [0.45, 1, 0.45], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div>
              <p className="font-studio text-[10px] uppercase tracking-[0.3em] text-white/45">
                Scroll to enter
              </p>
              <p className="mt-1 font-studio text-[10px] uppercase tracking-[0.2em] text-white/25">
                Drag to orbit inside
              </p>
            </div>
          </div>

          <p className="hidden font-studio text-[10px] uppercase tracking-[0.24em] text-white/25 sm:block">
            07 machines · Full 3D
          </p>
        </motion.div>
      </div>
    </header>
  )
}

function CarsPage() {
  const cars = getInterestById('cars')
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis()
  const f1SectionRef = useRef(null)
  const f1InView = useSectionInView(f1SectionRef, {
    threshold: 0.2,
    rootMargin: '-5% 0px -5% 0px',
  })
  const [garageMusicReady, setGarageMusicReady] = useState(false)
  useDocumentTitle('Cars — Beyond')

  useEffect(() => {
    // Don't fight the intro video — warm first car only after a quiet delay
    const timer = window.setTimeout(() => {
      try {
        useGLTF.preload(favoriteCars[0]?.modelUrl)
      } catch {
        /* */
      }
    }, 2800)
    return () => window.clearTimeout(timer)
  }, [])

  const jumpToCar = (id) => {
    const el = document.getElementById(`garage-${id}`)
    if (!el) return
    const lenis = lenisRef?.current
    if (lenis && !reducedMotion) {
      lenis.scrollTo(el, { offset: 0, duration: 1.2 })
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }

  if (!cars) return null

  return (
    <div className="garage-root min-h-screen bg-black" style={{ ['--garage-gold']: GOLD }}>
      {garageMusicReady ? <GarageMusic suspended={f1InView} /> : null}
      <GarageIntro
        tag={cars.tag}
        reducedMotion={Boolean(reducedMotion)}
        onJumpToCar={jumpToCar}
      />

      <FavoriteCarsShowcase onEnter={() => setGarageMusicReady(true)} />
      <HotWheelsSection />
      <div ref={f1SectionRef}>
        <F1Section />
      </div>
      <HamiltonSection />

      <section
        className="border-t border-white/[0.08] bg-[#050505] py-20 text-white"
        aria-labelledby="cars-story-heading"
      >
        <div className="mx-auto w-full max-w-[920px] px-5 sm:px-8">
          <h2
            id="cars-story-heading"
            className="font-studio text-[11px] uppercase tracking-[0.2em] text-[color:var(--garage-gold)]"
          >
            Note
          </h2>

          <div className="mt-6 max-w-2xl space-y-5">
            {cars.story.map((paragraph, index) => (
              <motion.p
                key={paragraph}
                className="font-studio text-[13px] leading-[21px] text-white/70"
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: 0.04 + index * 0.05, duration: 0.4, ease: EASE }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <dl className="mt-10 grid gap-px border border-white/[0.1] bg-white/[0.1] sm:grid-cols-2 lg:grid-cols-4">
            {cars.facts.map((fact) => (
              <div key={fact.label} className="bg-[#050505] px-4 py-4">
                <dt className="font-studio text-[10px] uppercase tracking-wider text-white/40">
                  {fact.label}
                </dt>
                <dd className="mt-1 font-studio text-[12px] text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Cars themes">
            {cars.tags.map((tag) => (
              <li
                key={tag}
                className="border border-white/12 px-3 py-1.5 font-studio text-[10px] uppercase tracking-wider text-white/65 transition-colors duration-200 hover:border-[color:var(--garage-gold)]/50 hover:text-[color:var(--garage-gold)]"
              >
                {tag}
              </li>
            ))}
          </ul>

          <Link
            to="/beyond"
            className="mt-12 inline-flex cursor-pointer font-studio text-[12px] text-white/60 underline-offset-4 transition-colors duration-200 hover:text-[color:var(--garage-gold)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--garage-gold)]"
            data-cursor-hover="true"
          >
            ← Back to interests
          </Link>
        </div>
      </section>
    </div>
  )
}

export default CarsPage
