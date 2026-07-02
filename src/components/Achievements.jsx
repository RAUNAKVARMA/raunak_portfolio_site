import { motion } from 'framer-motion'
import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import { useInView } from 'react-intersection-observer'

const achievements = [
  {
    icon: '🏆',
    title: 'Ideastorm Prelims — IIT Roorkee E-Summit',
    year: '2026',
    description:
      'Shortlisted to present Rauran Charge at Ideastorm (E-Summit, IIT Roorkee), a national-level startup pitching competition showcasing innovative business ideas.',
    certificateUrl: 'https://drive.google.com/file/d/115sNxhlov8apIAvuA2WRwJfUwGQdRfHe/view?usp=sharing',
    linkLabel: 'Certificate',
  },
  {
    icon: '🏅',
    title: 'Excellence Award for Research and Academic Achievement',
    year: '2026',
    description:
      'Awarded for outstanding contributions to research, international publications, and academic excellence.',
    certificateUrl: 'https://drive.google.com/file/d/15TqMgLZuJel8fKf8oFpNbxAZdZ4Yhd-f/view?usp=drivesdk',
    linkLabel: 'Certificate',
  },
  {
    icon: '🥇',
    title: 'Winner — Startup Weekend Jaipur',
    year: '2025',
    description:
      'Built and pitched a startup prototype within 54 hours, securing 1st place; presented to industry leaders including CTO of GeeksforGeeks.',
    certificateUrl: 'https://drive.google.com/file/d/1uOfHbRdwNL9lJMooGPRn54Ja0wJpHl8I/view?usp=sharing',
    linkLabel: 'Certificate',
  },
  {
    icon: '⭐',
    title: 'Student of the Year Award',
    year: '2024',
    description:
      'Awarded for excellence across academics, innovation, and extracurricular leadership.',
    certificateUrl: 'https://drive.google.com/file/d/1AJgPZFNoLRD9vGSGXft_I1EYSGRNcZMx/view?usp=sharing',
    linkLabel: 'Certificate',
  },
  {
    icon: '🚀',
    title: 'Rauran Charge — AIC Registered Startup',
    year: '2024',
    description:
      'Founded Rauran Charge, a startup developing wireless charging solutions for electric vehicles, recognized under the Atal Incubation Centre incubation ecosystem.',
    certificateUrl: 'https://drive.google.com/file/d/1JmMIfLBs_3plhMTcthQrN5XHgyU5b3kC/view?usp=drivesdk',
    linkLabel: 'Incubation letter',
  },
]

function Achievements() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section className="sci-fi-section py-24" ref={ref}>
      <div className="section-container">
        <h2 className="section-title text-3xl md:text-5xl">Achievements</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.55 }}
              className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accentPrimary/50"
            >
              <div className="text-4xl">{item.icon}</div>
              <h3 className="mt-4 font-heading text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-slate-300">{item.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full border border-accentSecondary/45 bg-accentSecondary/10 px-3 py-1 font-mono text-xs text-accentSecondary">
                  {item.year}
                </span>
                <a
                  href={item.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accentPrimary hover:text-accentPrimary/90"
                >
                  <RiExternalLinkLine />
                  {item.linkLabel}
                  <RiArrowRightUpLine className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Achievements
