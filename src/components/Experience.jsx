import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const timeline = [
  {
    role: 'AI/ML & Data Science Intern',
    company: 'Zalima Development',
    period: 'Mar 2026 - Present',
    tag: 'AI/ML Intern',
    bullets: [
      'Built model evaluation pipelines for applied ML use-cases across internal products.',
      'Automated data quality checks and feature extraction workflows for research iteration.',
      'Collaborated with engineering teams to productionize experiments into measurable outcomes.',
    ],
    tech: ['Python', 'Data Science', 'Model Evaluation'],
  },
  {
    role: 'Co-Founder',
    company: 'Rauran Charge',
    period: 'Aug 2024 - Present',
    tag: 'Startup Leadership',
    bullets: [
      'Co-led product strategy for wireless EV charging systems under AIC ecosystem.',
      'Designed technical roadmap spanning simulation, hardware integration, and ML optimization.',
      'Built cross-functional momentum across research, prototyping, and stakeholder presentations.',
    ],
    tech: ['Product Strategy', 'EV Tech', 'ML Optimization'],
  },
  {
    role: 'Backend Developer Intern',
    company: 'Eastri',
    period: 'Mar - Jun 2025',
    tag: 'Backend Dev',
    bullets: [
      'Developed RESTful APIs and service modules for core platform workflows.',
      'Improved endpoint reliability with robust validation and error-handling layers.',
      'Contributed to deployment-ready backend architecture and API documentation.',
    ],
    tech: ['Node.js', 'REST APIs', 'Service Architecture'],
  },
  {
    role: 'Campus Ambassador',
    company: 'Techfest, IIT Bombay',
    period: 'May - Dec 2024',
    tag: 'Community',
    bullets: [
      'Represented Techfest initiatives and drove participation across campus chapters.',
      'Coordinated technical events and outreach campaigns with student teams.',
      'Strengthened industry-academia engagement through curated event activations.',
    ],
    tech: ['Leadership', 'Events', 'Communication'],
  },
  {
    role: 'Industrial Trainee',
    company: 'My Equation',
    period: 'Feb - Apr 2024',
    tag: 'Industrial Training',
    bullets: [
      'Completed practical modules on EV systems and software simulation tooling.',
      'Performed structured analysis of charging models and design performance.',
      'Presented findings with simulation-backed recommendations for system tuning.',
    ],
    tech: ['Simulation', 'EV Systems', 'Analytics'],
  },
]

function Experience() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="experience" className="py-24" ref={ref}>
      <div className="section-container">
        <div className="relative mb-14">
          <span className="section-number">04</span>
          <h2 className="section-title">Experience</h2>
        </div>

        <div className="relative pl-8 md:pl-12">
          <div className="absolute left-2 top-2 h-[calc(100%-10px)] w-px bg-gradient-to-b from-accentPrimary/80 via-accentPrimary/40 to-transparent md:left-4" />

          <div className="space-y-8">
            {timeline.map((item, index) => (
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
                    {item.role} - {item.company}
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
