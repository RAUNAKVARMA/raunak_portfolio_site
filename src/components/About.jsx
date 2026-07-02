import { useEffect } from 'react'
import SectionReveal from './layout/SectionReveal'
import GlassPanel from './ui/GlassPanel'
import TerminalWindow from './ui/TerminalWindow'
import { useSceneProgress } from '../providers/SceneProgressProvider'

const competencies = [
  'LLMs',
  'RAG Pipelines',
  'Multi-Agent Systems',
  'Computer Vision',
  'Reinforcement Learning',
  'Node.js',
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

function About() {
  const { registerSection } = useSceneProgress()

  useEffect(() => {
    const el = document.getElementById('about')
    if (el) registerSection('about', el)
    return () => registerSection('about', null)
  }, [registerSection])

  return (
    <section id="about" className="-mt-8 py-24 sm:-mt-12">
      <SectionReveal className="section-container grid gap-12 lg:grid-cols-2 lg:items-center">
        <GlassPanel className="relative p-6 sm:p-8" data-reveal>
          <span className="section-number">01</span>
          <h2 className="section-title">About</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Raunak Varma is an AI Engineer, active Researcher, and ML Enthusiast pursuing B.Tech in
            Computer Science and Engineering at Manipal University Jaipur (2023–2027). He is a
            Certified Project Manager from BITS School of Management (BITSOM), specializing in
            AI-driven product strategy. As co-founder of Rauran Charge — a wireless EV charging startup
            registered under Atal Incubation Centre — and a published researcher with papers in Springer
            and Elsevier, Raunak bridges deep technical expertise with real-world product thinking.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {competencies.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 font-mono text-xs text-indigo-200"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-textMuted">
              Relevant Coursework
            </p>
            <div className="flex flex-wrap gap-2">
              {coursework.map((course) => (
                <span
                  key={course}
                  className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[11px] text-slate-400"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        </GlassPanel>

        <div data-reveal>
          <TerminalWindow />
        </div>
      </SectionReveal>
    </section>
  )
}

export default About
