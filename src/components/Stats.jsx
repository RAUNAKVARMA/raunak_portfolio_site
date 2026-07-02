import SectionReveal from './layout/SectionReveal'
import GlassCard from './ui/GlassCard'
import AnimatedCounter from './ui/AnimatedCounter'

const stats = [
  { target: 5, label: 'Publications' },
  { target: 3, label: 'Projects' },
  { target: 1, label: 'Startups' },
  { target: 2, label: 'Years Research' },
]

function Stats() {
  return (
    <section className="overflow-hidden border-y border-white/[0.06] py-12">
      <SectionReveal className="section-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-6 text-center" data-reveal>
            <div className="font-heading text-4xl font-bold text-indigo-300 sm:text-5xl">
              <AnimatedCounter target={stat.target} />
            </div>
            <p className="mt-2 text-sm uppercase tracking-wider text-textMuted">{stat.label}</p>
          </GlassCard>
        ))}
      </SectionReveal>
    </section>
  )
}

export default Stats
