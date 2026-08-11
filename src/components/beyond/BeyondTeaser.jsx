import { Link } from 'react-router-dom'

const interests = [
  { tag: 'Cars', desc: 'Design · performance · culture' },
  { tag: 'Space', desc: 'Orbits · launches · frontier' },
  { tag: 'Drawing', desc: 'Sketch before you ship' },
]

function BeyondTeaser() {
  return (
    <section
      data-fluid-zone="rich"
      className="beyond-studio border-t border-[color:var(--studio-border-muted)]"
      aria-labelledby="beyond-teaser-title"
    >
      <div className="studio-section">
        <div className="studio-container">
          <p className="studio-eyebrow">Beyond Work</p>
          <h2 id="beyond-teaser-title" className="studio-title">
            Cars · Space · Drawing
          </h2>
          <p className="studio-lede">
            Cricket, cars, space, and sketching — the obsessions that sit alongside models and papers.
          </p>

          <div className="studio-index mt-6 max-w-xl" role="list">
            {interests.map((item, index) => (
              <div key={item.tag} className="studio-index-item" role="listitem">
                <span className="studio-index-num" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="studio-index-title">{item.tag}</p>
                  <p className="studio-index-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link to="/beyond" className="studio-link mt-8" data-cursor-hover="true">
            Explore Beyond →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BeyondTeaser
