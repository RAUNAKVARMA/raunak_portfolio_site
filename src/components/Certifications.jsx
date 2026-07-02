import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import GlassCard from './ui/GlassCard'

const certs = [
  {
    icon: '🎓',
    name: 'Certified Project Manager',
    issuer: 'BITS School of Management (BITSOM)',
    year: '2025',
    description: 'Product Management with Generative & Agentic AI, focused on strategy and execution.',
    credentialUrl: 'https://drive.google.com/file/d/1bo9aS609XfKHuwFWaD7cbO7rwFI2rjF3/view',
  },
  {
    icon: '📋',
    name: 'Google Project Management Professional Certificate',
    issuer: 'Google',
    year: '2025',
    description: 'Professional certificate covering project management fundamentals and agile execution.',
    credentialUrl:
      'https://www.coursera.org/account/accomplishments/professional-cert/certificate/KU6IJIZQ3TLL',
  },
  {
    icon: '☕',
    name: 'Object-Oriented Programming Using Java',
    issuer: 'GeeksforGeeks',
    year: '2025',
    description: 'Validated proficiency in OOP principles and Java programming.',
    credentialUrl: 'https://www.geeksforgeeks.org/certificate/535414d44eee3e554747a30c765c9a8a',
  },
]

function Certifications() {
  return (
    <section className="py-24">
      <SectionReveal className="section-container">
        <h2 className="section-title" data-reveal>
          Certifications
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <GlassCard key={cert.name} className="group p-6" data-reveal>
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl">{cert.icon}</div>
                <span className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-xs text-textMuted">
                  {cert.year}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold">{cert.name}</h3>
              <p className="mt-2 text-sm text-indigo-300">{cert.issuer}</p>
              <p className="mt-3 text-slate-300">{cert.description}</p>
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover="true"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
              >
                <RiExternalLinkLine />
                View credential
                <RiArrowRightUpLine className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </GlassCard>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default Certifications
