import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiGithubLine, RiLinkedinLine, RiMailLine } from 'react-icons/ri'
import { useInView } from 'react-intersection-observer'
import MagneticButton from './ui/MagneticButton'

const cards = [
  { label: 'Email', value: 'raunak.varma.ai@gmail.com', href: 'mailto:raunak.varma.ai@gmail.com', icon: RiMailLine },
  { label: 'GitHub', value: 'github.com/raunak-varma', href: 'https://github.com', icon: RiGithubLine },
  { label: 'LinkedIn', value: 'linkedin.com/in/raunakvarma', href: 'https://linkedin.com', icon: RiLinkedinLine },
]

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
    <section id="contact" className="sci-fi-section py-24" ref={ref}>
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

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 grid max-w-3xl gap-4 rounded-2xl border border-borderColor bg-white/[0.03] p-5 text-left backdrop-blur-md"
        >
          <input
            required
            placeholder="Name"
            className="rounded-xl border border-borderColor bg-bgSecondary/70 px-4 py-3 text-textPrimary outline-none transition-colors focus:border-accentPrimary/60"
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="rounded-xl border border-borderColor bg-bgSecondary/70 px-4 py-3 text-textPrimary outline-none transition-colors focus:border-accentPrimary/60"
          />
          <textarea
            required
            rows={5}
            placeholder="Message"
            className="rounded-xl border border-borderColor bg-bgSecondary/70 px-4 py-3 text-textPrimary outline-none transition-colors focus:border-accentPrimary/60"
          />
          <div>
            <MagneticButton
              type="submit"
              className="inline-flex items-center gap-2 bg-accentPrimary px-5 py-3 font-semibold text-bgPrimary"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-bgPrimary border-t-transparent" />
              )}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </MagneticButton>
          </div>
        </form>
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
