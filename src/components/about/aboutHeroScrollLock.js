import { scheduleScrollRefresh } from './scheduleScrollRefresh'

/** Release any About-hero scroll lock so navigation and scrolling work again. */export function releaseAboutScrollLock(lenisRef) {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.documentElement.classList.remove('lenis-stopped')

  const lenis = lenisRef?.current
  if (lenis) {
    lenis.start()
  }

  scheduleScrollRefresh(true)
}

export function withTimeout(promise, ms) {
  return Promise.race([
    promise ?? Promise.resolve(),
    new Promise((resolve) => {
      window.setTimeout(resolve, ms)
    }),
  ])
}
