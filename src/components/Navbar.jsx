import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Link } from 'react-router-dom'
import { RiCloseLine, RiMenu3Line } from 'react-icons/ri'

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Work', to: '/work' },
  { label: 'Experience', to: '/experience' },
  { label: 'Beyond', to: '/beyond' },
  { label: 'Contact', to: '/contact' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-md">
        <div className="section-container flex h-[72px] items-center justify-between">
          <Link
            to="/"
            data-cursor-hover="true"
            className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70"
            aria-label="Home"
          >
            RV
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                data-cursor-hover="true"
                className={({ isActive }) =>
                  `relative font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-textSubtle hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0066b1] via-[#1c69d4] to-[#e22718]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border border-white/25 bg-black text-white md:hidden"
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
            className="fixed inset-x-0 top-[72px] z-50 border-b border-white/[0.12] bg-black md:hidden"
          >
            <nav className="section-container flex flex-col py-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-white/[0.08] px-2 py-4 font-mono text-[11px] uppercase tracking-[0.22em] last:border-0 ${
                      isActive ? 'text-white' : 'text-textSubtle'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
