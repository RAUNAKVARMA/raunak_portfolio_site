import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import SectionHeader from './ui/SectionHeader'

const certs = [
  {
    name: 'Certified Project Manager',
    issuer: 'BITS School of Management (BITSOM)',
    year: '2025',
    description: 'Product Management with Generative & Agentic AI, focused on strategy and execution.',
    credentialUrl: 'https://drive.google.com/file/d/1bo9aS609XfKHuwFWaD7cbO7rwFI2rjF3/view',
  },
  {
    name: 'Google Project Management Professional Certificate',
    issuer: 'Google',
    year: '2025',
    description: 'Professional certificate covering project management fundamentals and agile execution.',
    credentialUrl:
      'https://www.coursera.org/account/accomplishments/professional-cert/certificate/KU6IJIZQ3TLL',
  },
  {
    name: 'Object-Oriented Programming Using Java',
    issuer: 'GeeksforGeeks',
    year: '2025',
    description: 'Validated proficiency in OOP principles and Java programming.',
    credentialUrl: 'https://www.geeksforgeeks.org/certificate/535414d44eee3e554747a30c765c9a8a',
  },
  {
    name: 'SAP Professional Fundamentals',
    issuer: 'SAP · Coursera',
    year: '2025',
    description: 'Foundational certification in SAP enterprise systems and business process integration.',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/certificate/PUZQ7Y60HH2R',
  },
]

function Certifications() {
  return (
    <section className="border-t border-white/[0.08] py-24">
      <SectionReveal className="section-container">
        <div className="mb-10" data-reveal>
          <SectionHeader eyebrow="Credentials" title="Certifications" />
        </div>
        <div className="divide-y divide-white/[0.08] border border-white/[0.08]">
          {certs.map((cert) => (
            <article key={cert.name} className="grid gap-4 bg-black p-6 sm:grid-cols-[80px_1fr]" data-reveal>
              <span className="font-mono text-sm text-textSubtle">{cert.year}</span>
              <div>
                <h3 className="font-heading text-base font-bold sm:text-lg">{cert.name}</h3>
                <p className="mt-1 font-mono text-xs text-textSubtle">{cert.issuer}</p>
                <p className="mt-3 text-sm font-light text-textMuted">{cert.description}</p>
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-hover="true"
                  className="link-accent mt-4 inline-flex items-center gap-1.5"
                >
                  <RiExternalLinkLine />
                  View credential
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

export default Certifications
