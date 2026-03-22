import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import AnimatedCounter from './ui/AnimatedCounter'

const stats = [
  { target: 4, label: 'Publications' },
  { target: 3, label: 'Projects' },
  { target: 2, label: 'Startups' },
  { target: 2, label: 'Years Research' },
]

function Stats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 })

  return (
    <section
      className="sci-fi-section overflow-hidden border-y border-white/[0.08] bg-[#0b1224]/85 py-12 shadow-[0_0_80px_rgba(88,28,135,0.08)] backdrop-blur-[2px]"
      ref={ref}
    >
      <div className="section-container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="font-heading text-5xl font-extrabold text-accentPrimary">
              <AnimatedCounter target={stat.target} />
            </div>
            <p className="mt-1 text-sm uppercase tracking-wider text-textMuted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Stats
