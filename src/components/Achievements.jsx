import { Link } from 'react-router-dom'
import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import SectionHeader from './ui/SectionHeader'

const achievements = [
  {
    title: 'Ideastorm Prelims — IIT Roorkee E-Summit',
    year: '2026',
    description:
      'Shortlisted to present Rauran Charge at Ideastorm (E-Summit, IIT Roorkee), a national-level startup pitching competition showcasing innovative business ideas.',
    certificateUrl: 'https://drive.google.com/file/d/115sNxhlov8apIAvuA2WRwJfUwGQdRfHe/view?usp=sharing',
    linkLabel: 'Certificate',
  },
  {
    title: 'Excellence Award for Research and Academic Achievement',
    year: '2026',
    description:
      'Awarded for outstanding contributions to research, international publications, and academic excellence.',
    certificateUrl: 'https://drive.google.com/file/d/15TqMgLZuJel8fKf8oFpNbxAZdZ4Yhd-f/view?usp=drivesdk',
    linkLabel: 'Certificate',
  },
  {
    title: 'Winner — Startup Weekend Jaipur',
    year: '2025',
    description:
      'Built and pitched a startup prototype within 54 hours, securing 1st place; presented to industry leaders including CTO of GeeksforGeeks.',
    certificateUrl: 'https://drive.google.com/file/d/1uOfHbRdwNL9lJMooGPRn54Ja0wJpHl8I/view?usp=sharing',
    linkLabel: 'Certificate',
  },
  {
    title: 'Student of the Year Award',
    year: '2024',
    description:
      'Awarded for excellence across academics, innovation, and extracurricular leadership.',
    certificateUrl: 'https://drive.google.com/file/d/1AJgPZFNoLRD9vGSGXft_I1EYSGRNcZMx/view?usp=sharing',
    linkLabel: 'Certificate',
  },
  {
    title: 'Rauran Charge — Startup Registered under Atal Incubation Centre (AIC)',
    year: '2024',
    description:
      'Founded Rauran Charge, a startup developing wireless charging solutions for electric vehicles, recognized under the Atal Incubation Centre incubation ecosystem.',
    certificateUrl: 'https://drive.google.com/file/d/1JmMIfLBs_3plhMTcthQrN5XHgyU5b3kC/view?usp=drivesdk',
    linkLabel: 'Incubation letter',
  },
]

function Achievements({ preview = false }) {
  const shown = preview ? achievements.slice(0, 3) : achievements

  return (
    <section className="section-surface-alt border-t border-white/[0.12] py-24">
      <SectionReveal className="section-container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4" data-reveal>
          <SectionHeader eyebrow="Recognition" title="Achievements" />
          {preview && (
            <Link
              to="/experience"
              data-cursor-hover="true"
              className="link-accent inline-flex items-center gap-1.5"
            >
              View all achievements
              <RiArrowRightUpLine />
            </Link>
          )}
        </div>
        <div className="divide-y divide-white/[0.12] border border-white/[0.12]">
          {shown.map((item) => (
            <article key={item.title} className="grid gap-4 bg-black p-6 sm:grid-cols-[80px_1fr]" data-reveal>
              <span className="font-mono text-sm text-textSubtle">{item.year}</span>
              <div>
                <h3 className="font-heading text-base font-bold leading-snug sm:text-lg">{item.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-textMuted">{item.description}</p>
                <a
                  href={item.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-hover="true"
                  className="link-accent mt-4 inline-flex items-center gap-1.5"
                >
                  <RiExternalLinkLine />
                  {item.linkLabel}
                  <RiArrowRightUpLine />
                </a>
              </div>
            </article>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default Achievements
