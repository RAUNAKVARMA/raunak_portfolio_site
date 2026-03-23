import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiGithubLine, RiLinkedinLine, RiMailLine } from 'react-icons/ri'
import { useInView } from 'react-intersection-observer'
import MagneticButton from './ui/MagneticButton'
import ContactSciFiDecor from './ui/ContactSciFiDecor'

const cards = [
  {
    label: 'Email',
    value: 'raunaknitinvarma@gmail.com',
    href: 'mailto:raunaknitinvarma@gmail.com',
    icon: RiMailLine,
  },
  { label: 'GitHub', value: 'github.com/RAUNAKVARMA', href: 'https://github.com/RAUNAKVARMA', icon: RiGithubLine },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/raunak-varma-8656382b2',
    href: 'https://www.linkedin.com/in/raunak-varma-8656382b2/',
    icon: RiLinkedinLine,
  },
]

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/40'

function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })
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
    <section id="contact" className="sci-fi-section relative py-24" ref={ref}>
      <div className="section-container text-center">
        <div className="relative mb-8">
          <span className="section-number left-1/2 -translate-x-1/2">06</span>
          <h2 className="section-title">Let&apos;s Build</h2>
        </div>

        <p className="mx-auto max-w-2xl text-lg text-slate-300">
          Open to AI engineering roles, research collaborations, and co-founding opportunities.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.6 }}
              className="glass-card rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-accentPrimary/45 hover:shadow-cyan"
            >
              <card.icon className="text-2xl text-accentPrimary" />
              <p className="mt-3 text-sm text-textMuted">{card.label}</p>
              <p className="mt-1 break-all font-medium text-textPrimary">{card.value}</p>
            </motion.a>
          ))}
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-indigo-950/80 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:p-8">
            <ContactSciFiDecor />

            <div className="relative z-10 text-left">
              <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
                Secure channel · Message
              </p>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-slate-400">
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
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-slate-400">
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
                  <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-slate-400">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-3.5 font-semibold text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.45)] transition hover:shadow-[0_0_48px_rgba(34,211,238,0.55)]"
                  >
                    {isSubmitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </MagneticButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-[70] rounded-lg border border-accentPrimary/40 bg-bgSecondary px-4 py-3 text-sm text-accentPrimary shadow-cyan"
          >
            Message sent successfully.
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Contact
