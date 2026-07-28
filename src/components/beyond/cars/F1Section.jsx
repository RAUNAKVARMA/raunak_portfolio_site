import { useEffect, useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]
const F1_RED = '#E10600'

function F1Section({ active = false }) {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const rawY = useTransform(scrollYProgress, [0, 1], [28, -28])
  const rawScale = useTransform(scrollYProgress, [0, 0.45, 1], [1.08, 1, 1.04])
  const videoY = useSpring(rawY, { stiffness: 85, damping: 24 })
  const videoScale = useSpring(rawScale, { stiffness: 85, damping: 24 })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.playsInline = true
    video.loop = true
    video.preload = 'auto'

    const seekVisible = () => {
      if (video.currentTime < 1.2) {
        try {
          video.currentTime = 1.2
        } catch {
          /* */
        }
      }
    }

    const syncPlayback = () => {
      if (reducedMotion) {
        video.pause()
        return
      }

      if (active) {
        seekVisible()
        video.muted = false
        video.volume = 1
        video.play().catch(() => {
          video.muted = true
          video.play().catch(() => {})
        })
      } else {
        video.muted = true
        video.pause()
      }
    }

    syncPlayback()
    video.addEventListener('loadedmetadata', seekVisible)
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      video.removeEventListener('loadedmetadata', seekVisible)
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [active, reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="garage-f1 relative overflow-hidden border-t border-white/[0.08] text-white"
      aria-labelledby="f1-heading"
      style={{ ['--f1-red']: F1_RED }}
    >
      <div className="garage-f1-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="garage-f1-scanlines pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      <motion.div
        className="garage-f1-timing pointer-events-none absolute inset-x-0 top-0 z-[2] h-px origin-left"
        initial={reducedMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        <motion.figure
          className="garage-f1-stage relative overflow-hidden border border-white/10 bg-black shadow-[0_30px_110px_rgba(0,0,0,0.6)]"
          initial={reducedMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="garage-f1-stage-glow pointer-events-none absolute -inset-10" aria-hidden />

          <div className="relative aspect-[16/10] min-h-[420px] overflow-hidden sm:min-h-[520px] lg:aspect-[21/10] lg:min-h-[560px]">
            <motion.div
              className="absolute inset-0 h-[115%] w-full"
              style={reducedMotion ? undefined : { y: videoY, scale: videoScale }}
            >
              <video
                ref={videoRef}
                src="/videos/f1-childhood.mp4?v=4"
                className="h-full w-full object-cover"
                autoPlay
                muted={!active}
                playsInline
                loop
                preload="auto"
                poster="/videos/garage-intro-poster.jpg"
                aria-hidden
                tabIndex={-1}
              />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[color:var(--f1-red)]"
              aria-hidden
            />

            <motion.p
              className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6"
              initial={reducedMotion ? false : { opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <span className="inline-flex items-center border border-white/12 bg-black/40 px-3 py-1.5 font-studio text-[10px] uppercase tracking-[0.24em] text-white/85 backdrop-blur-md sm:text-[11px]">
                Formula 1
              </span>
            </motion.p>
          </div>
        </motion.figure>

        <motion.div
          className="mt-12 max-w-[760px] sm:mt-14"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-[2px] w-10 bg-[color:var(--f1-red)]" aria-hidden />
            <p className="font-studio text-[11px] uppercase tracking-[0.28em] text-[color:var(--f1-red)]">
              Formula 1
            </p>
          </div>

          <h2
            id="f1-heading"
            className="font-display text-[clamp(1.85rem,4.2vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white"
          >
            Race weekends are my favorite part of the week.
          </h2>

          <p className="mt-5 font-studio text-[14px] leading-[24px] text-white/68 sm:text-[15px] sm:leading-[26px]">
            I started following Formula 1 because of Lewis Hamilton, and I&apos;ve supported him
            ever since his Mercedes days. Today, I still wake up for race weekends, now cheering
            him on in Ferrari red. Beyond the speed and strategy, it&apos;s the mindset,
            precision, teamwork, and relentless pursuit of improvement that keep me coming back
            every season.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default F1Section
