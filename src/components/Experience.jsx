import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export const experienceTimeline = [
  {
    role: 'AI Intern',
    company: 'EY (Ernst & Young), Gurgaon',
    period: 'May 2026 - Present',
    tag: 'Enterprise AI',
    bullets: [
      'Built and evaluated ML models for enterprise use cases, improving data-driven decision workflows.',
      'Developed scalable data pipelines and preprocessing systems for analytics applications.',
      'Delivered AI solutions aligned with business objectives in consulting-driven environments.',
    ],
    tech: ['Python', 'ML Models', 'Data Pipelines'],
  },
  {
    role: 'AI/ML Intern',
    company: 'Zalima Development Pvt. Ltd.',
    period: 'Mar 2026 - Apr 2026',
    tag: 'AI/ML Intern',
    bullets: [
      'Built and optimized ML models for structured datasets, improving prediction reliability and performance.',
      'Designed preprocessing pipelines and deployed models in production environments.',
      'Improved model performance through feature engineering and iterative evaluation techniques.',
    ],
    tech: ['Python', 'Feature Engineering', 'Model Deployment'],
  },
  {
    role: 'Co-Founder',
    company: 'Rauran Charge',
    period: 'Aug 2024 - Present',
    tag: 'Startup Leadership',
    bullets: [
      'Leading development of wireless EV charging systems with focus on efficiency and real-world deployment.',
      'Architected system design integrating hardware and AI-based optimization strategies.',
      'Driving product development lifecycle from research and prototyping to deployment.',
    ],
    tech: ['EV Tech', 'System Design', 'ML Optimization'],
  },
  {
    role: 'Campus Ambassador',
    company: 'Techfest, IIT Bombay',
    period: 'May 2024 - Dec 2024',
    tag: 'Community',
    bullets: [
      'Led outreach and promotional campaigns, increasing campus-level engagement and participation.',
      'Strengthened communication and leadership through event execution and coordination.',
    ],
    tech: ['Leadership', 'Events', 'Communication'],
  },
]

function Experience() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="experience" className="sci-fi-section py-24" ref={ref}>
      <div className="section-container">
        <div className="relative mb-14">
          <span className="section-number">04</span>
          <h2 className="section-title">Experience</h2>
        </div>

        <div className="relative pl-8 md:pl-12">
          <div className="absolute left-2 top-2 h-[calc(100%-10px)] w-px bg-gradient-to-b from-accentPrimary/80 via-accentPrimary/40 to-transparent md:left-4" />

          <div className="space-y-8">
            {experienceTimeline.map((item, index) => (
              <motion.article
                key={`${item.role}-${item.company}`}
                initial={{ opacity: 0, y: 25 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl border border-borderColor bg-bgSecondary/60 p-6"
              >
                <span className="absolute -left-[31px] top-8 h-3.5 w-3.5 rounded-full bg-accentPrimary shadow-cyan md:-left-[41px]" />

                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-heading text-2xl font-bold">
                    {item.role} — {item.company}
                  </h3>
                  <span className="font-mono text-sm text-accentSecondary">{item.period}</span>
                  <span className="rounded-full border border-accentPrimary/40 bg-accentPrimary/10 px-3 py-1 text-xs text-accentPrimary">
                    {item.tag}
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-slate-300">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc pl-1 marker:text-accentPrimary">
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-borderColor px-3 py-1 font-mono text-xs text-textMuted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Experience
