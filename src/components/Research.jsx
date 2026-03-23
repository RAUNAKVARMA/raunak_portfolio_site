import { motion } from 'framer-motion'
import { RiArrowRightUpLine, RiExternalLinkLine, RiFlaskLine } from 'react-icons/ri'
import { useInView } from 'react-intersection-observer'

const activeResearch = [
  {
    title: 'Hybrid LLM-MARL Coordination Framework (MHS+)',
    description:
      'Designing a cooperative intelligence stack where large language models orchestrate multi-agent reinforcement learning policies for adaptive decision systems.',
    tech: ['LLMs', 'MARL', 'Coordination Policies'],
  },
  {
    title: 'Wireless Power Transfer System + ML Optimization',
    description:
      'Combining electromagnetic transfer design with machine learning optimization to maximize EV charging efficiency under real-world operating constraints.',
    tech: ['Wireless Power', 'Optimization', 'Predictive Modeling'],
  },
]

const publications = [
  {
    year: '2026',
    items: [
      {
        title: 'Advanced Wireless System Design',
        publisher: 'Elsevier',
        status: 'Under Review',
      },
    ],
  },
  {
    year: '2025',
    items: [
      {
        title:
          'System Design Methodology and Efficiency Optimization of Wireless Charging for Electric Vehicles — ICSoftComp / ICSCEA 2025',
        publisher: 'Conference (Full Paper)',
        status: 'Full Paper',
        paperUrl:
          'https://drive.google.com/file/d/1owhIK2cbkbUreXc3ZlyPKa-johDQmUQI/view?usp=drivesdk',
      },
      {
        title:
          'Wireless Charging for Electric Vehicles: A Comprehensive Review — SSIC 2025',
        publisher: 'Conference (Full Paper)',
        status: 'Full Paper',
        paperUrl:
          'https://drive.google.com/file/d/1uAdgaP9-Af-k05WyboCnqxA6ObpSb4Ir/view?usp=drivesdk',
      },
    ],
  },
]

function Research() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section id="research" className="sci-fi-section py-24" ref={ref}>
      <div className="section-container">
        <div className="relative mb-14">
          <span className="section-number">03</span>
          <h2 className="section-title">{'Research & Publications'}</h2>
        </div>

        <div className="space-y-5">
          {activeResearch.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accentPrimary/10 text-accentPrimary shadow-cyan">
                  <RiFlaskLine />
                </span>
                <h3 className="font-heading text-2xl font-bold">{item.title}</h3>
                <span className="rounded-full border border-accentPrimary/40 bg-accentPrimary/10 px-3 py-1 text-xs text-accentPrimary">
                  Active Research
                </span>
              </div>
              <p className="mt-4 text-slate-300">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-14 space-y-8">
          {publications.map((group, groupIndex) => (
            <motion.div
              key={group.year}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + groupIndex * 0.1, duration: 0.6 }}
              className="grid gap-4 md:grid-cols-[100px_1fr]"
            >
              <div className="flex items-start gap-2">
                <span className="mt-2 h-3 w-3 rounded-full bg-accentPrimary shadow-cyan" />
                <span className="font-heading text-3xl text-accentPrimary">{group.year}</span>
              </div>
              <div className="space-y-4 border-l border-borderColor pl-6">
                {group.items.map((paper) => (
                  <article key={paper.title} className="rounded-xl border border-borderColor bg-bgSecondary/60 p-4">
                    <h4 className="text-lg font-semibold">{paper.title}</h4>
                    <p className="mt-1 text-sm text-accentPrimary">{paper.publisher}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-block rounded-full border border-accentSecondary/50 bg-accentSecondary/10 px-3 py-1 font-mono text-xs text-accentSecondary">
                        {paper.status}
                      </span>
                      {paper.paperUrl && (
                        <a
                          href={paper.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-accentPrimary hover:text-accentPrimary/90"
                        >
                          <RiExternalLinkLine />
                          View paper (PDF)
                          <RiArrowRightUpLine className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Research
