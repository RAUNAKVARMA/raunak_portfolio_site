import { ScrollTrigger } from '../../lib/gsap.client'

let queued = false

/** Refresh ScrollTrigger after About layout is stable (double rAF). */
export function refreshAboutScroll() {
  if (typeof window === 'undefined' || queued) return
  queued = true
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      queued = false
    })
  })
}

export function refreshAboutScrollNow() {
  if (typeof window === 'undefined') return
  ScrollTrigger.refresh()
}
