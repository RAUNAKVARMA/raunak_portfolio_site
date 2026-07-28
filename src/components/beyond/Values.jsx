import { Link } from 'react-router-dom'

const values = [
  {
    title: 'Curiosity first',
    text: 'I chase questions before answers — the best ideas start as "what if".',
  },
  {
    title: 'Build to learn',
    text: 'Shipping small things quickly teaches me more than any theory alone.',
  },
  {
    title: 'Play the long game',
    text: 'Whether cricket or research, consistency beats intensity over time.',
  },
]

function Values() {
  return (
    <section className="studio-section" aria-labelledby="values-heading">
      <div className="studio-container">
        <p className="studio-eyebrow">Values</p>
        <h2 id="values-heading" className="studio-title">
          What drives me
        </h2>
        <p className="studio-lede">Operating principles. Concise, testable against how I work.</p>

        <div className="studio-index mt-6" role="list">
          {values.map((value, index) => (
            <article key={value.title} className="studio-index-item" role="listitem">
              <span className="studio-index-num" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="studio-index-title">{value.title}</h3>
                <p className="studio-index-body">{value.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/contact" className="studio-link" data-cursor-hover="true">
            Let&apos;s connect →
          </Link>
          <span className="text-[color:var(--studio-text-muted)]">
            Prefer email or LinkedIn from the contact index.
          </span>
        </div>
      </div>
    </section>
  )
}

export default Values
