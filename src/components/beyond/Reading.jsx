import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { preloadReadingCovers, readingShelf, readingTopics } from '../../data/reading'

const BookGlobeCanvas = lazy(() => import('./BookGlobeCanvas'))

const EASE = [0.16, 1, 0.3, 1]

function BookRow({ book, index, active, onEnter, onLeave, reducedMotion }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })

  return (
    <motion.article
      ref={ref}
      className={`shelf-book${active ? ' is-active' : ''}`}
      style={{ '--book-accent': book.accent }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.28), ease: EASE }}
    >
      <span className="shelf-book__spine" aria-hidden />
      <span className="shelf-book__index" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="shelf-book__body">
        <div className="shelf-book__top">
          <h3 className="shelf-book__title">{book.title}</h3>
          <span className="shelf-book__tag">{book.tag}</span>
        </div>
        <p className="shelf-book__by">{book.by}</p>
        <p className="shelf-book__note">{book.note}</p>
      </div>
      <span className="shelf-book__ghost" aria-hidden>
        {book.title.slice(0, 1)}
      </span>
    </motion.article>
  )
}

function TopicTile({ topic, index, reducedMotion }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-6% 0px' })

  return (
    <motion.li
      ref={ref}
      className="curiosity-tile"
      style={{ '--topic-accent': topic.accent }}
      initial={reducedMotion ? false : { opacity: 0, x: 18 }}
      animate={inView || reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: EASE }}
    >
      <span className="curiosity-tile__pulse" aria-hidden />
      <span className="curiosity-tile__signal">{topic.signal}</span>
      <span className="curiosity-tile__label">{topic.label}</span>
    </motion.li>
  )
}

function Reading() {
  const reducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(null)
  const [globeActive, setGlobeActive] = useState(false)
  const headRef = useRef(null)
  const globeRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-10% 0px' })
  const globeInView = useInView(globeRef, { margin: '15% 0px', amount: 0.2 })

  useEffect(() => {
    preloadReadingCovers()
  }, [])

  useEffect(() => {
    setGlobeActive(Boolean(globeInView) && !reducedMotion)
  }, [globeInView, reducedMotion])

  return (
    <section className="reading-room" aria-labelledby="reading-heading">
      <div className="reading-room__glow" aria-hidden />
      <div className="reading-room__grain" aria-hidden />

      <div className="reading-room__inner">
        <motion.header
          ref={headRef}
          className="reading-room__head"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={headInView || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="reading-room__eyebrow">Reading · Curiosity</p>
          <h2 id="reading-heading" className="reading-room__title">
            On my shelf
          </h2>
          <p className="reading-room__lede">
            A revolving fan of covers from the shelf — drag to spin, then skim the spines below.
          </p>
        </motion.header>

        <div ref={globeRef} className="reading-globe-stage">
          {reducedMotion ? (
            <div className="book-globe__fallback" aria-hidden />
          ) : (
            <Suspense fallback={<div className="book-globe__fallback" aria-hidden />}>
              <BookGlobeCanvas
                books={readingShelf}
                active={globeActive}
                reducedMotion={Boolean(reducedMotion)}
              />
            </Suspense>
          )}
        </div>

        <div className="reading-room__grid">
          <div className="shelf-panel">
            <div className="shelf-panel__meta">
              <span className="shelf-panel__label">Library</span>
              <span className="shelf-panel__count">{readingShelf.length} titles</span>
            </div>

            <div className="shelf-rail" role="list" aria-label="Books on my shelf">
              {readingShelf.map((book, index) => (
                <div key={book.id} role="listitem">
                  <BookRow
                    book={book}
                    index={index}
                    active={activeIndex === index}
                    onEnter={() => setActiveIndex(index)}
                    onLeave={() => setActiveIndex(null)}
                    reducedMotion={Boolean(reducedMotion)}
                  />
                </div>
              ))}
            </div>
          </div>

          <aside className="curiosity-panel" aria-labelledby="curiosity-heading">
            <div className="curiosity-panel__glow" aria-hidden />
            <p className="curiosity-panel__eyebrow">Live signal</p>
            <h3 id="curiosity-heading" className="curiosity-panel__title">
              Currently exploring
            </h3>
            <p className="curiosity-panel__lede">
              Topics under active attention — never an empty desk.
            </p>

            <ul className="curiosity-stack" aria-label="Topics currently exploring">
              {readingTopics.map((topic, index) => (
                <TopicTile
                  key={topic.label}
                  topic={topic}
                  index={index}
                  reducedMotion={Boolean(reducedMotion)}
                />
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Reading
