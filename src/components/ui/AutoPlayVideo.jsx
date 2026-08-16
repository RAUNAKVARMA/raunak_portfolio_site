import { useEffect, useRef } from 'react'

/**
 * Muted inline video that autoplays reliably on iOS Safari + Android Chrome.
 * Kept muted + playsInline (required for mobile autoplay policies).
 * No controls — resumes itself if the OS or browser pauses it while visible.
 */
function AutoPlayVideo({
  src,
  poster,
  className = '',
  'aria-label': ariaLabel,
  /** When false, keep playing even off-screen (cinematic backgrounds). */
  pauseWhenHidden = true,
  loop = true,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.loop = loop
    video.controls = false
    video.disablePictureInPicture = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('x5-playsinline', '')
    video.setAttribute('x5-video-player-type', 'h5')
    video.setAttribute('x5-video-player-fullscreen', 'false')
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback')
    try {
      video.volume = 0
    } catch {
      /* */
    }

    let cancelled = false
    let visible = true

    const tryPlay = () => {
      if (cancelled || !video) return
      if (pauseWhenHidden && !visible) return
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
      if (playPromise?.catch) {
        playPromise.catch(() => {
          /* Autoplay can still be blocked until a user gesture; retried below. */
        })
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay()
      else if (pauseWhenHidden) video.pause()
    }

    const onPointer = () => tryPlay()

    const onPause = () => {
      // Never leave a bg video paused while it should be running
      if (cancelled) return
      if (pauseWhenHidden && !visible) return
      if (document.visibilityState === 'hidden' && pauseWhenHidden) return
      // iOS sometimes pauses mid-play — nudge it back on the next frame
      window.requestAnimationFrame(() => {
        if (!cancelled) tryPlay()
      })
    }

    const onEnded = () => {
      if (!loop || cancelled) return
      try {
        video.currentTime = 0
      } catch {
        /* */
      }
      tryPlay()
    }

    tryPlay()

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) tryPlay()
        else if (pauseWhenHidden) video.pause()
      },
      { threshold: 0.02, rootMargin: '20% 0px' },
    )
    observer.observe(video)

    document.addEventListener('visibilitychange', onVisibility)
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('loadedmetadata', tryPlay)
    video.addEventListener('playing', () => {
      video.muted = true
    })
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('touchstart', onPointer, { passive: true })
    window.addEventListener('pageshow', tryPlay)

    return () => {
      cancelled = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('loadedmetadata', tryPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('touchstart', onPointer)
      window.removeEventListener('pageshow', tryPlay)
      video.pause()
    }
  }, [src, pauseWhenHidden, loop])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      aria-label={ariaLabel}
      className={className}
      autoPlay
      muted
      loop={loop}
      playsInline
      preload="auto"
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
    />
  )
}

export default AutoPlayVideo
