import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import GlassCard from './ui/GlassCard'

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
  return (
    <section className="py-24">
      <SectionReveal className="section-container">
        <h2 className="section-title" data-reveal>
          Achievements
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item) => (
            <GlassCard key={item.title} className="flex flex-col p-6" data-reveal>
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" aria-hidden>
                  {item.icon}
                </span>
                <span className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-xs text-textMuted">
                  {item.year}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold leading-snug">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{item.description}</p>
              <a
                href={item.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover="true"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
              >
                <RiExternalLinkLine />
                {item.linkLabel}
                <RiArrowRightUpLine />
              </a>
            </GlassCard>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default Achievements
