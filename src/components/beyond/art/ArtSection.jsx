import { Link } from 'react-router-dom'

/**
 * Compact Beyond teaser — full twin vortex lives on /beyond/drawing.
 */
function ArtSection() {
  return (
    <section className="studio-section" aria-labelledby="art-section-title">
      <div className="studio-container">
        <p className="studio-eyebrow">Art</p>
        <h2 id="art-section-title" className="studio-title">
          Drawing
        </h2>
        <p className="studio-lede">
          Twin-vortex field, sketch archive, and immersive scroll. Open the Drawing page for the
          full experience.
        </p>
        <p className="mt-6">
          <Link to="/beyond/drawing" className="studio-link" data-cursor-hover="true">
            Enter Drawing →
          </Link>
        </p>
      </div>
    </section>
  )
}

export default ArtSection
