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

const letterVariants = {
  hidden: { y: -60, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 320, damping: 22 },
  }),
}

function AnimatedWord({ text, delay = 0 }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <span>{text}</span>
  }

  return (
    <div className="flex flex-wrap">
      {text.split('').map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          custom={index}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: delay + index * 0.06 }}
          className="mr-0.5"
        >
          {letter}
        </motion.span>
      ))}
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
      className="relative flex min-h-screen items-center overflow-hidden bg-hero pb-8 pt-24 sm:pb-10"
    >
      <div className="section-container relative z-10 grid w-full gap-10 pb-10 lg:grid-cols-5 lg:items-center lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-3"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-sm text-green-300">
            <span className="h-2.5 w-2.5 animate-glowPulse rounded-full bg-green-300" />
            Available for opportunities
          </div>

          <p className="mb-1 text-base text-textMuted sm:text-xl">Hi, I&apos;m</p>
          <h1 className="font-heading text-[17vw] font-extrabold leading-[0.86] tracking-tight text-textPrimary sm:text-[96px]">
            <AnimatedWord text="RAUNAK" />
          </h1>
          <h2 className="font-heading text-[17vw] font-extrabold leading-[0.86] tracking-tight text-textPrimary sm:text-[96px]">
            <AnimatedWord text="VARMA" delay={0.1} />
          </h2>

          <div className="mt-4 flex h-8 items-center font-mono text-sm text-accentPrimary sm:mt-5 sm:text-lg">
            <span>{typedText}</span>
            <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-accentPrimary" />
          </div>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:mt-6 sm:text-lg">
            AI Engineer, Researcher, and ML Enthusiast building intelligent systems at the
            intersection of LLMs, multi-agent coordination, and computer vision. Certified Project
            Manager (BITSOM) - from Jaipur, India, creating AI with real-world impact.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton
              as="a"
              href="#projects"
              className="bg-accentPrimary px-6 py-3 font-semibold text-bgPrimary shadow-cyan hover:scale-[1.01]"
            >
              View My Work
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#contact"
              className="border border-accentPrimary/60 px-6 py-3 font-semibold text-accentPrimary hover:bg-accentPrimary/10"
            >
              Download Resume
            </MagneticButton>
            <div className="flex items-center gap-2">
              {[
                { icon: RiGithubLine, href: 'https://github.com' },
                { icon: RiLinkedinLine, href: 'https://linkedin.com' },
                { icon: RiMailLine, href: 'mailto:raunak@example.com' },
              ].map(({ icon: Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borderColor text-textPrimary transition-all duration-300 hover:-translate-y-1 hover:border-accentPrimary hover:text-accentPrimary"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="relative mx-auto mt-4 h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] lg:col-span-2 lg:mt-0"
        >
          <div className={`absolute inset-0 rounded-full border border-accentPrimary/40 ${prefersReducedMotion ? '' : 'animate-slowSpin'}`} />
          <div className={`absolute inset-6 rounded-full border border-accentPrimary/25 ${prefersReducedMotion ? '' : 'animate-reverseSpin'}`} />
          <div className="absolute inset-10 rounded-full border border-accentPrimary/20 bg-cyan-500/5">
            <div className="grid h-full place-items-center rounded-full">
              <div className="relative h-44 w-44">
                <div className="absolute left-10 top-9 h-4 w-4 rounded-full bg-accentPrimary/90" />
                <div className="absolute right-9 top-14 h-3 w-3 rounded-full bg-accentPrimary/70" />
                <div className="absolute left-14 top-20 h-2 w-2 rounded-full bg-accentPrimary/70" />
                <div className="absolute bottom-11 right-12 h-4 w-4 rounded-full bg-accentPrimary/90" />
                <div className="absolute bottom-16 left-12 h-[2px] w-20 rotate-12 bg-accentPrimary/40" />
                <div className="absolute right-[68px] top-14 h-[2px] w-16 rotate-[45deg] bg-accentPrimary/40" />
                <div className="absolute left-10 top-[90px] h-[2px] w-[100px] -rotate-[18deg] bg-accentPrimary/35" />
              </div>
            </div>
          </div>

          {orbitBadges.map((badge, index) => (
            <div
              key={badge}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${index * 90}deg) translate(170px) rotate(-${index * 90}deg)`,
                animation: prefersReducedMotion ? 'none' : `floatY ${4 + index * 0.5}s ease-in-out infinite`,
              }}
            >
              <span className="rounded-full border border-accentPrimary/40 bg-bgSecondary/80 px-3 py-1 font-mono text-xs text-accentPrimary">
                {badge}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {!hideScrollCue && !prefersReducedMotion && (
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-textMuted">
          <RiArrowDownLine className="mx-auto animate-bounce text-2xl text-accentPrimary" />
          <p className="text-xs uppercase tracking-[0.2em]">Scroll to explore</p>
        </div>
      )}
    </section>
  )
}

export default Hero
