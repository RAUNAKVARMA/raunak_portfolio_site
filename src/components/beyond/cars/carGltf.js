import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

/**
 * Local Draco decoders (copied from three/examples/jsm/libs/draco/gltf).
 * Avoids blank garage when gstatic is blocked / slow.
 */
export const DRACO_DECODER_PATH = '/draco/gltf/'

let configured = false
let dracoPrefetched = false
let bootStarted = false
const warmPromises = new Map()
const readyUrls = new Set()

THREE.Cache.enabled = true

/** Clear any poisoned manual GLB cache entries from earlier builds. */
export function clearGarageGltfCache(urls = []) {
  urls.filter(Boolean).forEach((url) => {
    try {
      THREE.Cache.remove(url)
      THREE.Cache.remove(new URL(url, window.location.href).href)
    } catch {
      /* */
    }
    try {
      useGLTF.clear(url)
    } catch {
      /* */
    }
    readyUrls.delete(url)
    warmPromises.delete(url)
  })
}

export function ensureDracoDecoder() {
  if (configured) return
  useGLTF.setDecoderPath(DRACO_DECODER_PATH)
  configured = true
}

function injectHeadLink({ rel, href, as, crossOrigin, datasetKey, fetchPriority }) {
  if (typeof document === 'undefined' || !href) return
  const key = datasetKey || href
  if (document.querySelector(`link[data-garage-asset="${key}"]`)) return
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  if (as) link.as = as
  if (crossOrigin) link.crossOrigin = crossOrigin
  if (fetchPriority) link.fetchPriority = fetchPriority
  link.dataset.garageAsset = key
  document.head.appendChild(link)
}

/** Prefetch / preload Draco WASM so the first GLB decode isn't stalled on gstatic. */
export function prefetchDracoDecoder() {
  if (dracoPrefetched || typeof document === 'undefined') return
  dracoPrefetched = true
  ensureDracoDecoder()
  ;['draco_wasm_wrapper.js', 'draco_decoder.wasm', 'draco_decoder.js'].forEach((file, i) => {
    const href = `${DRACO_DECODER_PATH}${file}`
    injectHeadLink({
      rel: i === 1 ? 'preload' : 'prefetch',
      href,
      as: file.endsWith('.wasm') ? 'fetch' : 'script',
      crossOrigin: 'anonymous',
      datasetKey: `draco-${file}`,
      fetchPriority: i === 1 ? 'high' : undefined,
    })
  })
}

/** Browser-priority hints for the first garage GLBs (starts before JS decode). */
export function preloadGarageGlbHints(urls = []) {
  urls.filter(Boolean).slice(0, 3).forEach((url, i) => {
    injectHeadLink({
      rel: 'preload',
      href: url,
      as: 'fetch',
      crossOrigin: 'anonymous',
      datasetKey: `glb-${url}`,
      fetchPriority: i === 0 ? 'high' : 'low',
    })
  })
}

/** Preload a car GLB with Draco support (fire-and-forget). */
export function preloadCar(url) {
  if (!url) return
  ensureDracoDecoder()
  try {
    useGLTF.preload(url, true)
  } catch {
    try {
      useGLTF.preload(url)
    } catch {
      /* */
    }
  }
}

/**
 * Warm HTTP + kick drei preload. Do NOT stuff ArrayBuffers into THREE.Cache —
 * that breaks Draco/useGLTF and left the garage blank.
 */
export function warmCar(url, onProgress) {
  if (!url) return Promise.resolve()
  if (readyUrls.has(url)) {
    onProgress?.(1)
    return Promise.resolve()
  }
  if (warmPromises.has(url)) {
    const pending = warmPromises.get(url)
    if (onProgress) {
      onProgress(0.45)
      pending.then(() => onProgress(1))
    }
    return pending
  }

  const task = (async () => {
    ensureDracoDecoder()
    prefetchDracoDecoder()
    onProgress?.(0.2)
    preloadCar(url)

    // Warm browser HTTP cache for progress UI (discard bytes — don't poison THREE.Cache).
    try {
      const res = await fetch(url, { credentials: 'same-origin' })
      if (res.ok) {
        const total = Number(res.headers.get('content-length')) || 0
        if (res.body && typeof res.body.getReader === 'function') {
          const reader = res.body.getReader()
          let loaded = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            loaded += value.byteLength
            if (total > 0) onProgress?.(Math.min(0.88, (loaded / total) * 0.88))
            else onProgress?.(Math.min(0.82, 0.15 + loaded / (4 * 1024 * 1024) * 0.7))
          }
        } else {
          await res.arrayBuffer()
          onProgress?.(0.88)
        }
      }
    } catch {
      /* preload still runs */
    }

    onProgress?.(0.92)
    preloadCar(url)
    await new Promise((r) => requestAnimationFrame(() => r()))
    readyUrls.add(url)
    onProgress?.(1)
  })().finally(() => {
    warmPromises.delete(url)
  })

  warmPromises.set(url, task)
  return task
}

export function isCarWarmed(url) {
  return Boolean(url && readyUrls.has(url))
}

/** Warm many GLBs with limited concurrency so scroll swaps feel instant. */
export async function warmCars(urls, { concurrency = 4 } = {}) {
  const list = (urls || []).filter(Boolean)
  if (!list.length) return
  let i = 0
  const workers = Array.from({ length: Math.min(concurrency, list.length) }, async () => {
    while (i < list.length) {
      const url = list[i]
      i += 1
      await warmCar(url)
    }
  })
  await Promise.all(workers)
}

/**
 * Site-boot warmup: hints + Draco + all garage GLBs.
 * Safe to call from anywhere; deduped.
 */
export function bootGarageAssets(urls, { concurrency = 5 } = {}) {
  if (!urls?.length) return Promise.resolve()
  prefetchDracoDecoder()
  preloadGarageGlbHints(urls)
  if (bootStarted) {
    return warmCars(urls, { concurrency })
  }
  bootStarted = true
  // First car immediately; rest right after so the garage is ready in under a second on repeat visits.
  warmCar(urls[0])
  return warmCars(urls.slice(1), { concurrency })
}
