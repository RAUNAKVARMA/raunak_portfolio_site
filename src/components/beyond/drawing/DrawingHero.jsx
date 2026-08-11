import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { drawingArtworks } from '../../../data/drawings'

const HERO_VIDEO = '/videos/drawing/drawing-hero.mp4'
const HERO_POSTER = '/videos/drawing/drawing-hero-poster.jpg'

function DrawingHero({ title = 'Drawing', blurb, story = [] }) {
  const reduce = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1]

  const fadeUp = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.85, delay, ease },
        }

  return (
    <section className="drawing-hero" aria-labelledby="drawing-hero-title">
      <div className="drawing-hero-stage">
        <motion.div
          className="drawing-hero-media"
          aria-hidden
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.35, ease }}
        >
          {reduce ? (
            <img src={HERO_POSTER} alt="" className="drawing-hero-image" />
          ) : (
            <video
              className="drawing-hero-video"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          )}
          <div className="drawing-hero-veil" />
          <div className="drawing-hero-grain" />
        </motion.div>

        <div className="drawing-hero-content studio-container">
          <motion.div className="drawing-hero-top" {...fadeUp(0.05)}>
            <Link to="/beyond" className="drawing-hero-back" data-cursor-hover="true">
              ← Beyond
            </Link>
            <p className="drawing-hero-index">Interest 03 · {String(drawingArtworks.length).padStart(2, '0')} pieces</p>
          </motion.div>

          <div className="drawing-hero-main">
            <motion.p className="drawing-hero-eyebrow" {...fadeUp(0.12)}>
              Graphite · Color · Studies
            </motion.p>
            <motion.h1 id="drawing-hero-title" className="drawing-hero-title" {...fadeUp(0.18)}>
              {title}
            </motion.h1>
            <motion.p className="drawing-hero-lede" {...fadeUp(0.28)}>
              {blurb}
            </motion.p>

            {story[0] ? (
              <motion.p className="drawing-hero-story" {...fadeUp(0.36)}>
                {story[0]}
              </motion.p>
            ) : null}

            <motion.div className="drawing-hero-actions" {...fadeUp(0.46)}>
              <a href="#drawing-vortex" className="drawing-hero-cta" data-cursor-hover="true">
                Enter twin vortex
              </a>
              <a href="#drawing-archive" className="drawing-hero-cta-ghost" data-cursor-hover="true">
                Browse archive
              </a>
            </motion.div>
          </div>

          <motion.div className="drawing-hero-foot" {...fadeUp(0.55)}>
            <p className="drawing-hero-credit">
              Featured · <span>Portrait in graphite</span>
            </p>
            <p className="drawing-hero-scroll" aria-hidden>
              Scroll
              <span className="drawing-hero-scroll-line" />
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default DrawingHero
