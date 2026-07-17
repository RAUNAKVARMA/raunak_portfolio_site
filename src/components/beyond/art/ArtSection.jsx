import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from 'react-icons/ri'
import SectionReveal from '../../layout/SectionReveal'
import SectionHeader from '../../ui/SectionHeader'
import MStripe from '../../ui/MStripe'

const SKETCH_TILES = [
  { label: 'Astro', image: '/images/art-vortex-astro.png' },
  { label: 'Velocity', image: '/images/art-vortex-lambo.png' },
  { label: 'Concept', image: '/images/art-vortex-concept.png' },
]

/**
 * Normal Beyond art teaser — Enter Art opens immersive twin-vortex experience.
 */
function ArtSection() {
  return (
    <section className="border-t border-white/[0.08]" aria-labelledby="art-section-title">
      <div className="relative min-h-[62vh] overflow-hidden bg-black">
        <img
          src="/images/art-vortex-astro.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,rgba(8,40,80,0.35),rgba(0,0,0,0.88))]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 18% 50%, rgba(28,105,212,0.35), transparent 42%), radial-gradient(circle at 82% 50%, rgba(0,80,140,0.3), transparent 42%)',
          }}
          aria-hidden
        />

        <div className="section-container relative z-10 flex min-h-[62vh] flex-col justify-center py-20">
          <p className="section-eyebrow">Beyond Work — Art</p>
          <h2
            id="art-section-title"
            className="mt-5 max-w-2xl font-heading text-[clamp(2rem,6vw,3.75rem)] font-bold uppercase leading-[0.95] tracking-[0.05em]"
          >
            Drawing
          </h2>
          <p className="mt-5 max-w-md text-base font-light leading-relaxed text-textMuted">
            Enter a full-screen twin-vortex experience — revolving letters, warped atmosphere,
            then come back to the site anytime.
          </p>

          <Link
            to="/beyond/art"
            data-cursor-hover="true"
            className="ghost-btn mt-10 w-fit"
          >
            Enter Art
            <RiArrowRightUpLine />
          </Link>
        </div>

        <MStripe />
      </div>

      <SectionReveal className="section-container py-16">
        <div className="mb-8" data-reveal>
          <SectionHeader
            eyebrow="Art"
            title="Sketches & Studies"
            subtitle="Space, machines, and sketches — the visuals that feed the vortex."
          />
        </div>

        <div className="grid grid-cols-1 gap-px bg-white/[0.08] sm:grid-cols-3">
          {SKETCH_TILES.map((tile) => (
            <div
              key={tile.label}
              data-reveal
              className="group relative flex min-h-[220px] items-end overflow-hidden bg-[#0a0a0a] p-4 sm:min-h-[280px]"
            >
              <img
                src={tile.image}
                alt={tile.label}
                className="absolute inset-0 h-full w-full object-cover object-top opacity-75 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-95"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to top,rgba(0,0,0,0.85),transparent_55%)]" />
              <p className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-textMuted transition-colors group-hover:text-white">
                {tile.label}
              </p>
            </div>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default ArtSection
