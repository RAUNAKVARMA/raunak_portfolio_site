import { useLayoutEffect, useRef } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { aboutScrubRange } from './aboutScrollConfig'

const skillGroups = [
  { category: 'Languages', skills: ['Python', 'C', 'C++', 'TypeScript', 'JavaScript'] },
  { category: 'AI systems', skills: ['LLMs', 'RAG pipelines', 'Multi-agent systems', 'LiteLLM', 'Hugging Face', 'FAISS', 'Computer vision', 'NLP'] },
  { category: 'ML & modeling', skills: ['Machine learning', 'Deep learning', 'Graph neural networks', 'Reinforcement learning', 'Model evaluation'] },
  { category: 'Frameworks & tools', skills: ['Next.js', 'React', 'FastAPI', 'PyTorch', 'TensorFlow', 'Docker', 'Git', 'Tailwind CSS'] },
  { category: 'Research & methods', skills: ['Experimental design', 'Benchmarking', 'IEEE / Springer writing', 'Literature review', 'Ablation studies'] },
]

function AboutSkillsStage() {
  const rootRef = useRef(null)
  const { prefersReducedMotion, enableGsapScrub } = useReducedMotionProfile()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion || !enableGsapScrub) return undefined

    registerGsap()
    const ctx = gsap.context(() => {
      gsap.from(root.querySelector('.about-stage__skills-head'), {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: root,
          scroller: document.documentElement,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      })

      gsap.fromTo(
        root.querySelector('.about-stage__skills-orbit'),
        { rotate: -16, scale: 0.88, opacity: 0 },
        {
          rotate: 0,
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            scroller: document.documentElement,
            ...aboutScrubRange('top 88%', 'bottom 12%'),
            scrub: 0.3,
          },
        },
      )

      root.querySelectorAll('.about-stage__skills-cluster').forEach((cluster, i) => {
        gsap.from(cluster, {
          y: 36,
          opacity: 0,
          duration: 0.65,
          delay: (i % 2) * 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cluster,
            scroller: document.documentElement,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.from(cluster.querySelectorAll('.about-stage__skill-chip'), {
          y: 10,
          opacity: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cluster,
            scroller: document.documentElement,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [enableGsapScrub, prefersReducedMotion])

  return (
    <section id="skills" ref={rootRef} className="about-stage about-stage--skills" aria-labelledby="about-skills-heading">
      <div className="about-stage__flow">
        <div
          className="about-stage__skills-orbit"
          data-about-node="skills-orbit"
          data-about-node-x="0.5"
          data-about-node-y="0.5"
          aria-hidden="true"
        />

        <div
          className="about-stage__skills-head"
          data-about-node="skills-head"
          data-about-node-x="0"
          data-about-node-y="0.6"
        >
          <h2 id="about-skills-heading" className="about-stage__skills-title">
            Stack
          </h2>
          <p className="about-stage__skills-deck">Languages, systems, and methods I ship with.</p>
        </div>

        <div className="about-stage__skills-grid">
          {skillGroups.map((group, index) => (
            <article
              key={group.category}
              className="about-stage__skills-cluster about-net-cluster"
              data-about-node={`skills-cluster-${index}`}
              data-about-node-x="0.15"
              data-about-node-y="0.2"
              data-cursor-hover="true"
            >
              <div className="about-stage__skills-cluster-head">
                <span className="about-stage__skills-cluster-num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="about-stage__skills-cluster-label">{group.category}</h3>
              </div>
              <ul className="about-stage__skills-chips">
                {group.skills.map((skill) => (
                  <li key={skill} className="about-stage__skill-chip">
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSkillsStage
