import { setScrolling } from './aboutWebStore'

let stopTimer = 0

/** Debounced scroll-quality flag for canvas tier selection. */
export function markAboutScrolling() {
  setScrolling(true)
  window.clearTimeout(stopTimer)
  stopTimer = window.setTimeout(() => {
    setScrolling(false)
  }, 140)
}

export function wireAboutScrollQuality(lenisRef) {
  if (typeof window === 'undefined') return () => {}

  const onScroll = () => markAboutScrolling()
  let usingLenis = false

  const attachLenis = () => {
    const lenis = lenisRef?.current
    if (!lenis) return false
    lenis.on('scroll', onScroll)
    usingLenis = true
    return true
  }

  if (!attachLenis()) {
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  return () => {
    window.clearTimeout(stopTimer)
    setScrolling(false)
    if (usingLenis) {
      lenisRef?.current?.off('scroll', onScroll)
    } else {
      window.removeEventListener('scroll', onScroll)
    }
  }
}
