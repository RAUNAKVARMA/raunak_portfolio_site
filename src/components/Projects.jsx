import { RiArrowRightUpLine, RiExternalLinkLine, RiGithubLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import GlassCard from './ui/GlassCard'

const projects = [
  {
    name: 'Cosmic RAG',
    subtitle: 'RAG-based LLM Knowledge Assistant',
    year: '2025',
    category: 'LLM Platform',
    accent: 'bg-indigo-400',
    description:
      'End-to-end Retrieval-Augmented Generation system for contextual Q&A over custom document datasets, optimized for accuracy and low-latency responses.',
    metric: '↑25% accuracy, ↓30% latency',
    bullets: [
      'Designed ingestion, embedding generation, and semantic retrieval using vector similarity search.',
      'Engineered prompt pipelines minimizing hallucinations in LLM outputs.',
      'Deployed on Vercel using Ollama and Groq for fast inference.',
    ],
    tech: ['Python', 'LLM APIs', 'Ollama', 'Groq', 'Vector DBs', 'NLP', 'Vercel'],
    liveUrl: 'https://et-t-project-doqi.vercel.app/',
    repoUrl: 'https://github.com/RAUNAKVARMA/et-t-project',
  },
  {
    name: 'AI Gesture Virtual Mouse',
    subtitle: 'Real-time Hand Gesture Recognition',
    year: '2025',
    category: 'Computer Vision',
    accent: 'bg-violet-400',
    description:
      'Real-time hand gesture recognition system for touchless human-computer interaction with stable landmark detection and low-latency control.',
    metric: '20–30 FPS, ↓20% false triggers',
    bullets: [
      'Implemented hand tracking using MediaPipe and OpenCV.',
      'Engineered low-latency gesture-to-action mapping for smooth cursor control.',
      'Reduced false gesture triggers using filtering and stabilization techniques.',
    ],
    tech: ['Python', 'OpenCV', 'MediaPipe'],
    liveUrl: 'https://ai-gesture-virtual-mouse-hjgugnisok8t75yfcxqd7i.streamlit.app/',
    repoUrl: 'https://github.com/RAUNAKVARMA/AI-Gesture-Virtual-Mouse',
  },
  {
    name: 'Health Nexus',
    subtitle: 'Secure Health Record Exchange Platform',
    year: '2025',
    category: 'AI Systems',
    accent: 'bg-indigo-300',
    description:
      'Secure, scalable backend for interoperable medical record exchange across healthcare entities with encrypted data pipelines and role-based access control.',
    metric: 'Production-grade healthcare backend',
    bullets: [
      'Designed encrypted data pipelines and role-based access control for sensitive patient data.',
      'Developed modular REST APIs enabling real-time access and interoperability.',
      'Architected system for compliance-focused environments (privacy, integrity, controlled access).',
    ],
    tech: ['Node.js', 'REST APIs', 'Secure Data Systems'],
    repoUrl: 'https://github.com/RAUNAKVARMA/health-record-nexus-secure',
  },
]

function LinkButton({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover="true"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
    >
      <Icon className="text-base" />
      {label}
      <RiArrowRightUpLine className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </a>
  )
}

function Projects() {
  return (
    <section id="projects" className="py-24">
      <SectionReveal className="section-container">
        <div className="relative mb-14" data-reveal>
          <span className="section-number">02</span>
          <h2 className="section-title">Selected Work</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <GlassCard
              key={project.name}
              className="group relative overflow-hidden p-6"
              cursorLabel="View"
              data-reveal
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${project.accent}`} />
                  <span className="font-mono text-xs text-textMuted">{project.category}</span>
                </div>
                <span className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-xs text-textMuted">
                  {project.year}
                </span>
              </div>

              <h3 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">{project.name}</h3>
              {project.subtitle && (
                <p className="mt-1 font-mono text-xs text-indigo-300/80">{project.subtitle}</p>
              )}
              <p className="mt-4 text-slate-300">{project.description}</p>

              <ul className="mt-4 space-y-1.5 text-sm text-slate-400">
                {project.bullets.map((bullet) => (
                  <li key={bullet} className="list-disc pl-1 marker:text-indigo-400">
                    {bullet}
                  </li>
                ))}
              </ul>

              <span className="mt-5 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-200">
                {project.metric}
              </span>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-textMuted"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {project.liveUrl && (
                  <LinkButton href={project.liveUrl} icon={RiExternalLinkLine} label="Live app" />
                )}
                {project.repoUrl && (
                  <LinkButton href={project.repoUrl} icon={RiGithubLine} label="GitHub" />
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default Projects
