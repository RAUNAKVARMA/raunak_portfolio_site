import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import TerminalWindow from './ui/TerminalWindow'

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

function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section id="about" className="sci-fi-section py-24" ref={ref}>
      <div className="section-container grid gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <span className="section-number">01</span>
          <h2 className="section-title">About</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Raunak Varma is an AI Engineer, active Researcher, and ML Enthusiast currently
            pursuing B.Tech in Computer Science at Manipal University Jaipur. He is a Certified
            Project Manager from BITS School of Management (BITSOM), specializing in AI-driven
            product strategy. As co-founder of Rauran Charge - a wireless EV charging startup
            registered under Atal Incubation Centre - and a published researcher with papers in
            Springer and Elsevier, Raunak bridges deep technical expertise with real-world product
            thinking.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {competencies.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-accentPrimary/40 bg-accentPrimary/10 px-4 py-1.5 font-mono text-xs text-accentPrimary shadow-[0_0_18px_rgba(0,212,255,0.18)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <TerminalWindow />
        </motion.div>
      </div>
    </section>
  )
}

export default About
