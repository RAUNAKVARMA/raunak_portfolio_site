import { useEffect, useRef } from 'react'
import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { experienceTimeline } from '../Experience'
import { publications } from '../Research'
import GlassCard from '../ui/GlassCard'
import SectionReveal from '../layout/SectionReveal'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

function ExperienceTimeline() {
  const lineRef = useRef(null)
  const sectionRef = useRef(null)
  const { enableGsapScrub } = useReducedMotionProfile()

  useEffect(() => {
    if (!enableGsapScrub || !lineRef.current || !sectionRef.current) return undefined

    registerGsap()
    gsap.set(lineRef.current, { scaleY: 0, transformOrigin: 'top center' })

    const tween = gsap.to(lineRef.current, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [enableGsapScrub])

  return (
    <section id="experience" className="py-24" ref={sectionRef}>
      <SectionReveal className="section-container">
        <div className="relative mb-14" data-reveal>
          <span className="section-number">04</span>
          <h2 className="section-title">Experience & Research</h2>
        </div>

        <div className="relative pl-8 md:pl-12">
          <div
            ref={lineRef}
            className="absolute left-2 top-2 h-[calc(100%-10px)] w-px origin-top bg-gradient-to-b from-indigo-400/80 via-indigo-400/40 to-transparent md:left-4"
            aria-hidden
          />

          <div className="space-y-8">
            {experienceTimeline.map((item) => (
              <GlassCard key={`${item.role}-${item.company}`} className="relative p-6" data-reveal>
                <span className="absolute -left-[31px] top-8 h-3.5 w-3.5 rounded-full bg-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.5)] md:-left-[41px]" />

                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-heading text-xl font-bold sm:text-2xl">
                    {item.role} — {item.company}
                  </h3>
                  <span className="font-mono text-sm text-indigo-300/80">{item.period}</span>
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
                    {item.tag}
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-slate-300">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc pl-1 marker:text-indigo-400">
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-textMuted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div id="research" className="relative mt-20 pl-8 md:pl-12">
          <div className="mb-10" data-reveal>
            <h3 className="font-heading text-2xl font-bold text-textPrimary sm:text-3xl">Research & Publications</h3>
          </div>

          <div className="space-y-8">
            {publications.map((group) => (
              <div key={group.year} className="grid gap-4 md:grid-cols-[100px_1fr]" data-reveal>
                <div className="flex items-start gap-2">
                  <span className="mt-2 h-3 w-3 rounded-full bg-indigo-400" />
                  <span className="font-heading text-3xl text-indigo-300">{group.year}</span>
                </div>
                <div className="space-y-4 border-l border-white/[0.08] pl-6">
                  {group.items.map((paper) => (
                    <GlassCard key={paper.title} className="p-4">
                      <h4 className="text-lg font-semibold">{paper.title}</h4>
                      <p className="mt-1 text-sm text-textMuted">{paper.venue}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-200">
                          {paper.status}
                        </span>
                        {paper.links.map((link) => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor-hover="true"
                            className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
                          >
                            <RiExternalLinkLine />
                            {link.label}
                            <RiArrowRightUpLine className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                          </a>
                        ))}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}

export default ExperienceTimeline
