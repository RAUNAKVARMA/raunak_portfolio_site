/** Fixed nav height — keep all About scroll pins aligned to this. */
export const ABOUT_NAV = 72

export const ABOUT_PIN_START = `top top+=${ABOUT_NAV}`

/** Scroll scrub range for flow sections (viewport-relative). */
export const aboutScrubRange = (start = 'top 78%', end = 'bottom 22%') => ({
  start,
  end,
})

export const aboutPinEnd = (pct) => `+=${pct}%`
