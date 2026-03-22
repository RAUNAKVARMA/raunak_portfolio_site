import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const certs = [
  {
    icon: '🎓',
    name: 'Certified Project Manager',
    issuer: 'BITS School of Management (BITSOM)',
    year: '2025',
    description: 'Product Management with Generative & Agentic AI, focused on strategy and execution.',
  },
  {
    icon: '☁️',
    name: 'AWS Certified Solutions Architect (Simulation)',
    issuer: 'Amazon',
    year: '2025',
    description: 'Architectural fundamentals for scalable and secure cloud-native systems.',
  },
  {
    icon: '🗄️',
    name: 'Oracle Database SQL Certified Associate',
    issuer: 'Oracle',
    year: '2024',
    description: 'Validated proficiency in SQL querying, schema design, and relational modeling.',
  },
  {
    icon: '⚡',
    name: 'Industrial Training - EV & Software Simulation',
    issuer: 'Industrial Program',
    year: '2025',
    description: 'Hands-on exposure to EV system behavior and simulation-led optimization.',
  },
]

function Certifications() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section className="sci-fi-section py-24" ref={ref}>
      <div className="section-container">
        <h2 className="section-title text-3xl md:text-5xl">Certifications</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {certs.map((cert, index) => (
            <motion.article
              key={cert.name}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.55 }}
              className="group rounded-2xl border border-borderColor bg-bgSecondary/50 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(#0d1117, #0d1117), linear-gradient(135deg, rgba(0,212,255,0.45), rgba(245,158,11,0.35))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl">{cert.icon}</div>
                <span className="rounded-full border border-accentSecondary/40 bg-accentSecondary/10 px-3 py-1 font-mono text-xs text-accentSecondary">
                  {cert.year}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold">{cert.name}</h3>
              <p className="mt-2 text-sm text-accentPrimary">{cert.issuer}</p>
              <p className="mt-3 text-slate-300">{cert.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Certifications
