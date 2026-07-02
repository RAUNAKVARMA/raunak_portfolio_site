import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  RiArrowDownLine,
  RiArrowRightUpLine,
  RiBookOpenLine,
  RiCodeBoxLine,
  RiFlaskLine,
  RiGithubLine,
  RiGraduationCapLine,
  RiLinkedinLine,
  RiMailLine,
  RiRocketLine,
} from 'react-icons/ri'
import GlassPanel from './ui/GlassPanel'
import MagneticButton from './ui/MagneticButton'
import { useTypewriter } from '../hooks/useTypewriter'
import { useSceneProgress } from '../providers/SceneProgressProvider'

const skillPills = ['Python', 'LLMs', 'RAG', 'PyTorch', 'Multi-Agent', 'Research']

const roles = [
  'AI Engineer',
  'Researcher',
  'ML Enthusiast',
  'LLM Systems Builder',
  'AI Intern @ EY',
  'Google PM Certified',
]

const metrics = [
  { label: 'Publications', value: '5', icon: RiBookOpenLine },
  { label: 'Projects', value: '3', icon: RiCodeBoxLine },
  { label: 'Startups', value: '1', icon: RiRocketLine },
  { label: 'Research Yrs', value: '2', icon: RiFlaskLine },
]

const socialLinks = [
  { icon: RiGithubLine, href: 'https://github.com/RAUNAKVARMA', label: 'GitHub' },
  { icon: RiLinkedinLine, href: 'https://www.linkedin.com/in/raunak-varma-8656382b2/', label: 'LinkedIn' },
  { icon: RiMailLine, href: 'mailto:raunaknitinvarma@gmail.com', label: 'Email' },
  {
    icon: RiGraduationCapLine,
    href: 'https://scholar.google.com/citations?user=tlqu2IoAAAAJ',
    label: 'Google Scholar',
  },
]

const EASE = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.07, duration: 0.85, ease: EASE },
  }),
}

function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const typedText = useTypewriter(roles)
  const [hideScrollCue, setHideScrollCue] = useState(false)
  const { registerSection, canvasReady } = useSceneProgress()

  useEffect(() => {
    const el = document.getElementById('hero')
    if (el) registerSection('hero', el)
    return () => registerSection('hero', null)
  }, [registerSection])

  useEffect(() => {
    const onScroll = () => setHideScrollCue(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24 sm:pt-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-hero" aria-hidden />

      <div className="section-container relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="lg:col-span-7"
          >
            <GlassPanel className="p-6 sm:p-8 lg:p-10">
              <motion.p
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={0}
                className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-indigo-300/90"
              >
                AI systems · Research & build
              </motion.p>

              <motion.div
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={1}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-2 text-sm text-emerald-100"
              >
                <span className="relative flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-medium">Open to AI engineering & research roles</span>
              </motion.div>

              <motion.p variants={reveal} initial="hidden" animate="visible" custom={2} className="mb-2 text-sm text-textMuted">
                Hi, I&apos;m
              </motion.p>

              <motion.div variants={reveal} initial="hidden" animate="visible" custom={3}>
                <h1 className="font-heading text-[clamp(2.75rem,9vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
                  <span className="text-gradient-indigo">Raunak</span>
                  <br />
                  <span className="text-gradient-indigo">Varma</span>
                </h1>
                <p className="mt-4 font-mono text-sm text-indigo-200/80 sm:text-base">
                  AI Engineer · Researcher · Builder
                </p>
              </motion.div>

              <motion.div
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={4}
                className="mt-7 min-h-[2.75rem] rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-mono text-sm sm:text-base"
              >
                <span className="text-textMuted">I am </span>
                <span className="font-medium text-textPrimary">{typedText}</span>
                {!prefersReducedMotion && (
                  <span className="ml-1 inline-block h-[1em] w-0.5 animate-pulse bg-indigo-400 align-middle" aria-hidden />
                )}
              </motion.div>

              <motion.p
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={5}
                className="mt-6 max-w-xl text-[15px] leading-relaxed text-textMuted sm:text-[17px]"
              >
                Building intelligent systems at the intersection of LLMs, multi-agent coordination, and computer
                vision — from RAG platforms to published research. Based in Jaipur, India.
              </motion.p>

              <motion.div
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={6}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <MagneticButton
                  as="a"
                  href="#projects"
                  data-cursor-hover="true"
                  className="inline-flex items-center gap-2 bg-indigo-500 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] hover:bg-indigo-400"
                >
                  View my work
                  <RiArrowRightUpLine />
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="#contact"
                  data-cursor-hover="true"
                  className="border border-white/[0.15] bg-white/[0.04] px-7 py-3.5 text-[15px] font-semibold text-textPrimary backdrop-blur-sm hover:border-indigo-400/40"
                >
                  Get in touch
                </MagneticButton>
              </motion.div>

              <motion.div
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={7}
                className="mt-6 flex flex-wrap items-center gap-2"
              >
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    data-cursor-hover="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-textPrimary transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:text-indigo-200"
                  >
                    <Icon className="text-lg" />
                  </a>
                ))}
              </motion.div>

              <motion.div
                variants={reveal}
                initial="hidden"
                animate="visible"
                custom={8}
                className="mt-6 flex flex-wrap gap-2"
              >
                {skillPills.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-textMuted sm:text-[11px]"
                  >
                    {label}
                  </span>
                ))}
              </motion.div>
            </GlassPanel>
          </motion.div>

          <motion.aside
            initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: canvasReady ? 1 : 0.6, x: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: EASE }}
            className="lg:col-span-5"
            aria-label="Portfolio metrics"
          >
            <GlassPanel className="p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-indigo-300/80">At a glance</p>
                  <p className="mt-1 text-sm font-medium text-slate-200">Research & engineering</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {metrics.map((item) => (
                  <div key={item.label} className="glass-card p-3">
                    <div className="flex items-center gap-2 text-indigo-300/80">
                      <item.icon className="text-base" aria-hidden />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-textMuted">{item.label}</span>
                    </div>
                    <p className="mt-2 font-heading text-3xl font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.aside>
        </div>
      </div>

      {!hideScrollCue && !prefersReducedMotion && (
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
          <div className="flex flex-col items-center gap-2 text-textMuted">
            <span className="h-8 w-px bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent" />
            <RiArrowDownLine className="text-xl text-indigo-300" />
            <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Scroll</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
