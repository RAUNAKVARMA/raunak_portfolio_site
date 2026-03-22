import { motion } from 'framer-motion'
import { RiArrowRightUpLine, RiExternalLinkLine, RiGithubLine } from 'react-icons/ri'
import { useInView } from 'react-intersection-observer'

const projects = [
  {
    name: 'Health Nexus',
    year: '2025',
    category: 'AI Systems',
    accent: 'bg-accentPrimary',
    description:
      'Secure health record exchange platform built for production-grade interoperability. Engineered encrypted data pipelines and resilient API orchestration for clinical workflows.',
    metric: 'Encrypted healthcare backend',
    tech: ['Node.js', 'REST APIs', 'Secure Data Systems'],
  },
  {
    name: 'Cosmic RAG',
    year: '2025',
    category: 'LLM Platform',
    accent: 'bg-accentSecondary',
    description:
      'NotebookLLM-style question answering assistant with retrieval-aware orchestration. Tuned chunking and ranking strategies to improve precision and system responsiveness.',
    metric: '↑25% accuracy, ↓30% latency',
    tech: ['Python', 'LLM APIs', 'Vector Databases', 'NLP'],
    liveUrl: 'https://et-t-project-doqi-bb9qdn7mk-raunak-varmas-projects.vercel.app/chat',
  },
  {
    name: 'Gesture Virtual Mouse',
    year: '2025',
    category: 'Computer Vision',
    accent: 'bg-accentPrimary',
    description:
      'AI-powered hand tracking interaction system translating gestures into mouse events. Optimized model and smoothing logic for stable real-time human-computer interaction.',
    metric: '20-30 FPS, ↓20% false triggers',
    tech: ['Python', 'OpenCV', 'MediaPipe'],
    liveUrl: 'https://ai-gesture-virtual-mouse-hjgugnisok8t75yfcxqd7i.streamlit.app/',
  },
]

function Projects() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section id="projects" className="py-24" ref={ref}>
      <div className="section-container">
        <div className="relative mb-14">
          <span className="section-number">02</span>
          <h2 className="section-title">Selected Work</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.article
              key={project.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-borderColor bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-accentPrimary/50 hover:shadow-cyan"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${project.accent}`} />
                  <span className="font-mono text-xs text-textMuted">{project.category}</span>
                </div>
                <span className="rounded-full border border-borderColor px-3 py-1 font-mono text-xs text-textMuted">
                  {project.year}
                </span>
              </div>

              <h3 className="font-heading text-4xl font-bold leading-tight">{project.name}</h3>
              <p className="mt-4 min-h-[92px] text-slate-300">{project.description}</p>

              <span className="mt-5 inline-block rounded-full border border-accentPrimary/40 bg-accentPrimary/10 px-3 py-1 font-mono text-xs text-accentPrimary">
                {project.metric}
              </span>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-borderColor bg-bgSecondary px-2.5 py-1 font-mono text-[11px] text-textMuted"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accentPrimary"
                  >
                    <RiExternalLinkLine className="text-base" />
                    Live app
                    <RiArrowRightUpLine className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-accentPrimary/90"
                  >
                    <RiGithubLine />
                    Repository
                    <RiArrowRightUpLine className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
