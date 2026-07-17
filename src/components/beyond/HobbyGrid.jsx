import SectionReveal from '../layout/SectionReveal'
import SectionHeader from '../ui/SectionHeader'

const hobbies = [
  {
    tag: '01',
    title: 'Cars',
    blurb: 'Engineering on four wheels — design, performance, and the culture around driving.',
    tone: 'from-white/[0.06] to-black',
  },
  {
    tag: '02',
    title: 'Space',
    blurb: 'Orbits, launches, and the frontier — the same wonder that pulls me toward research.',
    tone: 'from-white/[0.04] to-black',
  },
  {
    tag: '03',
    title: 'Drawing',
    blurb: 'Sketching ideas before they become code — visual thinking on paper.',
    tone: 'from-white/[0.05] to-black',
  },
  {
    tag: '04',
    title: 'Cricket',
    blurb: 'Weekend matches, batting order debates, and following every series.',
    tone: 'from-white/[0.03] to-black',
  },
  {
    tag: '05',
    title: 'Chess',
    blurb: 'Slow, deliberate strategy — pattern-hunting in 64 squares.',
    tone: 'from-white/[0.04] to-black',
  },
  {
    tag: '06',
    title: 'Music',
    blurb: 'A constant background track while building — always hunting for the next song.',
    tone: 'from-white/[0.03] to-black',
  },
]

function HobbyGrid() {
  return (
    <section className="border-t border-white/[0.08] py-20">
      <SectionReveal className="section-container">
        <div className="mb-12" data-reveal>
          <SectionHeader eyebrow="Interests" title="What I Love" />
        </div>
        <div className="grid gap-px bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
          {hobbies.map((hobby) => (
            <article
              key={hobby.title}
              data-reveal
              className={`group relative min-h-[220px] overflow-hidden bg-gradient-to-br ${hobby.tone} bg-black p-6 sm:p-8`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-textSubtle">{hobby.tag}</p>
              <h3 className="mt-4 font-heading text-xl font-bold uppercase tracking-wide">{hobby.title}</h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-textMuted">{hobby.blurb}</p>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0066b1] via-[#1c69d4] to-[#e22718] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default HobbyGrid
