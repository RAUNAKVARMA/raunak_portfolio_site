import * as THREE from 'three'
import { drawingArtworks } from '../data/drawings'

/** Full-bleed panels — same strip Twin Vortex + immersive /beyond/art share. */
const PANELS = drawingArtworks.map((piece) => ({
  src: piece.src,
  eyebrow: 'Beyond Work — Drawing',
  title: piece.title,
}))

const PAGE_W = 1600
const MAX_PAGE_H = 4200
const MIN_PAGE_H = 900

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => resolve(img)
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
  const pillW = Math.min(width * 0.55, 560)
  const pillH = 52
  const px = (width - pillW) / 2
  const py = y + h - 100

  ctx.save()
  ctx.fillStyle = 'rgba(8, 10, 8, 0.55)'
  roundRect(ctx, px, py, pillW, pillH, 26)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  roundRect(ctx, px, py, pillW, pillH, 26)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = '500 13px ui-monospace, Menlo, monospace'
  ctx.fillText(`${eyebrow.toUpperCase()} — ${title.toUpperCase()}`, width / 2, py + pillH / 2)
  ctx.restore()
}

function pageHeightFor(img) {
  const raw = Math.round(PAGE_W * (img.height / Math.max(img.width, 1)))
  return Math.min(MAX_PAGE_H, Math.max(MIN_PAGE_H, raw))
}

function drawExact(ctx, img, x, y, boxW, boxH) {
  ctx.save()
  ctx.filter = 'brightness(1.14) contrast(1.05) saturate(1.06)'
  ctx.drawImage(img, x, y, boxW, boxH)
  ctx.filter = 'none'
  ctx.restore()
}

async function buildStripAtlas(maxAniso) {
  const loaded = await Promise.all(
    PANELS.map(async (p) => {
      try {
        return { ...p, img: await loadImage(p.src) }
      } catch {
        return null
      }
    }),
  )
  const panels = loaded.filter(Boolean)
  if (!panels.length) throw new Error('No panels')

  const width = PAGE_W
  const heights = panels.map((p) => pageHeightFor(p.img))
  const totalH = heights.reduce((a, b) => a + b, 0)
  const aspects = heights.map((h) => width / h)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = totalH
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('No 2d')

  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = maxAniso
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
  }
}

let atlasPromise = null
let cachedAtlas = null

/**
 * Kick off strip build ASAP (call on Drawing page mount).
 * Shared by Twin Vortex preview + immersive /beyond/art.
 */
export function prefetchVortexAtlas(maxAniso = 8) {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (cachedAtlas) return Promise.resolve(cachedAtlas)
  if (!atlasPromise) {
    // Warm image decode in parallel with canvas work
    drawingArtworks.forEach((piece) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = piece.src
    })
    atlasPromise = buildStripAtlas(maxAniso)
      .then((atlas) => {
        cachedAtlas = atlas
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

export function applyVortexAtlas(material, atlas) {
  if (!material?.uniforms || !atlas) return
  material.uniforms.uTexture.value = atlas.texture
  material.uniforms.uCumulTex.value = atlas.cumulTex
  material.uniforms.uPageCount.value = atlas.pageCount
  if (material.uniforms.uPageAspect) {
    material.uniforms.uPageAspect.value = atlas.pageAspect ?? 1
  }
}
