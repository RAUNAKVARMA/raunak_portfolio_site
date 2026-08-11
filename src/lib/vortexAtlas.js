import * as THREE from 'three'
import { drawingArtworks } from '../data/drawings'

/** Full-bleed panels — same strip Twin Vortex + immersive /beyond/art share. */
const PANELS = drawingArtworks.map((piece) => ({
  src: piece.src,
  eyebrow: 'Beyond Work — Drawing',
  title: piece.title,
}))

/** First paint: few pages, smaller canvas. Full set upgrades in background. */
const BOOTSTRAP_COUNT = 3
const PAGE_W_BOOT = 1024
const PAGE_W_FULL = 1280
const MAX_PAGE_H_BOOT = 1600
const MAX_PAGE_H_FULL = 2400
const MIN_PAGE_H = 720

const listeners = new Set()

function loadImage(url, { priority = 'auto' } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    if ('fetchPriority' in img) img.fetchPriority = priority
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(() => resolve(img)).catch(() => resolve(img))
      } else {
        resolve(img)
      }
    }
    img.onerror = reject
    img.src = url
  })
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawCaption(ctx, y, h, width, eyebrow, title) {
  const pillW = Math.min(width * 0.62, 520)
  const pillH = Math.max(40, Math.round(width * 0.045))
  const px = (width - pillW) / 2
  const py = y + h - Math.round(h * 0.09)

  ctx.save()
  ctx.fillStyle = 'rgba(8, 10, 8, 0.55)'
  roundRect(ctx, px, py, pillW, pillH, pillH / 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  roundRect(ctx, px, py, pillW, pillH, pillH / 2)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  const fontPx = Math.max(11, Math.round(width * 0.012))
  ctx.font = `500 ${fontPx}px ui-monospace, Menlo, monospace`
  ctx.fillText(`${eyebrow.toUpperCase()} — ${title.toUpperCase()}`, width / 2, py + pillH / 2)
  ctx.restore()
}

function pageHeightFor(img, pageW, maxH) {
  const raw = Math.round(pageW * (img.height / Math.max(img.width, 1)))
  return Math.min(maxH, Math.max(MIN_PAGE_H, raw))
}

function drawExact(ctx, img, x, y, boxW, boxH) {
  ctx.save()
  ctx.filter = 'brightness(1.14) contrast(1.05) saturate(1.06)'
  ctx.drawImage(img, x, y, boxW, boxH)
  ctx.filter = 'none'
  ctx.restore()
}

function atlasFromPanels(panels, { pageW, maxPageH }) {
  const width = pageW
  const heights = panels.map((p) => pageHeightFor(p.img, width, maxPageH))
  const totalH = heights.reduce((a, b) => a + b, 0)
  const aspects = heights.map((h) => width / h)

  // Cap GL texture height (many mobiles max at 4096 / 8192)
  const maxTex = typeof window !== 'undefined'
    ? Math.min(8192, (window.__MAX_TEX_SIZE__ || 8192))
    : 8192
  let scale = 1
  if (totalH > maxTex) scale = maxTex / totalH

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(totalH * scale))
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })
  if (!ctx) throw new Error('No 2d')

  if (scale !== 1) ctx.setTransform(scale, 0, 0, scale, 0, 0)

  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, width, totalH)

  const cumulEnds = []
  let y = 0
  panels.forEach((panel, i) => {
    const h = heights[i]
    drawExact(ctx, panel.img, 0, y, width, h)
    drawCaption(ctx, y, h, width, panel.eyebrow, panel.title)
    y += h
    cumulEnds.push(y / totalH)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  // Skip mipmaps on tall strips — faster upload on mobile GPUs
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true

  const data = new Float32Array(panels.length * 4)
  cumulEnds.forEach((v, i) => {
    data[i * 4] = v
    data[i * 4 + 1] = v
    data[i * 4 + 2] = v
    data[i * 4 + 3] = 1
  })
  const cumulTex = new THREE.DataTexture(data, panels.length, 1, THREE.RGBAFormat, THREE.FloatType)
  cumulTex.magFilter = THREE.NearestFilter
  cumulTex.minFilter = THREE.NearestFilter
  cumulTex.wrapS = THREE.ClampToEdgeWrapping
  cumulTex.wrapT = THREE.ClampToEdgeWrapping
  cumulTex.needsUpdate = true

  return {
    texture,
    cumulTex,
    pageCount: panels.length,
    aspects,
    pageAspect: aspects[0] ?? 1,
    version: 0,
  }
}

async function loadPanels(slice, { priority = 'auto' } = {}) {
  const loaded = await Promise.all(
    slice.map(async (p, i) => {
      try {
        return {
          ...p,
          img: await loadImage(p.src, { priority: i === 0 ? 'high' : priority }),
        }
      } catch {
        return null
      }
    }),
  )
  return loaded.filter(Boolean)
}

let atlasPromise = null
let cachedAtlas = null
let fullUpgradeStarted = false

function publishAtlas(atlas, { disposePrev = true } = {}) {
  const prev = cachedAtlas
  cachedAtlas = atlas
  if (disposePrev && prev && prev !== atlas) {
    // Defer dispose so GPU still presents current frame
    requestAnimationFrame(() => {
      try {
        prev.texture?.dispose?.()
        prev.cumulTex?.dispose?.()
      } catch {
        /* */
      }
    })
  }
  listeners.forEach((cb) => {
    try {
      cb(atlas)
    } catch {
      /* */
    }
  })
  return atlas
}

async function buildBootstrap() {
  const panels = await loadPanels(PANELS.slice(0, BOOTSTRAP_COUNT), { priority: 'high' })
  if (!panels.length) throw new Error('No panels')
  const atlas = atlasFromPanels(panels, {
    pageW: PAGE_W_BOOT,
    maxPageH: MAX_PAGE_H_BOOT,
  })
  atlas.version = 1
  atlas.partial = true
  return publishAtlas(atlas, { disposePrev: false })
}

async function buildFullUpgrade() {
  if (fullUpgradeStarted) return cachedAtlas
  fullUpgradeStarted = true

  // Yield so first frame paints before we decode the rest
  await new Promise((r) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => r(), { timeout: 400 })
    } else {
      setTimeout(r, 80)
    }
  })

  const panels = await loadPanels(PANELS, { priority: 'low' })
  if (!panels.length) return cachedAtlas

  const atlas = atlasFromPanels(panels, {
    pageW: PAGE_W_FULL,
    maxPageH: MAX_PAGE_H_FULL,
  })
  atlas.version = 2
  atlas.partial = false
  return publishAtlas(atlas)
}

/**
 * Kick off strip build ASAP (call on Drawing page mount / hover).
 * Returns as soon as the bootstrap atlas is ready (~first 2s goal).
 * Full set upgrades silently in the background.
 */
export function prefetchVortexAtlas(maxAniso = 8) {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (cachedAtlas && !cachedAtlas.partial) {
    if (cachedAtlas.texture && maxAniso > (cachedAtlas.texture.anisotropy || 0)) {
      cachedAtlas.texture.anisotropy = maxAniso
      cachedAtlas.texture.needsUpdate = true
    }
    return Promise.resolve(cachedAtlas)
  }
  if (!atlasPromise) {
    // Warm first images immediately (browser can start HTTP before canvas work)
    PANELS.slice(0, BOOTSTRAP_COUNT).forEach((p, i) => {
      const img = new Image()
      img.decoding = 'async'
      if ('fetchPriority' in img) img.fetchPriority = i === 0 ? 'high' : 'auto'
      img.src = p.src
    })

    atlasPromise = buildBootstrap()
      .then((atlas) => {
        if (atlas?.texture) {
          atlas.texture.anisotropy = Math.min(maxAniso, 8)
          atlas.texture.needsUpdate = true
        }
        // Fire-and-forget full upgrade
        buildFullUpgrade().catch(() => {
          fullUpgradeStarted = false
        })
        return atlas
      })
      .catch((err) => {
        atlasPromise = null
        throw err
      })
  }
  return atlasPromise
}

export function getVortexAtlas(maxAniso = 8) {
  return prefetchVortexAtlas(maxAniso).then((atlas) => {
    if (atlas?.texture && maxAniso > (atlas.texture.anisotropy || 0)) {
      atlas.texture.anisotropy = maxAniso
      atlas.texture.needsUpdate = true
    }
    return atlas
  })
}

/** Live updates when bootstrap → full atlas swaps. */
export function subscribeVortexAtlas(callback) {
  if (typeof callback !== 'function') return () => {}
  listeners.add(callback)
  if (cachedAtlas) {
    try {
      callback(cachedAtlas)
    } catch {
      /* */
    }
  }
  return () => listeners.delete(callback)
}

export function applyVortexAtlas(material, atlas) {
  if (!material?.uniforms || !atlas) return
  material.uniforms.uTexture.value = atlas.texture
  material.uniforms.uCumulTex.value = atlas.cumulTex
  material.uniforms.uPageCount.value = atlas.pageCount
  if (material.uniforms.uPageAspect) {
    material.uniforms.uPageAspect.value = atlas.pageAspect ?? 1
  }
}
