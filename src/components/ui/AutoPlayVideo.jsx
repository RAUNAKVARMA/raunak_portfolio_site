import { useEffect, useRef } from 'react'

/**
 * Muted inline video that autoplays reliably (Safari/Chrome/mobile).
 * Pauses when off-screen to keep the page smooth.
 */
function AutoPlayVideo({
  src,
  poster,
  className = '',
  'aria-label': ariaLabel,
  pauseWhenHidden = true,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('x5-playsinline', '')

    let cancelled = false

    const tryPlay = () => {
      if (cancelled || !video) return
      video.muted = true
      const playPromise = video.play()
      if (playPromise?.catch) {
        playPromise.catch(() => {
          /* Autoplay can still be blocked; retried on visibility/interaction. */
        })
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay()
      else if (pauseWhenHidden) video.pause()
    }

    const onPointer = () => tryPlay()

    const onPause = () => {
      // Keep cinematic bg videos playing even if something else pauses them
      if (!pauseWhenHidden && !cancelled) tryPlay()
    }

    tryPlay()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay()
        else if (pauseWhenHidden) video.pause()
      },
      { threshold: 0.05, rootMargin: '10% 0px' },
    )
    observer.observe(video)

    document.addEventListener('visibilitychange', onVisibility)
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('loadedmetadata', tryPlay)
    video.addEventListener('pause', onPause)
    window.addEventListener('pointerdown', onPointer, { once: true, passive: true })
    window.addEventListener('touchstart', onPointer, { once: true, passive: true })

    return () => {
      cancelled = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('loadedmetadata', tryPlay)
      video.removeEventListener('pause', onPause)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('touchstart', onPointer)
      video.pause()
    }
  }, [src, pauseWhenHidden])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      aria-label={ariaLabel}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
    />
  )
}

export default AutoPlayVideo
