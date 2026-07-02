import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiCloseLine, RiMenu3Line } from 'react-icons/ri'

const links = [
  { label: 'Home', href: '#hero', section: 'hero' },
  { label: 'About', href: '#about', section: 'about' },
  { label: 'Projects', href: '#projects', section: 'projects' },
  { label: 'Experience', href: '#experience', section: 'experience' },
  { label: 'Contact', href: '#contact', section: 'contact' },
]

function Navbar() {
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.section))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0.1,
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header className="glass-panel fixed inset-x-4 top-4 z-50 mx-auto max-w-[1240px] rounded-2xl border-white/[0.1] bg-[#030712]/60 sm:inset-x-6 lg:inset-x-8">
        <div className="flex h-[68px] items-center justify-between px-4 sm:px-6">
          <a
            href="#hero"
            data-cursor-hover="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-heading text-lg font-bold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)]"
          >
            RV
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <a
                key={link.section}
                href={link.href}
                data-cursor-hover="true"
                aria-current={activeSection === link.section ? 'page' : undefined}
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSection === link.section
                    ? 'text-indigo-300'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.1] text-textPrimary md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <RiCloseLine className="text-xl" /> : <RiMenu3Line className="text-xl" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel fixed inset-x-4 top-[88px] z-50 mx-auto max-w-[1240px] p-4 md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.section}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    activeSection === link.section
                      ? 'bg-indigo-500/15 text-indigo-200'
                      : 'text-textMuted hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
