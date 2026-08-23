import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import MatrixRainCanvas from './MatrixRainCanvas'
import MusicVideoStage from './MusicVideoStage'
import MusicClipCards from './MusicClipCards'

function MusicExperience() {
  useDocumentTitle('Music')
  const { isTouchLike, prefersReducedMotion } = useReducedMotionProfile()
  const lenisRef = useLenis()
  const touchLite = Boolean(isTouchLike)

  useEffect(() => {
    document.documentElement.classList.add('music-immersive')
    document.body.classList.add('music-immersive')
    if (touchLite) {
      document.documentElement.classList.add('music-touch')
      document.body.classList.add('music-touch')
    }
    return () => {
      document.documentElement.classList.remove('music-immersive', 'music-touch')
      document.body.classList.remove('music-immersive', 'music-touch')
    }
  }, [touchLite])

  /* Shorter Lenis inertia on phones so scroll past the cube stays snappy */
  useEffect(() => {
    if (!touchLite || prefersReducedMotion) return undefined
    const lenis = lenisRef?.current
    if (!lenis?.options) return undefined

    const prevDuration = lenis.options.duration
    const prevTouch = lenis.options.touchMultiplier
    lenis.options.duration = 0.8
    lenis.options.touchMultiplier = 1.15

    return () => {
      lenis.options.duration = prevDuration
      lenis.options.touchMultiplier = prevTouch
    }
  }, [lenisRef, touchLite, prefersReducedMotion])

  return (
    <div className={`music-room${touchLite ? ' is-touch' : ''}`}>
      <div className="music-room__fx" aria-hidden>
        <MatrixRainCanvas />
        <div className="music-scrim" />
      </div>

      <Link to="/beyond" className="music-back" data-cursor-hover="true">
        <RiArrowLeftLine aria-hidden />
        <span>Beyond</span>
      </Link>

      <p className="music-kicker">Beyond — Music</p>

      <MusicVideoStage />
      <MusicClipCards />
    </div>
  )
}

export default MusicExperience
