import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { RiArrowDownLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import MagneticButton from './ui/MagneticButton'
import MStripe from './ui/MStripe'
import Starfield from './ui/Starfield'
import FluidCanvas from './ui/FluidCanvas'
import { useSceneProgress } from '../providers/SceneProgressProvider'

const EASE = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 1, ease: EASE },
  }),
}

const hud = [
  { label: 'Status', value: 'Open to roles' },
  { label: 'Published', value: '5 IEEE Papers' },
  { label: 'Flagship', value: 'Cosmic RAG' },
]

function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const [hideScrollCue, setHideScrollCue] = useState(false)
  const { registerSection } = useSceneProgress()

  useEffect(() => {
    const el = document.getElementById('hero')
    if (el) registerSection('hero', el)
    return () => registerSection('hero', null)
  }, [registerSection])

  useEffect(() => {
    const onScroll = () => setHideScrollCue(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="hero" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-transparent">
      <Starfield />
      <div className="pointer-events-none absolute inset-0 hero-atmosphere opacity-30" aria-hidden />
      <FluidCanvas />
      <div className="pointer-events-none absolute inset-0 hero-vignette z-[6]" aria-hidden />

      <div className="pointer-events-none absolute right-6 top-28 z-10 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 lg:block">
        {hud.map((item) => (
          <div key={item.label} className="mb-4 text-right">
            <p className="text-[#1c69d4]">{item.label}</p>
            <p className="mt-1 text-white/70">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="section-container relative z-10 flex min-h-[100svh] flex-col justify-end pb-0 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="pb-12 pt-32 sm:pb-16 sm:pt-36">
          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={0}
            className="section-eyebrow mb-8"
          >
            AI Engineer & Researcher
          </motion.p>

          <motion.h1
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-heading text-[clamp(3.5rem,13vw,9rem)] font-bold uppercase leading-[0.88] tracking-[0.07em] text-white"
          >
            Raunak
            <br />
            Varma
          </motion.h1>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-8 font-mono text-[clamp(0.75rem,2vw,1rem)] uppercase tracking-[0.35em] text-white/75"
          >
            Build · Research · Launch
          </motion.p>

          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-12"
          >
            <MagneticButton as={Link} to="/work" data-cursor-hover="true" className="ghost-btn">
              View Work
            </MagneticButton>
          </motion.div>
        </div>

        <div className="relative hidden min-h-[40vh] lg:block" aria-hidden>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(28,105,212,0.2),transparent_65%)]" />
          <p className="absolute bottom-8 right-0 font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">
            Orbital mesh · Live
          </p>
        </div>

        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={4}
          className="relative border-t border-white/[0.12] bg-black lg:col-span-2"
        >
          <div className="grid grid-cols-2 gap-px bg-white/[0.12] sm:grid-cols-4">
            {[
              { label: 'Publications', value: '05' },
              { label: 'Projects', value: '03' },
              { label: 'Startups', value: '01' },
              { label: 'Research', value: '02 YRS' },
            ].map((item) => (
              <div key={item.label} className="bg-[#0a0a0a] px-4 py-5 sm:px-8 sm:py-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#1c69d4]">{item.label}</p>
                <p className="mt-2 font-heading text-3xl font-bold tracking-wide text-white sm:text-4xl">{item.value}</p>
              </div>
            ))}
          </div>
          <MStripe />
        </motion.div>
      </div>

      {!hideScrollCue && !prefersReducedMotion && (
        <div className="absolute bottom-36 left-1/2 z-20 -translate-x-1/2 sm:bottom-40">
          <div className="flex flex-col items-center gap-2">
            <span className="h-10 w-px bg-gradient-to-b from-transparent via-[#1c69d4] to-transparent" />
            <RiArrowDownLine className="text-lg text-white/60" />
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">Scroll</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
