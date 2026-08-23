import { ScrollTrigger } from '../../lib/gsap.client'

let timer = 0
let raf = 0

/** Coalesce layout-triggered ScrollTrigger refreshes to avoid scroll jank. */
export function scheduleScrollRefresh(immediate = false) {
  if (typeof window === 'undefined') return

  if (immediate) {
    window.clearTimeout(timer)
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    timer = 0
    ScrollTrigger.refresh()
    return
  }

  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    timer = 0
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      ScrollTrigger.refresh()
    })
  }, 80)
}
