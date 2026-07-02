import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiGithubLine, RiGraduationCapLine, RiLinkedinLine, RiMailLine } from 'react-icons/ri'
import MagneticButton from './ui/MagneticButton'
import GlassPanel from './ui/GlassPanel'
import SectionReveal from './layout/SectionReveal'

const cards = [
  {
    label: 'Email',
    value: 'raunaknitinvarma@gmail.com',
    href: 'mailto:raunaknitinvarma@gmail.com',
    icon: RiMailLine,
  },
  {
    label: 'GitHub',
    value: 'github.com/RAUNAKVARMA',
    href: 'https://github.com/RAUNAKVARMA',
    icon: RiGithubLine,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/raunak-varma-8656382b2',
    href: 'https://www.linkedin.com/in/raunak-varma-8656382b2/',
    icon: RiLinkedinLine,
  },
  {
    label: 'Google Scholar',
    value: 'scholar.google.com',
    href: 'https://scholar.google.com/citations?user=tlqu2IoAAAAJ',
    icon: RiGraduationCapLine,
  },
]

const fieldClass =
  'w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3.5 text-[15px] text-textPrimary outline-none transition placeholder:text-textMuted focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/25'

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setShowToast(true)
      event.target.reset()
      setTimeout(() => setShowToast(false), 2600)
    }, 1200)
  }

  return (
    <section id="contact" className="relative py-24">
      <SectionReveal className="section-container text-center">
        <div className="relative mb-8" data-reveal>
          <span className="section-number left-1/2 -translate-x-1/2">06</span>
          <h2 className="section-title">Let&apos;s Build</h2>
        </div>

        <p className="mx-auto max-w-2xl text-lg text-slate-300" data-reveal>
          Open to AI engineering roles, research collaborations, and co-founding opportunities.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover="true"
              data-reveal
              className="glass-card block p-5 text-left transition-transform duration-300 hover:-translate-y-1"
            >
              <card.icon className="text-2xl text-indigo-300" />
              <p className="mt-3 text-sm text-textMuted">{card.label}</p>
              <p className="mt-1 break-all font-medium text-textPrimary">{card.value}</p>
            </a>
          ))}
        </div>

        <GlassPanel className="relative mx-auto mt-12 max-w-3xl p-6 text-left md:p-8" data-reveal>
          <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-indigo-300/80">
            Message
          </p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-textMuted">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                required
                autoComplete="name"
                placeholder="Your name"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-textMuted">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-textMuted">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                placeholder="Tell me about your project or opportunity…"
                className={`${fieldClass} min-h-[140px] resize-y leading-relaxed`}
              />
            </div>
            <div className="pt-1">
              <MagneticButton
                type="submit"
                data-cursor-hover="true"
                className="inline-flex items-center gap-2 bg-indigo-500 px-6 py-3.5 font-semibold text-white shadow-[0_0_32px_rgba(99,102,241,0.35)] hover:bg-indigo-400"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </MagneticButton>
            </div>
          </form>
        </GlassPanel>
      </SectionReveal>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-[70] rounded-lg border border-indigo-400/40 bg-bgSecondary px-4 py-3 text-sm text-indigo-200 shadow-glass"
          >
            Message sent successfully.
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Contact
