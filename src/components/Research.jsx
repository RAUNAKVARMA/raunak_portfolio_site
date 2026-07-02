import { motion } from 'framer-motion'
import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import { useInView } from 'react-intersection-observer'

export const publications = [
  {
    year: '2026',
    items: [
      {
        title:
          'Hybrid Microwave–Resonant Inductive Wireless Charging Method with Oscillation-Enhanced Efficiency for Electric Vehicles',
        venue: 'IEEE Open Access Journal',
        status: 'Under Review',
        links: [
          { label: 'Journal', url: 'https://open.ieee.org/publishing-options/topical-journals/' },
        ],
      },
      {
        title: 'Meta AI Agents: Multi-Agent Coordination',
        venue: 'DISHA 2026 — International Conference on Deep Learning Innovations for Smart Humanized AI',
        status: 'To Appear',
        links: [{ label: 'Conference', url: 'https://www.disha2026.com/' }],
      },
      {
        title:
          'Design and Performance Evaluation of a Hybrid Microwave–Resonant Inductive Wireless Power Transfer Architecture for Intelligent EV Charging Applications',
        venue: '8th icSoftComp 2026, Springer CCIS',
        status: 'Under Review',
        links: [{ label: 'Conference', url: 'https://www.icsoftcomp.org/' }],
      },
    ],
  },
  {
    year: '2025',
    items: [
      {
        title:
          'System Design Methodology and Efficiency Optimization of Wireless Charging for Electric Vehicles',
        venue: 'Seventh International Conference on Soft Computing and its Engineering Applications (2025)',
        status: 'Published',
        links: [
          {
            label: 'Published',
            url: 'https://link.springer.com/chapter/10.1007/978-3-032-22065-3_22#citeas',
          },
          {
            label: 'Certificate',
            url: 'https://drive.google.com/file/d/1qDBN5-whnB5KL2ZLA7zHdzYUCCoiDArf/view?usp=drivesdk',
          },
        ],
      },
      {
        title: 'Wireless Charging for Electric Vehicles: A Comprehensive Review',
        venue: '5th International Conference on Smart Systems: Innovations in Computing (2025)',
        status: 'Published',
        links: [
          {
            label: 'Paper',
            url: 'https://drive.google.com/file/d/1m3h1w6wZa6JyDmzrGSybhk-fzB7eWyrg/view?usp=drivesdk',
          },
          {
            label: 'Conference',
            url: 'https://jaipur.manipal.edu/fosta/event-details.php?url=584/5th-international-conference-on-smart',
          },
          {
            label: 'Certificate',
            url: 'https://drive.google.com/file/d/1Je_wn4qkPGglSd64NTFLL2bDeBkeAkRS/view?usp=drivesdk',
          },
        ],
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

        <div className="space-y-8">
          {publications.map((group, groupIndex) => (
            <motion.div
              key={group.year}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + groupIndex * 0.1, duration: 0.6 }}
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
                    <p className="mt-1 text-sm text-slate-400">{paper.venue}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-block rounded-full border border-accentSecondary/50 bg-accentSecondary/10 px-3 py-1 font-mono text-xs text-accentSecondary">
                        {paper.status}
                      </span>
                      {paper.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-accentPrimary hover:text-accentPrimary/90"
                        >
                          <RiExternalLinkLine />
                          {link.label}
                          <RiArrowRightUpLine className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </a>
                      ))}
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
