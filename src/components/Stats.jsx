import SectionReveal from './layout/SectionReveal'

const stats = [
  { target: 5, label: 'Publications', display: '05' },
  { target: 3, label: 'Projects', display: '03' },
  { target: 1, label: 'Startups', display: '01' },
  { target: 2, label: 'Research Yrs', display: '02' },
]

function Stats() {
  return (
    <section className="section-surface-alt border-y border-white/[0.12]">
      <SectionReveal className="section-container grid grid-cols-2 py-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-r border-white/[0.12] px-4 py-10 text-center last:border-r-0 sm:px-6 lg:border-b-0"
            data-reveal
          >
            <p className="font-heading text-3xl font-bold tracking-wide text-white sm:text-4xl">{stat.display}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-mBlue">{stat.label}</p>
          </div>
        ))}
      </SectionReveal>
    </section>
  )
}

export default Stats
