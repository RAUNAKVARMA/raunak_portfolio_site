import { Link } from 'react-router-dom'
import { interestEntries } from '../../data/interests'
import { prefetchVortexAtlas } from '../../lib/vortexAtlas'

function warmDrawing(path) {
  if (path === '/beyond/drawing') {
    prefetchVortexAtlas(8).catch(() => {})
  }
  if (path === '/beyond/cars') {
    import('./cars/carGltf').then(({ preloadCar }) => {
      import('../../data/favoriteCars').then(({ favoriteCars }) => {
        preloadCar(favoriteCars[0]?.modelUrl)
        window.setTimeout(() => {
          preloadCar('/models/cars/ferrari-f1-2026-concept.glb?v=4')
        }, 1800)
      })
    })
  }
}

function HobbyGrid() {
  return (
    <section
      data-fluid-zone="rich"
      className="studio-section"
      aria-labelledby="interests-heading"
    >
      <div className="studio-container">
        <p className="studio-eyebrow">Interests</p>
        <h2 id="interests-heading" className="studio-title">
          What I love
        </h2>
        <p className="studio-lede">
          Six recurring themes. Open an entry for the full note — Cars, Space, Drawing &amp; Video
          Editing are live; more pages next.
        </p>

        <div className="studio-index mt-6" role="list">
          {interestEntries.map((hobby) => {
            const body = (
              <>
                <span className="studio-index-num" aria-hidden>
                  {hobby.tag}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="studio-index-title">{hobby.title}</h3>
                      <p className="studio-index-body">{hobby.blurb}</p>
                    </div>
                    {hobby.path && (
                      <span
                        className="mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.14em] text-[color:var(--studio-text-muted)]"
                        aria-hidden
                      >
                        →
                      </span>
                    )}
                  </div>
                </div>
              </>
            )

            if (hobby.path) {
              return (
                <Link
                  key={hobby.id}
                  to={hobby.path}
                  role="listitem"
                  data-cursor-hover="true"
                  className="studio-index-item no-underline transition-[background-color] duration-150 hover:!bg-[#0a0a0a] focus-visible:!bg-[#0a0a0a]"
                  onPointerEnter={() => warmDrawing(hobby.path)}
                  onFocus={() => warmDrawing(hobby.path)}
                  onTouchStart={() => warmDrawing(hobby.path)}
                >
                  {body}
                </Link>
              )
            }

            return (
              <article key={hobby.id} className="studio-index-item" role="listitem">
                {body}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HobbyGrid
