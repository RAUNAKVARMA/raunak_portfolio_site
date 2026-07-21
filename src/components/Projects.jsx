import { Link } from 'react-router-dom'
import { RiArrowRightUpLine, RiExternalLinkLine, RiGithubLine, RiPlayCircleLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import AutoPlayVideo from './ui/AutoPlayVideo'
import SectionHeader from './ui/SectionHeader'
import GlassCard from './ui/GlassCard'

const projects = [
  {
    name: 'Cosmic RAG',
    subtitle: 'RAG-based LLM Knowledge Assistant',
    year: '2025',
    category: 'LLM Platform',
    description:
      'Production Retrieval-Augmented Generation platform for contextual question answering over custom document corpora using semantic search and multi-model LLM orchestration.',
    metric: 'FastEmbed · FAISS · LiteLLM · Docker',
    bullets: [
      'Built an end-to-end RAG pipeline with FastEmbed embeddings, FAISS semantic search, and multi-format document ingestion.',
      'Implemented LiteLLM-based multi-model routing across Ollama and NVIDIA NIM.',
      'Developed a FastAPI backend with document upload, source-cited responses, and REST APIs.',
      'Built a Next.js + TypeScript frontend featuring Three.js, RAG chat, and AI image generation.',
      'Deployed on Vercel and Render using Docker with persistent FAISS indexing and authentication.',
    ],
    tech: [
      'Python',
      'FastAPI',
      'FastEmbed',
      'FAISS',
      'LiteLLM',
      'Next.js',
      'TypeScript',
      'Three.js',
      'Docker',
      'Vercel',
      'Render',
    ],
    liveUrl: 'https://et-t-project-doqi.vercel.app/',
    repoUrl: 'https://github.com/RAUNAKVARMA/et-t-project',
    video: '/videos/cosmic-rag-demo.mp4',
    poster: '/images/cosmic-rag-hero.png',
    videoLabel: 'Cosmic RAG knowledge portal demonstration',
  },
  {
    name: 'EcoVerify',
    subtitle: 'AI-Powered Sustainability Verification Platform',
    year: '2025',
    category: 'AI Platform',
    description:
      'Production-ready AI platform for sustainability claim verification and automated environmental assessment.',
    metric: 'Next.js · AI APIs · Vercel CI/CD',
    bullets: [
      'Engineered an AI-powered sustainability verification pipeline generating structured environmental assessments.',
      'Built a responsive Next.js application with reusable React components and optimized state management.',
      'Deployed the platform on Vercel with production-ready CI/CD and optimized performance.',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'AI APIs', 'Vercel'],
    liveUrl: 'https://ecoverify-live.vercel.app/',
    demoUrl: 'https://drive.google.com/file/d/1JzonseVJQNOt57laBEZZKQ9SUiIBnobc/view?usp=drivesdk',
    repoUrl: 'https://github.com/RAUNAKVARMA/ecoverify_app',
    video: '/videos/ecoverify-demo.mp4',
    videoLabel: 'EcoVerify sustainability verification platform demonstration',
  },
  {
    name: 'Health Nexus',
    subtitle: 'Secure Health Record Exchange Platform',
    year: '2025',
    category: 'Healthcare',
    description:
      'Full-stack health record exchange platform for Smart India Hackathon (Top 50), enabling secure, consent-based sharing of electronic medical records between hospitals and patients.',
    metric: 'Smart India Hackathon · Top 50',
    bullets: [
      'Built a FastAPI + PostgreSQL backend with JWT authentication, role-based access, and secure REST APIs.',
      'Implemented consent-based medical record sharing between hospitals and patients.',
      'Developed Next.js dashboards for Health ID, records, and consent management.',
      'Deployed on Vercel and Render with managed PostgreSQL.',
    ],
    tech: ['Next.js', 'React', 'FastAPI', 'PostgreSQL', 'JWT', 'REST APIs', 'Vercel', 'Render'],
    liveUrl: 'https://health-record-nexus-secure.vercel.app/',
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
      className="link-accent inline-flex items-center gap-1.5"
    >
      <Icon className="text-base" />
      {label}
      <RiArrowRightUpLine />
    </a>
  )
}

function ProjectRow({ project }) {
  return (
    <article className="border-b border-white/[0.08] py-10 last:border-b-0" data-reveal>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="section-eyebrow">{project.category}</p>
          <h3 className="mt-2 font-heading text-2xl font-bold uppercase tracking-wide sm:text-3xl">
            {project.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-textSubtle">{project.subtitle}</p>
        </div>
        <span className="font-mono text-sm text-textSubtle">{project.year}</span>
      </div>

      {project.video && (
        <figure className="mt-8 max-w-3xl overflow-hidden border border-white/[0.12] bg-[#0a0a0a]">
          <AutoPlayVideo
            src={project.video}
            poster={project.poster}
            aria-label={project.videoLabel ?? `${project.name} demonstration`}
            className="aspect-video w-full object-cover object-center"
          />
        </figure>
      )}

      <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-textMuted">
        {project.description}
      </p>

      <ul className="mt-4 max-w-3xl space-y-2 text-sm font-light text-textSubtle">
        {project.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span className="mt-2 h-px w-3 shrink-0 bg-white/30" aria-hidden />
            {bullet}
          </li>
        ))}
      </ul>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-textSubtle">{project.metric}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((item) => (
          <span
            key={item}
            className="border border-white/[0.08] px-2.5 py-1 font-mono text-[10px] text-textSubtle"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        {project.liveUrl && (
          <LinkButton href={project.liveUrl} icon={RiExternalLinkLine} label="Live app" />
        )}
        {project.demoUrl && (
          <LinkButton href={project.demoUrl} icon={RiPlayCircleLine} label="Demo" />
        )}
        {project.repoUrl && (
          <LinkButton href={project.repoUrl} icon={RiGithubLine} label="GitHub" />
        )}
      </div>
    </article>
  )
}

function Projects({ preview = false }) {
  const shown = preview ? projects.slice(0, 2) : projects

  return (
    <section id="projects" className="section-surface-alt border-t border-white/[0.12] py-24">
      <SectionReveal className="section-container">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4" data-reveal>
          <SectionHeader eyebrow="02 — Selected Work" title="Projects" />
          {preview && (
            <Link
              to="/work"
              data-cursor-hover="true"
              className="link-accent inline-flex items-center gap-1.5"
            >
              View all work
              <RiArrowRightUpLine />
            </Link>
          )}
        </div>

        {preview ? (
          <div className="grid gap-px bg-white/[0.12] md:grid-cols-2">
            {shown.map((project) => (
              <GlassCard key={project.name} className="bg-[#141414] p-6 sm:p-8" data-reveal>
                <p className="section-eyebrow">{project.category}</p>
                <h3 className="mt-3 font-heading text-xl font-bold uppercase tracking-wide sm:text-2xl">
                  {project.name}
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-textMuted">{project.description}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-textSubtle">{project.metric}</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  {project.liveUrl && (
                    <LinkButton href={project.liveUrl} icon={RiExternalLinkLine} label="Live" />
                  )}
                  {project.demoUrl && (
                    <LinkButton href={project.demoUrl} icon={RiPlayCircleLine} label="Demo" />
                  )}
                  {project.repoUrl && (
                    <LinkButton href={project.repoUrl} icon={RiGithubLine} label="Code" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="border-t border-white/[0.08]">
            {shown.map((project) => (
              <ProjectRow key={project.name} project={project} />
            ))}
          </div>
        )}
      </SectionReveal>
    </section>
  )
}

export default Projects
