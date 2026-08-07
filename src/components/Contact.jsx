import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiGithubLine, RiGraduationCapLine, RiLinkedinLine, RiMailLine } from 'react-icons/ri'
import MagneticButton from './ui/MagneticButton'
import SectionReveal from './layout/SectionReveal'
import SectionHeader from './ui/SectionHeader'

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
    <section
      id="contact"
      data-fluid-zone="soft"
      className="relative border-t border-white/[0.08] py-24"
    >
      <SectionReveal className="section-container">
        <div className="mb-12" data-reveal>
          <SectionHeader
            eyebrow="06 — Contact"
            title="Let's Build"
            subtitle="Open to AI engineering roles, research collaborations, and co-founding opportunities."
            align="center"
            className="mx-auto items-center text-center"
          />
        </div>

        <div className="grid gap-px bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover="true"
              data-reveal
              className="block bg-black p-6 transition-colors hover:bg-bgElevated"
            >
              <card.icon className="text-xl text-textMuted" />
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-textSubtle">{card.label}</p>
              <p className="mt-2 break-all text-sm font-light text-textPrimary">{card.value}</p>
            </a>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl border border-white/[0.12] bg-black p-6 md:p-8" data-reveal>
          <p className="section-eyebrow mb-6">Message</p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-textSubtle">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                required
                autoComplete="name"
                placeholder="Your name"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-textSubtle">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-textSubtle">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                placeholder="Tell me about your project or opportunity…"
                className="field-input min-h-[140px] resize-y leading-relaxed"
              />
            </div>
            <div className="pt-1">
              <MagneticButton
                type="submit"
                data-cursor-hover="true"
                className="pill-btn-dark"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </MagneticButton>
            </div>
          </form>
        </div>
      </SectionReveal>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-[70] border border-white/[0.15] bg-black px-4 py-3 font-mono text-xs uppercase tracking-wider text-textMuted"
          >
            Message sent successfully.
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Contact
