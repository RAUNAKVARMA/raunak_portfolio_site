import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { RiArrowDownLine, RiGithubLine, RiLinkedinLine, RiMailLine } from 'react-icons/ri'
import MagneticButton from './ui/MagneticButton'
import SpacePlanet from './ui/SpacePlanet'
import { useTypewriter } from '../hooks/useTypewriter'

const roles = [
  'AI Engineer',
  'Researcher',
  'ML Enthusiast',
  'LLM Systems Builder',
  'Multi-Agent Intelligence',
  'Certified Project Manager (BITSOM)',
]

const lineReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  }),
}

/** Always-visible name: solid paint + neon (gradient-on-letters breaks in many browsers). */
const nameClass =
  'block font-heading font-extrabold leading-[0.92] tracking-[-0.04em] text-[clamp(2.75rem,11vw,6.5rem)] text-white'

const nameGlow = {
  textShadow:
    '0 0 42px rgba(34,211,238,0.55), 0 0 100px rgba(168,85,247,0.45), 0 0 160px rgba(236,72,153,0.2)',
}

function HeadlineName() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <h1 className="font-heading">
        <span className={nameClass} style={nameGlow}>
          RAUNAK
        </span>
        <span className={`${nameClass} mt-2 block sm:mt-3`} style={nameGlow}>
          VARMA
        </span>
      </h1>
    )
  }

  return (
    <h1 className="font-heading">
      <motion.span
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className={nameClass}
        style={nameGlow}
      >
        RAUNAK
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`${nameClass} mt-2 block sm:mt-3`}
        style={nameGlow}
      >
        VARMA
      </motion.span>
    </h1>
  )
}

function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const typedText = useTypewriter(roles)
  const [hideScrollCue, setHideScrollCue] = useState(false)
  const orbitBadges = useMemo(() => ['Python', 'LLMs', 'RAG', 'MARL'], [])

  useEffect(() => {
    const onScroll = () => setHideScrollCue(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-12 pt-[5.5rem] sm:pb-16 sm:pt-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#030712_0%,#0b1224_45%,#030712_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_10%,rgba(192,38,211,0.12),transparent_50%)]" />
      <div className="hero-grid-space pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

      <div className="section-container relative z-10 grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 xl:col-span-7"
        >
          <motion.p
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-fuchsia-300/80"
          >
            Deep space · AI systems
          </motion.p>

          <motion.div
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-500/[0.08] px-4 py-2 text-sm text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.15)] backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]" />
            </span>
            <span className="font-medium tracking-wide">Available for opportunities</span>
          </motion.div>

          <motion.p
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mb-2 text-sm text-slate-400 sm:text-base"
          >
            Hi, I&apos;m
          </motion.p>

          <div className="relative">
            <div className="pointer-events-none absolute -left-4 top-1/2 hidden h-[min(200px,50%)] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-fuchsia-500/50 to-cyan-400/40 md:block" />
            <HeadlineName />
          </div>

          <motion.div
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={3}
            className="relative mt-6 min-h-[3rem] select-none sm:mt-8"
          >
            <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-cyan-500/40 via-fuchsia-500/35 to-purple-600/30 opacity-70 blur-[1px]" />
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,rgba(34,211,238,0.04)_3px,rgba(34,211,238,0.04)_4px)]" />
            <div className="relative flex min-h-[2.75rem] items-center overflow-hidden rounded-xl border border-cyan-400/25 bg-gradient-to-r from-slate-950/90 via-indigo-950/50 to-fuchsia-950/40 px-4 py-3 font-mono text-sm shadow-[0_0_50px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:text-base">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300/90">Signal</span>
              <span className="mx-3 h-4 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
              <span className="text-slate-400">I am </span>
              <span className="ml-1.5 font-semibold text-cyan-100 [text-shadow:0_0_20px_rgba(34,211,238,0.55),0_0_42px_rgba(232,121,249,0.35)]">
                {typedText}
              </span>
              <span
                className="ml-1 inline-block h-[1.1em] w-[3px] animate-pulse rounded-sm bg-gradient-to-b from-fuchsia-400 via-white to-cyan-400 align-middle shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                aria-hidden
              />
            </div>
          </motion.div>

          <motion.p
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-6 max-w-xl text-pretty text-[15px] leading-[1.75] text-slate-400 sm:mt-8 sm:max-w-2xl sm:text-[17px]"
          >
            AI Engineer, Researcher, and ML Enthusiast building intelligent systems at the intersection
            of LLMs, multi-agent coordination, and computer vision. Certified Project Manager (BITSOM)
            — Jaipur, India — shipping AI with measurable real-world impact.
          </motion.p>

          <motion.div
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-9 flex flex-wrap items-center gap-3 sm:mt-10"
          >
            <MagneticButton
              as="a"
              href="#projects"
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-shadow hover:shadow-[0_0_55px_rgba(192,38,211,0.45)]"
            >
              View my work
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#contact"
              className="border border-fuchsia-500/40 bg-white/[0.03] px-7 py-3.5 text-[15px] font-semibold text-slate-100 backdrop-blur-sm hover:border-cyan-400/50 hover:bg-cyan-500/10"
            >
              Download resume
            </MagneticButton>
            <div className="flex items-center gap-2 pl-1">
              {[
                { icon: RiGithubLine, href: 'https://github.com/RAUNAKVARMA' },
                { icon: RiLinkedinLine, href: 'https://linkedin.com/in/raunakvarma' },
                { icon: RiMailLine, href: 'mailto:raunak.varma.ai@gmail.com' },
              ].map(({ icon: Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-200 hover:shadow-[0_0_24px_rgba(192,38,211,0.25)]"
                >
                  <Icon className="text-lg" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center lg:col-span-5 xl:col-span-5"
        >
          <div className="relative w-full max-w-[420px]">
            <SpacePlanet reducedMotion={prefersReducedMotion} />

            {orbitBadges.map((badge, index) => (
              <div
                key={badge}
                className="absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotate(${index * 90}deg) translate(clamp(118px, 36vw, 178px)) rotate(-${index * 90}deg)`,
                }}
              >
                <span
                  className={`rounded-full border border-cyan-400/40 bg-slate-950/90 px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-cyan-200 shadow-[0_4px_28px_rgba(0,0,0,0.5)] backdrop-blur-md sm:text-xs ${
                    prefersReducedMotion ? '' : 'animate-floatY'
                  }`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {!hideScrollCue && !prefersReducedMotion && (
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center sm:bottom-10">
          <div className="flex flex-col items-center gap-2 text-textMuted">
            <span className="h-8 w-px bg-gradient-to-b from-transparent via-fuchsia-400/60 to-cyan-400" />
            <RiArrowDownLine className="text-xl text-cyan-300" />
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500">Explore</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
