import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import SectionHeader from './ui/SectionHeader'
import MStripe from './ui/MStripe'
import { prefetchAboutRoute } from './about/aboutPrefetch'

const pages = [
  {
    label: 'Work',
    to: '/work',
    desc: 'Projects, builds, and certifications',
  },
  {
    label: 'About',
    to: '/about',
    desc: 'Background, skills, and stack',
  },
  {
    label: 'Experience',
    to: '/experience',
    desc: 'Roles, research timeline, and awards',
  },
]

function HomeExplore() {
  return (
    <section className="section-surface border-t border-white/[0.12]">
      <SectionReveal className="section-container py-20 sm:py-24">
        <div className="mb-12" data-reveal>
          <SectionHeader eyebrow="Explore" title="Go Deeper" />
        </div>

        <div className="grid gap-px bg-white/[0.12] sm:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              data-cursor-hover="true"
              data-reveal
              onMouseEnter={page.to === '/about' ? prefetchAboutRoute : undefined}
              onFocus={page.to === '/about' ? prefetchAboutRoute : undefined}
              className="group bg-[#0a0a0a] p-8 transition-colors hover:bg-[#141414] sm:p-10"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#1c69d4]">Section</p>
              <h3 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
                {page.label}
              </h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-textMuted">{page.desc}</p>
              <span className="link-accent mt-8 inline-flex items-center gap-1.5">
                Open
                <RiArrowRightUpLine className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </SectionReveal>
      <MStripe />
    </section>
  )
}

export default HomeExplore
