import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from 'react-icons/ri'
import MStripe from '../ui/MStripe'

const interests = [
  { tag: 'Cars', desc: 'Design · performance · culture' },
  { tag: 'Space', desc: 'Orbits · launches · frontier' },
  { tag: 'Drawing', desc: 'Sketch before you ship' },
]

function BeyondTeaser() {
  return (
    <section className="section-surface border-t border-white/[0.12]">
      <div className="relative min-h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1628]" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_100%_50%,rgba(226,39,24,0.18),transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to right,rgba(0,0,0,0.2),rgba(0,0,0,0.85))]"
          aria-hidden
        />

        <div className="section-container relative z-10 flex min-h-[70vh] flex-col justify-center py-20">
          <p className="section-eyebrow mb-6">Beyond Work</p>
          <h2 className="max-w-3xl font-heading text-[clamp(2.5rem,7vw,5rem)] font-bold uppercase leading-[0.92] tracking-[0.05em] text-white">
            Cars · Space
            <br />
            · Drawing
          </h2>
          <p className="mt-6 max-w-lg font-light leading-relaxed text-textMuted">
            Cricket, cars, space, and sketching — the obsessions that sit alongside models and papers.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {interests.map((item) => (
              <div key={item.tag} className="border border-white/[0.15] bg-black/50 px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#1c69d4]">{item.tag}</p>
                <p className="mt-2 text-sm text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link to="/beyond" data-cursor-hover="true" className="ghost-btn mt-12 w-fit">
            Explore Beyond
            <RiArrowRightUpLine />
          </Link>
        </div>
      </div>
      <MStripe />
    </section>
  )
}

export default BeyondTeaser
