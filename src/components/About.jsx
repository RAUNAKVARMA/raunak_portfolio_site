import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import SectionHeader from './ui/SectionHeader'
import TerminalWindow from './ui/TerminalWindow'
import { useSceneProgress } from '../providers/SceneProgressProvider'

const competencies = [
  'LLMs',
  'RAG Pipelines',
  'Multi-Agent Systems',
  'LiteLLM',
  'FastAPI',
  'Next.js',
  'Computer Vision',
  'Reinforcement Learning',
  'Python',
  'Research',
  'Project Management',
]

const coursework = [
  'Machine Learning',
  'Reinforcement Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Artificial Intelligence',
  'Data Structures & Algorithms',
]

function About({ preview = false }) {
  const { registerSection } = useSceneProgress()

  useEffect(() => {
    const el = document.getElementById('about')
    if (el) registerSection('about', el)
    return () => registerSection('about', null)
  }, [registerSection])

  return (
    <section id="about" className="section-surface border-t border-white/[0.12] py-24">
      <SectionReveal className="section-container grid gap-12 lg:grid-cols-2 lg:items-start">
        <div data-reveal>
          <SectionHeader eyebrow="01 — About" title="Engineer & Researcher" />
          <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-textMuted sm:text-lg">
            Raunak Varma is an AI Engineer, active Researcher, and ML Enthusiast pursuing B.Tech in
            Computer Science and Engineering at Manipal University Jaipur (2023–2027). Currently an
            AI Intern at EY (Ernst &amp; Young), Gurgaon, he builds production ML systems and data
            pipelines for enterprise use cases. A Certified Project Manager from BITS School of
            Management (BITSOM), he specializes in AI-driven product strategy. As co-founder of
            Rauran Charge — a wireless EV charging startup registered under Atal Incubation Centre —
            and a published researcher with papers in Springer and IEEE, Raunak bridges deep technical
            expertise with real-world product thinking.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {competencies.map((skill) => (
              <span
                key={skill}
                className="border border-white/[0.12] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-textMuted"
              >
                {skill}
              </span>
            ))}
          </div>

          {!preview && (
            <div className="mt-8 border-t border-white/[0.08] pt-6">
              <p className="section-eyebrow mb-4">Relevant Coursework</p>
              <div className="flex flex-wrap gap-2">
                {coursework.map((course) => (
                  <span
                    key={course}
                    className="border border-white/[0.08] px-3 py-1 font-mono text-[10px] text-textSubtle"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preview && (
            <Link
              to="/about"
              data-cursor-hover="true"
              className="link-accent mt-8 inline-flex items-center gap-1.5"
            >
              More about me
              <RiArrowRightUpLine />
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-6" data-reveal>
          <figure className="relative w-full max-w-[220px] overflow-hidden border border-white/[0.12] bg-[#0a0a0a] sm:max-w-[240px] lg:max-w-[260px]">
            <img
              src="/images/raunak-portrait-professional.png"
              alt="Raunak Varma — AI Engineer and Researcher"
              className="aspect-[3/4] w-full object-cover object-[center_12%] contrast-[1.05] saturate-[0.92]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" aria-hidden />
            <figcaption className="absolute bottom-0 left-0 right-0 border-t border-white/[0.12] bg-black/70 px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#1c69d4]">Portrait</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60">AI Engineer · Researcher</p>
            </figcaption>
          </figure>
          <TerminalWindow />
        </div>
      </SectionReveal>
    </section>
  )
}

export default About
