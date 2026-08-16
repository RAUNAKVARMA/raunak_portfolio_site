import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { musicClips } from '../../../data/music'
import AutoPlayVideo from '../../ui/AutoPlayVideo'

const EASE = [0.16, 1, 0.3, 1]

function MusicCard({ clip, index, reducedMotion }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  /** Mount video as soon as it’s near the viewport so mobile autoplay is ready. */
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          setArmed(true)
        } else {
          setInView(false)
        }
      },
      { rootMargin: '40% 0px', threshold: 0.01 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.article
      ref={ref}
      className="music-card"
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.24), ease: EASE }}
    >
      <div className="music-card__media">
        {armed ? (
          <AutoPlayVideo
            src={clip.src}
            className="music-card__video"
            aria-label={`${clip.title} by ${clip.artist}`}
            pauseWhenHidden
            loop
          />
        ) : (
          <div className="music-card__placeholder" aria-hidden />
        )}
        <div className="music-card__scrim" aria-hidden />
        <div className="music-card__meta">
          <p className="music-card__title">{clip.title}</p>
          <p className="music-card__artist">{clip.artist}</p>
        </div>
      </div>
    </motion.article>
  )
}

/** Muted autoplay video cards — reveal on scroll below the cube. */
function MusicClipCards() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="music-cards" aria-labelledby="music-cards-heading">
      <div className="music-cards__head">
        <h2 id="music-cards-heading" className="music-cards__label">
          Selected tracks
        </h2>
      </div>
      <div className="music-cards__grid">
        {musicClips.map((clip, index) => (
          <MusicCard key={clip.id} clip={clip} index={index} reducedMotion={Boolean(reducedMotion)} />
        ))}
      </div>
    </section>
  )
}

export default MusicClipCards
