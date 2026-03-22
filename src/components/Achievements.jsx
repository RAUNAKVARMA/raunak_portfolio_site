import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const achievements = [
  {
    icon: '🏅',
    title: 'Student Excellence Award',
    year: '2025',
    description:
      'Recognized for outstanding performance in academics, innovation, and extracurricular contributions.',
  },
  {
    icon: '🥇',
    title: 'Winner - Startup Weekend Jaipur',
    year: '2025',
    description:
      'Led a team to build and pitch a startup prototype within 54 hours and secured 1st place before industry leaders.',
  },
  {
    icon: '🚀',
    title: 'AIC Registered Startup',
    year: '2025',
    description:
      'Co-founded Rauran Charge, a wireless EV charging startup recognized under the Atal Incubation Centre ecosystem.',
  },
]

function Achievements() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section className="py-24" ref={ref}>
      <div className="section-container grid gap-6 md:grid-cols-3">
        {achievements.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.06, duration: 0.55 }}
            className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accentPrimary/50"
          >
            <div className="text-4xl">{item.icon}</div>
            <h3 className="mt-4 font-heading text-2xl font-bold">{item.title}</h3>
            <p className="mt-3 text-slate-300">{item.description}</p>
            <span className="mt-5 inline-block rounded-full border border-accentSecondary/45 bg-accentSecondary/10 px-3 py-1 font-mono text-xs text-accentSecondary">
              {item.year}
            </span>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default Achievements
