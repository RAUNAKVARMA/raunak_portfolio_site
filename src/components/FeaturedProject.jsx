import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from 'react-icons/ri'
import MStripe from './ui/MStripe'

const specs = [
  { label: 'Stack', value: 'FastEmbed · FAISS · LiteLLM · FastAPI' },
  { label: 'Frontend', value: 'Next.js · TypeScript · Three.js' },
  { label: 'Deploy', value: 'Vercel · Render · Docker' },
  { label: 'Type', value: 'Production RAG Platform' },
]

function FeaturedProject() {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="relative min-h-[85vh]">
        <div
          className="pointer-events-none absolute inset-0 bg-[#050814]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,rgba(28,105,212,0.35),transparent_65%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.97)_0%,rgba(0,0,0,0.55)_42%,rgba(0,0,0,0.15)_68%,transparent_100%)]"
          aria-hidden
        />
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />

        <div className="section-container relative z-10 flex min-h-[85vh] flex-col justify-end pb-0 pt-28">
          <p className="section-eyebrow mb-4">Flagship Project</p>
          <h2 className="max-w-4xl font-heading text-[clamp(3rem,10vw,7rem)] font-bold uppercase leading-[0.9] tracking-[0.05em] text-white">
            Cosmic
            <br />
            RAG
          </h2>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-textMuted sm:text-lg">
            Production RAG platform for contextual Q&amp;A over custom document corpora — semantic
            search, multi-model LLM orchestration, and source-cited responses at scale.
          </p>

          <div className="mt-10 grid gap-px border border-white/[0.12] bg-white/[0.12] sm:grid-cols-2 lg:grid-cols-4">
            {specs.map((item) => (
              <div key={item.label} className="bg-[#0a0a0a] px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#1c69d4]">{item.label}</p>
                <p className="mt-2 text-sm font-light text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 pb-12">
            <a
              href="https://et-t-project-doqi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover="true"
              className="ghost-btn"
            >
              Live Demo
              <RiArrowRightUpLine />
            </a>
            <Link to="/work" data-cursor-hover="true" className="link-accent inline-flex items-center gap-1.5">
              All Projects
              <RiArrowRightUpLine />
            </Link>
          </div>
        </div>

        <figure className="pointer-events-none absolute right-0 top-1/2 z-[1] hidden w-[min(52%,640px)] -translate-y-1/2 pr-6 lg:block xl:pr-10">
          <div className="overflow-hidden border border-white/[0.12] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
            <img
              src="/images/cosmic-rag-hero.png"
              alt="Cosmic RAG — retrieval-augmented knowledge assistant landing page"
              className="aspect-video w-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <figcaption className="mt-3 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            Live product · Cosmic RAG
          </figcaption>
        </figure>
      </div>
      <MStripe />
    </section>
  )
}

export default FeaturedProject
