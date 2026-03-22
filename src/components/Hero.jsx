import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { RiArrowDownLine, RiGithubLine, RiLinkedinLine, RiMailLine } from 'react-icons/ri'
import MagneticButton from './ui/MagneticButton'
import { useTypewriter } from '../hooks/useTypewriter'

const roles = [
  'AI Engineer',
  'Researcher',
  'ML Enthusiast',
  'LLM Systems Builder',
  'Multi-Agent Intelligence',
  'Certified Project Manager (BITSOM)',
]

/** Per-word stagger — letters never wrap mid-name (was flex-wrap → “K” alone) */
const letterVariants = {
  hidden: { y: -36, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.035, type: 'spring', stiffness: 380, damping: 26 },
  }),
}

function AnimatedWord({ text, delay = 0 }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <span className="hero-headline-text">{text}</span>
  }

  return (
    <span className="hero-headline-text inline-flex flex-nowrap whitespace-nowrap">
      {text.split('').map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          custom={index}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: delay + index * 0.035 }}
          className="inline-block"
          style={{ willChange: 'transform, opacity' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  )
}

const lineReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  }),
}

/** SVG neural motif — reads “designed” not placeholder */
function NeuralHeroVisual({ reducedMotion }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(100%,380px)]">
      {/* Ambient glow */}
      <div
        className={`pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-br from-cyan-500/20 via-transparent to-amber-500/10 blur-3xl ${reducedMotion ? '' : 'animate-meshShift'}`}
      />
      <div className="hero-vignette pointer-events-none absolute inset-0 rounded-full" />

      <svg
        className="relative z-[1] h-full w-full"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="neuralStroke" x1="0" y1="0" x2="200" y2="200">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.35" />
          </linearGradient>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer rings — rotate around true center */}
        <g transform="translate(100 100)">
          <g className={reducedMotion ? '' : 'animate-slowSpin'}>
            <circle
              r="88"
              stroke="url(#neuralStroke)"
              strokeWidth="0.5"
              opacity="0.4"
              fill="none"
            />
          </g>
        </g>
        <circle cx="100" cy="100" r="72" stroke="#00d4ff" strokeOpacity="0.12" strokeWidth="0.75" fill="none" />
        <g transform="translate(100 100)">
          <g className={reducedMotion ? '' : 'animate-reverseSpin'}>
            <circle
              r="56"
              stroke="#00d4ff"
              strokeOpacity="0.22"
              strokeWidth="0.5"
              strokeDasharray="4 8"
              fill="none"
            />
          </g>
        </g>

        {/* Graph edges */}
        {[
          'M40 120 Q100 40 160 85',
          'M35 75 Q100 130 165 125',
          'M70 165 Q100 55 130 40',
          'M55 45 L145 155',
          'M155 50 L45 150',
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#neuralStroke)"
            strokeWidth="0.85"
            strokeLinecap="round"
            opacity="0.5"
            filter="url(#glow)"
            strokeDasharray="5 9"
            style={{ strokeDashoffset: i * 6 }}
          />
        ))}

        {/* Nodes */}
        {[
          [100, 48],
          [152, 78],
          [138, 138],
          [62, 132],
          [48, 72],
          [100, 100],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5" fill="#080b10" stroke="#00d4ff" strokeWidth="1.2" opacity="0.95" />
            <circle cx={cx} cy={cy} r="2.2" fill="#00d4ff" opacity="0.85" />
          </g>
        ))}
      </svg>

      {/* Inner glass disc */}
      <div className="pointer-events-none absolute inset-[18%] rounded-full border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-[2px]" />
    </div>
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
      {/* Layered background */}
      <div className="pointer-events-none absolute inset-0 bg-hero" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(0,212,255,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_20%,rgba(245,158,11,0.07),transparent_50%)]" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-[0.65]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

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
            className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-400/70"
          >
            Neural systems · Portfolio
          </motion.p>

          {/* Status pill — glass + ring */}
          <motion.div
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-500/[0.07] px-4 py-2 text-sm text-emerald-200/95 shadow-[0_0_24px_rgba(52,211,153,0.12)] backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </span>
            <span className="font-medium tracking-wide">Available for opportunities</span>
          </motion.div>

          <motion.p
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mb-2 text-sm text-textMuted sm:text-base"
          >
            Hi, I&apos;m
          </motion.p>

          {/* Headline: two deliberate lines, nowrap per line, fluid clamp */}
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 top-1/2 hidden h-[min(200px,50%)] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent md:block" />
            <h1 className="font-heading font-extrabold leading-[0.92] tracking-[-0.04em]">
              <span className="block text-[clamp(2.65rem,10.5vw,6.25rem)]">
                <AnimatedWord text="RAUNAK" />
              </span>
              <span className="mt-1 block text-[clamp(2.65rem,10.5vw,6.25rem)] sm:mt-2">
                <AnimatedWord text="VARMA" delay={0.08} />
              </span>
            </h1>
          </div>

          {/* Role ticker */}
          <motion.div
            variants={lineReveal}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-6 flex min-h-[2rem] items-center border-l-2 border-accentPrimary/50 pl-4 font-mono text-sm text-accentPrimary sm:mt-8 sm:min-h-[2.25rem] sm:text-base"
          >
            <span className="text-textMuted">I build </span>
            <span className="ml-1.5 font-semibold text-accentPrimary">
              {typedText}
              <span className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse bg-accentPrimary align-[-0.1em]" />
            </span>
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
              className="bg-accentPrimary px-7 py-3.5 text-[15px] font-semibold text-bgPrimary shadow-[0_0_32px_rgba(0,212,255,0.35)] transition-shadow hover:shadow-[0_0_44px_rgba(0,212,255,0.45)]"
            >
              View my work
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#contact"
              className="border border-accentPrimary/55 bg-white/[0.02] px-7 py-3.5 text-[15px] font-semibold text-slate-100 backdrop-blur-sm hover:border-accentPrimary/80 hover:bg-accentPrimary/10"
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-accentPrimary/50 hover:bg-accentPrimary/10 hover:text-accentPrimary hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
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
          <div className="relative w-full max-w-[400px]">
            <NeuralHeroVisual reducedMotion={prefersReducedMotion} />

            {orbitBadges.map((badge, index) => (
              <div
                key={badge}
                className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotate(${index * 90}deg) translate(clamp(118px, 36vw, 178px)) rotate(-${index * 90}deg)`,
                }}
              >
                <span
                  className={`rounded-full border border-cyan-400/35 bg-[#0d1117]/90 px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-cyan-300 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md sm:text-xs ${
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
            <span className="h-8 w-px bg-gradient-to-b from-transparent via-accentPrimary/60 to-accentPrimary" />
            <RiArrowDownLine className="text-xl text-accentPrimary/90" />
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500">Explore</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
