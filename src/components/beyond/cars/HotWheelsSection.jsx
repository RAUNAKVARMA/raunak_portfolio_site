import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]
const ORANGE = '#E87722'

const STATS = [
  { label: 'Since', value: '2006' },
  { label: 'Collection', value: 'Miniature Cars' },
  { label: 'Forever', value: 'My Favorite Hobby' },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
}

function SplitHeadline({ text, reducedMotion }) {
  const words = text.split(' ')
  if (reducedMotion) {
    return <span>{text}</span>
  }
  return (
    <span className="inline">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '115%', rotate: 4, opacity: 0 }}
            whileInView={{ y: '0%', rotate: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.12 + i * 0.08, duration: 0.7, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function HotWheelsSection() {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const rawY = useTransform(scrollYProgress, [0, 1], [48, -48])
  const rawScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04])
  const rawWatermark = useTransform(scrollYProgress, [0, 0.35, 0.7], [0.15, 0.55, 0.2])
  const imageY = useSpring(rawY, { stiffness: 90, damping: 24 })
  const imageScale = useSpring(rawScale, { stiffness: 90, damping: 24 })
  const watermarkOpacity = useSpring(rawWatermark, { stiffness: 70, damping: 22 })

  return (
    <section
      ref={sectionRef}
      className="garage-hotwheels relative overflow-hidden border-t border-white/[0.08] text-white"
      aria-labelledby="hotwheels-heading"
      style={{ ['--hw-orange']: ORANGE }}
    >
      <div className="garage-hotwheels-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="garage-hotwheels-grid pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden />
      <div className="garage-hotwheels-flame pointer-events-none absolute -left-24 top-1/3 h-72 w-72 blur-3xl" aria-hidden />

      <motion.p
        className="pointer-events-none absolute left-1/2 top-[8%] z-[1] -translate-x-1/2 select-none font-display text-[clamp(4rem,18vw,12rem)] font-bold uppercase leading-none tracking-[-0.08em] text-[color:var(--hw-orange)]"
        style={reducedMotion ? { opacity: 0.22 } : { opacity: watermarkOpacity }}
        aria-hidden
      >
        DIECAST
      </motion.p>

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:py-28">
        <motion.div
          className="relative"
          variants={reducedMotion ? undefined : container}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="mb-6 flex items-center gap-3"
            variants={fadeUp}
          >
            <span className="garage-hotwheels-stripe h-[2px] w-10 bg-[color:var(--hw-orange)]" aria-hidden />
            <p className="font-studio text-[11px] uppercase tracking-[0.28em] text-[color:var(--hw-orange)]">
              Childhood collection
            </p>
          </motion.div>

          <motion.h2
            id="hotwheels-heading"
            className="max-w-xl font-display text-[clamp(2.4rem,6vw,4.6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white"
            variants={fadeUp}
          >
            <SplitHeadline text="Hot Wheels never left." reducedMotion={Boolean(reducedMotion)} />
          </motion.h2>

          <motion.p
            className="mt-6 max-w-lg font-studio text-[14px] leading-[24px] text-white/68 sm:text-[15px] sm:leading-[26px]"
            variants={fadeUp}
          >
            I&apos;ve loved cars for as long as I can remember. Since childhood, I&apos;ve been
            collecting miniature cars not because they&apos;re rare or expensive, but because
            each one reminds me of my fascination with automobiles. Over the years, this
            collection has become more than just a hobby; it&apos;s a small part of my story.
            Building this shelf and displaying them is my way of preserving those memories and
            celebrating something I&apos;ve always enjoyed. It&apos;s a reminder that the
            passions we grow up with often stay with us and become a part of who we are.
          </motion.p>

          <motion.div className="mt-10 grid gap-3 sm:grid-cols-3" variants={fadeUp}>
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="garage-hotwheels-stat group relative overflow-hidden border border-white/10 bg-white/[0.03] px-4 py-4"
                whileHover={reducedMotion ? undefined : { y: -4, borderColor: 'rgba(232,119,34,0.55)' }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-[color:var(--hw-orange)]"
                  initial={reducedMotion ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + index * 0.08, duration: 0.55, ease: EASE }}
                  aria-hidden
                />
                <p className="font-studio text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-[1.15rem] font-semibold tracking-tight text-white">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.figure
          className="garage-hotwheels-frame group relative mx-auto w-full max-w-[540px] lg:mr-0"
          initial={reducedMotion ? false : { opacity: 0, y: 36, rotate: -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <div className="garage-hotwheels-frame-glow pointer-events-none absolute -inset-8" aria-hidden />
          <div className="relative overflow-hidden border border-white/12 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <motion.div
              className="origin-center"
              style={
                reducedMotion
                  ? undefined
                  : {
                      y: imageY,
                      scale: imageScale,
                    }
              }
            >
              <img
                src="/images/hotwheels-childhood.png"
                alt="Hot Wheels collection displayed on circular wooden shelves"
                className="aspect-[4/5] h-full w-full object-cover"
                draggable={false}
              />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20"
              aria-hidden
            />

            <motion.div
              className="absolute left-4 top-4 border border-white/15 bg-black/55 px-3 py-2 backdrop-blur-md"
              initial={reducedMotion ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.45, ease: EASE }}
            >
              <p className="font-studio text-[9px] uppercase tracking-[0.22em] text-[color:var(--hw-orange)]">
                Shelf archive
              </p>
            </motion.div>

            <motion.div
              className="absolute inset-x-0 bottom-0 z-20 p-4"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
            >
              <div className="border border-white/12 bg-black/60 px-4 py-3 backdrop-blur-md">
                <p className="font-studio text-[10px] uppercase tracking-[0.2em] text-[color:var(--hw-orange)]">
                  Origin story
                </p>
                <figcaption className="mt-1 font-display text-[1.1rem] font-semibold tracking-tight text-white">
                  The collection that started everything
                </figcaption>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 border-b border-r border-[color:var(--hw-orange)]/70"
            aria-hidden
            initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.45, ease: EASE }}
          />
          <motion.div
            className="pointer-events-none absolute -left-3 -top-3 h-16 w-16 border-l border-t border-[color:var(--hw-orange)]/70"
            aria-hidden
            initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.45, ease: EASE }}
          />
        </motion.figure>
      </div>
    </section>
  )
}

export default HotWheelsSection
