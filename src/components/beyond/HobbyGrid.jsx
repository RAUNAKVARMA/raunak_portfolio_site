import { Link } from 'react-router-dom'
import { interestEntries } from '../../data/interests'
import { editingClips } from '../../data/editingClips'
import { movies } from '../../data/movies'
import { prefetchVortexAtlas } from '../../lib/vortexAtlas'

const INTEREST_VISUALS = {
  cars: {
    accent: '#e22718',
    preview: '/images/drawings/ferrari-laferrari.png',
    label: 'Garage',
  },
  space: {
    accent: '#1c69d4',
    preview: '/images/art-vortex-astro.png',
    label: 'Cosmos',
  },
  drawing: {
    accent: '#e8e4dc',
    preview: '/images/drawings/aurora-wolf.png',
    label: 'Field',
  },
  cricket: {
    accent: '#4ade80',
    preview: '/images/drawings/portrait-kohli.png',
    label: 'Soon',
  },
  editing: {
    accent: '#c084fc',
    preview: editingClips[2].poster,
    label: 'Reels',
  },
  music: {
    accent: '#fbbf24',
    preview: null,
    label: 'Soon',
  },
  movies: {
    accent: '#f472b6',
    preview: movies[0].poster,
    label: 'Shelf',
  },
}

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

function InterestRow({ hobby }) {
  const visual = INTEREST_VISUALS[hobby.id] ?? { accent: '#ffffff', preview: null, label: 'Soon' }
  const isLive = Boolean(hobby.path)

  const inner = (
    <>
      <span className="beyond-index-row__ghost" aria-hidden>
        {hobby.tag}
      </span>

      {visual.preview ? (
        <span className="beyond-index-row__preview" aria-hidden>
          <img src={visual.preview} alt="" loading="lazy" decoding="async" />
          <span className="beyond-index-row__preview-veil" />
        </span>
      ) : null}

      <span
        className="beyond-index-row__accent"
        style={{ '--interest-accent': visual.accent }}
        aria-hidden
      />

      <span className="beyond-index-row__main">
        <span className="beyond-index-row__meta">
          <span className="beyond-index-row__tag">{hobby.tag}</span>
          <span className={`beyond-index-row__status${isLive ? ' is-live' : ''}`}>
            {isLive ? visual.label : 'Coming soon'}
          </span>
        </span>

        <span className="beyond-index-row__copy">
          <span className="beyond-index-row__title">{hobby.title}</span>
          <span className="beyond-index-row__blurb">{hobby.blurb}</span>
        </span>

        {isLive ? (
          <span className="beyond-index-row__cta" aria-hidden>
            Open
            <span className="beyond-index-row__cta-arrow">→</span>
          </span>
        ) : null}
      </span>
    </>
  )

  if (isLive) {
    return (
      <Link
        to={hobby.path}
        role="listitem"
        data-cursor-hover="true"
        className="beyond-index-row is-live"
        style={{ '--interest-accent': visual.accent }}
        onPointerEnter={() => warmDrawing(hobby.path)}
        onFocus={() => warmDrawing(hobby.path)}
        onTouchStart={() => warmDrawing(hobby.path)}
      >
        {inner}
      </Link>
    )
  }

  return (
    <article
      role="listitem"
      className="beyond-index-row is-soon"
      style={{ '--interest-accent': visual.accent }}
    >
      {inner}
    </article>
  )
}

function HobbyGrid() {
  return (
    <section className="beyond-interests" aria-labelledby="interests-heading">
      <div className="studio-container">
        <header className="beyond-interests-head">
          <p className="beyond-interests-eyebrow">The index</p>
          <h2 id="interests-heading" className="beyond-interests-title">
            What I love
          </h2>
          <p className="beyond-interests-lede">
            Seven rabbit holes I keep returning to. Five are live — tap in and wander.
          </p>
        </header>

        <div className="beyond-interests-list" role="list">
          {interestEntries.map((hobby) => (
            <InterestRow key={hobby.id} hobby={hobby} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HobbyGrid
