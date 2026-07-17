import { useEffect, useRef } from 'react'
import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { experienceTimeline } from '../Experience'
import { publications } from '../Publications'
import SectionReveal from '../layout/SectionReveal'
import SectionHeader from '../ui/SectionHeader'
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
    <section id="experience" className="border-t border-white/[0.08] py-24" ref={sectionRef}>
      <SectionReveal className="section-container">
        <div className="mb-14" data-reveal>
          <SectionHeader eyebrow="04 — Experience" title="Experience & Research" />
        </div>

        <div className="relative border-l border-white/[0.12] pl-8 md:pl-12">
          <div
            ref={lineRef}
            className="absolute left-0 top-0 h-full w-px origin-top bg-gradient-to-b from-[#1c69d4] via-white/20 to-transparent"
            aria-hidden
          />

          <div className="divide-y divide-white/[0.08]">
            {experienceTimeline.map((item) => (
              <article key={`${item.role}-${item.company}`} className="relative py-10 first:pt-0" data-reveal>
                <span
                  className="absolute -left-[37px] top-10 h-2 w-2 bg-white md:-left-[49px]"
                  aria-hidden
                />

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wide sm:text-xl">
                    {item.role}
                  </h3>
                  <span className="font-mono text-sm text-textSubtle">— {item.company}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <span className="font-mono text-xs text-textSubtle">{item.period}</span>
                  <span className="border border-white/[0.12] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-textMuted">
                    {item.tag}
                  </span>
                </div>

                <ul className="mt-5 space-y-2 text-sm font-light text-textMuted">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-px w-3 shrink-0 bg-white/25" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tech.map((tech) => (
                    <span
                      key={tech}
                      className="border border-white/[0.08] px-2.5 py-1 font-mono text-[10px] text-textSubtle"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div id="research" className="mt-20 border-t border-white/[0.08] pt-16">
          <div className="mb-10" data-reveal>
            <SectionHeader eyebrow="Publications" title="Research" />
          </div>

          <div className="divide-y divide-white/[0.08] border border-white/[0.08]">
            {publications.map((group) =>
              group.items.map((paper) => (
                <article
                  key={paper.title}
                  className="grid gap-4 bg-black p-6 sm:grid-cols-[80px_1fr]"
                  data-reveal
                >
                  <span className="font-mono text-sm text-textSubtle">{group.year}</span>
                  <div>
                    <h4 className="font-heading text-base font-semibold leading-snug sm:text-lg">{paper.title}</h4>
                    <p className="mt-1 text-sm font-light text-textSubtle">{paper.venue}</p>
                    {paper.summary && (
                      <p className="mt-3 text-sm font-light italic text-textMuted">{paper.summary}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <span className="border border-white/[0.12] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-textMuted">
                        {paper.status}
                      </span>
                      {paper.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-hover="true"
                          className="link-accent inline-flex items-center gap-1.5"
                        >
                          <RiExternalLinkLine />
                          {link.label}
                          <RiArrowRightUpLine />
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              )),
            )}
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}

export default ExperienceTimeline
