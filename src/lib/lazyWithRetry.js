import { lazy } from 'react'

async function importWithRetry(factory, retriesLeft = 3) {
  try {
    return await factory()
  } catch (error) {
    if (retriesLeft <= 0) throw error
    await new Promise((resolve) => setTimeout(resolve, 600))
    return importWithRetry(factory, retriesLeft - 1)
  }
}

/** Lazy route loader with automatic retry — avoids stale-chunk "Something didn't load" screens. */
export function lazyWithRetry(factory) {
  return lazy(() => importWithRetry(factory))
}
