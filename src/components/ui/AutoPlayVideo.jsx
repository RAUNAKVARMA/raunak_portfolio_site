import { useEffect, useRef } from 'react'

/**
 * Muted inline video that autoplays on mobile Safari/Chrome.
 * Attributes alone are unreliable; play() is retried on mount and visibility.
 */
function AutoPlayVideo({
  src,
  poster,
  className = '',
  'aria-label': ariaLabel,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const tryPlay = () => {
      const playPromise = video.play()
      if (playPromise?.catch) {
        playPromise.catch(() => {
          /* Autoplay can still be blocked; retry on next interaction/visibility. */
        })
      }
    }

    tryPlay()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay()
      },
      { threshold: 0.2 },
    )
    observer.observe(video)

    document.addEventListener('visibilitychange', onVisibility)
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
    }
  }, [src])

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
