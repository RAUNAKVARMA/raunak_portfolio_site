let started = false

/** Warm About route before navigation. */
export function prefetchAboutRoute() {
  if (started || typeof window === 'undefined') return
  started = true
  void import('../../pages/AboutPage')
  void import('./AboutNetworkCanvas')
}
