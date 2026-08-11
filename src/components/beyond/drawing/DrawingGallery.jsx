import { drawingArtworks } from '../../../data/drawings'
import DrawingArchiveExperience from './DrawingArchiveExperience'

/** Flat scan list — reduced-motion / export fallback. */
function DrawingGallery() {
  return (
    <div className="drawing-gallery" role="list">
      {drawingArtworks.map((piece, index) => (
        <figure
          key={piece.id}
          role="listitem"
          className={`drawing-tile${piece.featured ? ' is-featured' : ''}`}
        >
          <span className="drawing-tile-media">
            <img src={piece.src} alt={piece.title} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
          </span>
          <figcaption className="drawing-tile-meta">
            <span className="drawing-tile-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="drawing-tile-title">{piece.title}</span>
            {piece.note ? <span className="drawing-tile-note">{piece.note}</span> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Archive mode — full Coil stage only (wheel drives morphs). */
function DrawingGallerySection() {
  return (
    <section className="drawing-archive-section drawing-archive-section-local" aria-label="The Coil">
      <div className="drawing-archive-shell drawing-archive-shell-local">
        <DrawingArchiveExperience />
      </div>
    </section>
  )
}

export { DrawingGallery }
export default DrawingGallerySection
