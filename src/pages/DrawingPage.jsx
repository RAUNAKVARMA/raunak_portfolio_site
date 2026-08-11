import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getInterestById } from '../data/interests'
import DrawingFieldExperience from '../components/beyond/drawing/DrawingFieldExperience'
import DrawingGallerySection from '../components/beyond/drawing/DrawingGallery'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useLenis } from '../providers/SmoothScrollProvider'
import { prefetchVortexAtlas } from '../lib/vortexAtlas'

function DrawingPage() {
  useDocumentTitle('Drawing')
  const interest = getInterestById('drawing')
  const [searchParams, setSearchParams] = useSearchParams()
  const lenisRef = useLenis()

  const mode = useMemo(() => {
    const raw = searchParams.get('mode')
    return raw === 'archive' ? 'archive' : 'field'
  }, [searchParams])

  useEffect(() => {
    prefetchVortexAtlas(8).catch(() => {})
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('drawing-archive-mode', mode === 'archive')
    document.body.classList.toggle('drawing-archive-mode', mode === 'archive')
    return () => {
      document.documentElement.classList.remove('drawing-archive-mode')
      document.body.classList.remove('drawing-archive-mode')
    }
  }, [mode])

  useEffect(() => {
    const lenis = lenisRef?.current
    // Field owns its own touch/wheel → vortex; never let Lenis scroll the document
    // or phones overscroll into a black gap under the canvas.
    try {
      lenis?.stop?.()
      lenis?.scrollTo?.(0, { immediate: true })
    } catch {
      /* */
    }
    window.scrollTo(0, 0)

    if (mode !== 'field') return undefined

    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [mode, lenisRef])

  const setMode = (next) => {
    if (next === 'archive') {
      setSearchParams({ mode: 'archive' }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  return (
    <div className={`beyond-studio drawing-page drawing-page-modes is-${mode}`}>
      <header className="drawing-mode-chrome">
        <Link to="/beyond" className="drawing-mode-back" data-cursor-hover="true">
          ← Beyond
        </Link>

        {mode === 'archive' ? (
          <nav className="drawing-mode-tabs" aria-label="Drawing modes">
            <button
              type="button"
              className="drawing-mode-tab"
              data-cursor-hover="true"
              onClick={() => setMode('field')}
            >
              Field
            </button>
            <button
              type="button"
              className="drawing-mode-tab is-active"
              data-cursor-hover="true"
              aria-pressed="true"
            >
              Archive
            </button>
          </nav>
        ) : (
          <span className="drawing-mode-spacer" aria-hidden />
        )}

        <p className="drawing-mode-mark">Drawing</p>
      </header>

      {mode === 'field' ? (
        <div className="drawing-mode-pane drawing-mode-field is-active">
          <DrawingFieldExperience
            title={interest?.title ?? 'Drawing'}
            blurb={interest?.blurb}
            story={interest?.story}
            active
            onOpenArchive={() => setMode('archive')}
          />
        </div>
      ) : (
        <div className="drawing-mode-pane drawing-mode-archive is-active">
          <div className="drawing-mode-archive-inner drawing-mode-archive-inner-local">
            <button
              type="button"
              className="drawing-mode-return drawing-mode-return-coil"
              data-cursor-hover="true"
              onClick={() => setMode('field')}
            >
              ← Back to twin vortex
            </button>
            <DrawingGallerySection />
          </div>
        </div>
      )}
    </div>
  )
}

export default DrawingPage
