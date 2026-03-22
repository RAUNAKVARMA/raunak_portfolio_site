import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiCloseLine, RiMenu3Line } from 'react-icons/ri'

const links = [
  { label: 'Home', href: '#hero', section: 'hero' },
  { label: 'Projects', href: '#projects', section: 'projects' },
  { label: 'Research', href: '#research', section: 'research' },
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#030712]/75 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150">
        <div className="section-container flex h-[74px] items-center justify-between">
          <a
            href="#hero"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-purple-700 font-heading text-lg font-extrabold text-white shadow-[0_0_24px_rgba(34,211,238,0.35)]"
          >
            RV
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <a
                key={link.section}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSection === link.section
                    ? 'text-accentPrimary'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-borderColor text-textPrimary md:hidden"
            aria-label="Open menu"
          >
            <RiMenu3Line size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[60] w-[85%] max-w-sm border-l border-borderColor bg-bgSecondary p-6"
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="font-heading text-2xl">Navigate</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-borderColor p-2"
                aria-label="Close menu"
              >
                <RiCloseLine size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {links.map((link) => (
                <a
                  key={link.section}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-lg ${
                    activeSection === link.section ? 'text-accentPrimary' : 'text-textPrimary'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
