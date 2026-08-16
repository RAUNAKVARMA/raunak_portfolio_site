import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'
import { useReducedMotion } from 'framer-motion'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import MatrixRainCanvas from './MatrixRainCanvas'
import MusicClipCards from './MusicClipCards'
import MusicVideoStage from './MusicVideoStage'

function MusicExperience() {
  useDocumentTitle('Music')
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis()

  useEffect(() => {
    document.documentElement.classList.add('music-immersive')
    document.body.classList.add('music-immersive')
    return () => {
      document.documentElement.classList.remove('music-immersive')
      document.body.classList.remove('music-immersive')
    }
  }, [])

  // Creamier Lenis through cube → cards so scrolling over WebGL stays smooth
  useEffect(() => {
    const lenis = lenisRef?.current
    if (!lenis?.options || reducedMotion) return undefined
    const prev = {
      duration: lenis.options.duration,
      wheelMultiplier: lenis.options.wheelMultiplier,
      touchMultiplier: lenis.options.touchMultiplier,
      syncTouchLerp: lenis.options.syncTouchLerp,
      lerp: lenis.options.lerp,
    }
    lenis.options.duration = 2.85
    lenis.options.lerp = 0.045
    lenis.options.wheelMultiplier = 0.72
    lenis.options.touchMultiplier = 1.05
    lenis.options.syncTouchLerp = 0.045
    return () => {
      lenis.options.duration = prev.duration
      lenis.options.wheelMultiplier = prev.wheelMultiplier
      lenis.options.touchMultiplier = prev.touchMultiplier
      lenis.options.syncTouchLerp = prev.syncTouchLerp
      lenis.options.lerp = prev.lerp
    }
  }, [lenisRef, reducedMotion])

  // Mobile: kick muted card videos on first tap so nothing waits for a play button
  useEffect(() => {
    const kickCardVideos = () => {
      document.querySelectorAll('.music-card__video').forEach((node) => {
        const video = /** @type {HTMLVideoElement} */ (node)
        video.muted = true
        video.defaultMuted = true
        video.playsInline = true
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.setAttribute('webkit-playsinline', '')
        try {
          video.volume = 0
        } catch {
          /* */
        }
        const playPromise = video.play()
        if (playPromise?.catch) playPromise.catch(() => {})
      })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') kickCardVideos()
    }

    kickCardVideos()
    window.addEventListener('pointerdown', kickCardVideos, { passive: true })
    window.addEventListener('touchstart', kickCardVideos, { passive: true })
    window.addEventListener('pageshow', kickCardVideos)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pointerdown', kickCardVideos)
      window.removeEventListener('touchstart', kickCardVideos)
      window.removeEventListener('pageshow', kickCardVideos)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="music-room">
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
