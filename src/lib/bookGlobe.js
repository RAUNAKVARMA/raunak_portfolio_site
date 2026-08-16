import * as THREE from 'three'

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/**
 * Tall poster-style cover (matches the reference carousel aspect + border).
 * ~1:2.6 portrait with a crisp white edge.
 */
export function createBookCoverTexture(book) {
  const w = 540
  const h = 1400
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const { r, g, b } = hexToRgb(book.accent || '#ffffff')

  // White border like the reference cards
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  const inset = 10
  ctx.fillStyle = '#050505'
  ctx.fillRect(inset, inset, w - inset * 2, h - inset * 2)

  const wash = ctx.createLinearGradient(0, 0, w, h)
  wash.addColorStop(0, `rgba(${r},${g},${b},0.92)`)
  wash.addColorStop(0.4, `rgba(${Math.max(0, r - 30)},${Math.max(0, g - 40)},${Math.max(0, b - 20)},0.55)`)
  wash.addColorStop(1, '#050505')
  ctx.fillStyle = wash
  ctx.fillRect(inset, inset, w - inset * 2, h - inset * 2)

  // Gloss streak
  const gloss = ctx.createLinearGradient(0, 0, w * 0.6, h)
  gloss.addColorStop(0, 'rgba(255,255,255,0.22)')
  gloss.addColorStop(0.35, 'rgba(255,255,255,0.04)')
  gloss.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gloss
  ctx.fillRect(inset, inset, w - inset * 2, h - inset * 2)

  // Noise
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  for (let i = 0; i < 500; i += 1) {
    ctx.fillRect((i * 97) % w, (i * 53) % h, 1 + (i % 3), 1 + (i % 2))
  }

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '600 28px "JetBrains Mono", ui-monospace, monospace'
  ctx.fillText(String(book.tag || 'BOOK').toUpperCase(), 48, 90)

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 72px "Syne", "Fragment Mono", sans-serif'
  const titleLines = wrapLines(ctx, book.title, w - 100).slice(0, 5)
  let ty = 200
  for (const line of titleLines) {
    ctx.fillText(line, 48, ty)
    ty += 82
  }

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '500 30px "Cormorant Garamond", Georgia, serif'
  const byLines = wrapLines(ctx, book.by, w - 100).slice(0, 3)
  let byY = h - 100
  for (let i = byLines.length - 1; i >= 0; i -= 1) {
    ctx.fillText(byLines[i], 48, byY)
    byY -= 36
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}
