/** Procedural silk texture — cinema-grade strands, fibrils, glints, grain. */

import { aboutWebStore, isStoryDropping } from './aboutWebStore'

const SAGE = { r: 184, g: 196, b: 168 }
const SILK = { r: 236, g: 246, b: 228 }
const WARM = { r: 252, g: 254, b: 248 }
const DEEP = { r: 120, g: 132, b: 108 }

export function hash1(n) {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function hash2(x, y) {
  return hash1(x * 12.9898 + y * 78.233)
}

export function strandSeed(ax, ay, bx, by, kind = '') {
  let s = kind.length * 17
  s += ax * 0.013 + ay * 0.029 + bx * 0.019 + by * 0.023
  return Math.floor(Math.abs(s * 1000)) % 100000
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

export function catenaryPoint(ax, ay, bx, by, t, sag = 0.1) {
  const mx = lerp(ax, bx, t)
  const my = lerp(ay, by, t)
  const droop = Math.sin(Math.PI * t) * Math.hypot(bx - ax, by - ay) * sag
  return { x: mx, y: my + droop, t }
}

function wobbleOffset(ax, ay, bx, by, t, seed, amp = 1) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const n1 = (hash1(seed + t * 19.3) - 0.5) * 2
  const n2 = Math.sin(t * Math.PI * 7 + seed * 0.17) * 0.32
  const n3 = (hash1(seed * 2.1 + t * 41) - 0.5) * 0.55
  const m = (n1 * 0.5 + n2 + n3) * amp
  return { x: nx * m, y: ny * m }
}

export function sampleStrand(ax, ay, bx, by, sag, seed, steps = 22) {
  const pts = []
  const amp = Math.min(3.2, 0.4 + Math.hypot(bx - ax, by - ay) * 0.0014)
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const p = catenaryPoint(ax, ay, bx, by, t, sag)
    const w = wobbleOffset(ax, ay, bx, by, t, seed, amp)
    pts.push({ x: p.x + w.x, y: p.y + w.y, t })
  }
  return pts
}

function sampleLinear(ax, ay, bx, by, seed, steps = 14) {
  const pts = []
  const amp = 0.5
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const w = wobbleOffset(ax, ay, bx, by, t, seed, amp)
    pts.push({ x: lerp(ax, bx, t) + w.x, y: lerp(ay, by, t) + w.y, t })
  }
  return pts
}

function drawStrandBloom(ctx, pts, alpha, width) {
  if (pts.length < 2) return
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.strokeStyle = `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.14})`
  ctx.lineWidth = width * 5.2
  ctx.stroke()
  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.07})`
  ctx.lineWidth = width * 3.1
  ctx.stroke()
  ctx.restore()
}

function drawCoreFilament(ctx, pts, alpha, width, time, seed) {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let i = 0; i < pts.length - 1; i += 2) {
    const p0 = pts[i]
    const p1 = pts[Math.min(i + 1, pts.length - 1)]
    const flicker = 0.78 + Math.sin(time * 2.1 + seed * 0.015 + p0.t * 11) * 0.22
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.strokeStyle = `rgba(255,255,255,${alpha * flicker * 0.78})`
    ctx.lineWidth = Math.max(0.22, width * 0.18)
    ctx.stroke()
  }
  ctx.restore()
}

function strokeSegmentGradient(ctx, p0, p1, width, alpha, time, seed) {
  const gr = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y)
  const flicker = 0.88 + Math.sin(time * 1.6 + seed * 0.02 + p0.t * 8) * 0.12
  gr.addColorStop(0, `rgba(${DEEP.r},${DEEP.g},${DEEP.b},${alpha * 0.15 * flicker})`)
  gr.addColorStop(0.35, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.35 * flicker})`)
  gr.addColorStop(0.65, `rgba(${SILK.r},${SILK.g},${SILK.b},${alpha * 0.88 * flicker})`)
  gr.addColorStop(1, `rgba(255,255,255,${alpha * 0.55 * flicker})`)
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.strokeStyle = gr
  ctx.lineWidth = width
  ctx.stroke()
}

function drawFibrils(ctx, pts, seed, alpha, baseWidth, time) {
  const dx = pts[pts.length - 1].x - pts[0].x
  const dy = pts[pts.length - 1].y - pts[0].y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len

  ;[-1, 0, 1].forEach((side) => {
    if (side === 0) return
    const spread = baseWidth * (0.5 + Math.abs(side) * 0.12)
    for (let i = 1; i < pts.length - 1; i += 1) {
      if (hash1(seed + i * 3.7 + side) < 0.32) continue
      const p = pts[i]
      const flicker = 0.4 + hash1(seed + i + side * 11) * 0.5
      const lenF = 1.5 + hash1(seed + i * 2) * 5.5
      const wave = Math.sin(time * 1.2 + i * 0.4 + seed) * 0.4
      ctx.beginPath()
      ctx.moveTo(p.x + nx * spread * side, p.y + ny * spread * side)
      ctx.lineTo(
        p.x + nx * (spread + lenF + wave) * side,
        p.y + ny * (spread + lenF + wave) * side,
      )
      ctx.strokeStyle = `rgba(255,255,255,${alpha * flicker * 0.28})`
      ctx.lineWidth = 0.18 + hash1(seed + i) * 0.22
      ctx.stroke()
    }
  })
}

function drawGlint(ctx, pts, seed, alpha, time, offset = 0) {
  const idx = Math.floor(hash1(seed * 5.3 + offset) * (pts.length - 2)) + 1
  const p = pts[Math.min(idx, pts.length - 1)]
  const flicker = 0.6 + Math.sin(time * 2.8 + seed * 0.01 + offset) * 0.4
  const r = 1.4 + hash1(seed + 8 + offset) * 2.2
  const gr = ctx.createRadialGradient(p.x - r * 0.2, p.y - r * 0.25, 0, p.x, p.y, r * 2.5)
  gr.addColorStop(0, `rgba(255,255,255,${alpha * flicker})`)
  gr.addColorStop(0.25, `rgba(${WARM.r},${WARM.g},${WARM.b},${alpha * flicker * 0.45})`)
  gr.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gr
  ctx.beginPath()
  ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2)
  ctx.fill()
}

/** Cinema-grade textured silk strand. */
export function drawTexturedStrand(ctx, ax, ay, bx, by, alpha, width, sag, seed, time, tier = 'rich') {
  const scroll = tier === 'scroll'
  const ultra = tier === 'ultra'
  const rich = tier === 'rich' || ultra
  const steps = scroll ? 14 : ultra ? 32 : rich ? 22 : 16
  const pts = sag > 0.005 ? sampleStrand(ax, ay, bx, by, sag, seed, steps) : sampleLinear(ax, ay, bx, by, seed, steps)

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (ultra && !scroll) drawStrandBloom(ctx, pts, alpha, width)
  else if (scroll && rich) drawStrandBloom(ctx, pts, alpha * 0.45, width)

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const seg = hash1(seed + i * 1.9)
    const segA = alpha * (0.72 + seg * 0.28)
    const segW = width * (0.85 + hash1(seed + i * 2.7) * 0.35)
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.strokeStyle = `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${segA * (scroll ? 0.26 : 0.32)})`
    ctx.lineWidth = segW * (scroll ? 2.4 : ultra ? 3.4 : 2.8)
    ctx.stroke()
  }

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const mid = (p0.t + p1.t) * 0.5
    const taper = 0.72 + Math.sin(mid * Math.PI) * 0.28
    const seg = hash1(seed + i * 3.1)
    if (seg < (scroll ? 0.02 : 0.06)) continue
    const segA = alpha * taper * (0.78 + seg * 0.22)
    const segW = width * taper * (0.9 + hash1(seed + i) * 0.18)
    if (ultra && !scroll) {
      strokeSegmentGradient(ctx, p0, p1, segW * 0.95, segA, time, seed + i)
    } else {
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.strokeStyle = `rgba(${SILK.r},${SILK.g},${SILK.b},${segA * 0.88})`
      ctx.lineWidth = segW * 0.95
      ctx.stroke()
    }
  }

  if (!scroll) {
    for (let i = 0; i < pts.length - 1; i += ultra ? 1 : 2) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      const segA = alpha * (0.45 + hash1(seed + i * 4.2) * 0.4)
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.strokeStyle = `rgba(255,255,255,${segA * 0.68})`
      ctx.lineWidth = Math.max(0.28, width * (ultra ? 0.26 : 0.21))
      ctx.stroke()
    }
  }

  if (rich && !scroll) {
    drawFibrils(ctx, pts, seed, alpha, width, time)
    drawCoreFilament(ctx, pts, alpha, width, time, seed)
    drawGlint(ctx, pts, seed, alpha, time, 0)
    if (ultra && hash1(seed * 1.7) > 0.15) drawGlint(ctx, pts, seed, alpha * 0.75, time, 3.7)
    if (ultra && hash1(seed * 2.3) > 0.55) drawGlint(ctx, pts, seed, alpha * 0.55, time, 7.1)
  }

  ctx.restore()
  return pts
}

export function drawTexturedBundle(ctx, ax, ay, bx, by, alpha, width, sag, seed, time, count = 4) {
  if (aboutWebStore.scrolling && !isStoryDropping()) {
    drawTexturedStrand(ctx, ax, ay, bx, by, alpha, width, sag, seed, time, 'rich')
    return
  }
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  for (let i = 0; i < count; i += 1) {
    const off = (i - (count - 1) / 2) * 2.8
    const fade = 0.78 + hash1(seed + i) * 0.22
    const twist = Math.sin(time * 0.9 + i * 1.4 + seed * 0.01) * 1.2
    drawTexturedStrand(
      ctx,
      ax + nx * (off + twist * 0.15),
      ay + ny * (off + twist * 0.15),
      bx + nx * (off * 0.22 + twist * 0.08),
      by + ny * (off * 0.22 + twist * 0.08),
      alpha * fade,
      width * (0.88 + i * 0.02),
      sag + hash1(seed + i) * 0.014,
      seed + i * 997,
      time,
      'ultra',
    )
  }
}

export function drawTexturedDew(ctx, x, y, alpha, time, i) {
  const pulse = 0.72 + Math.sin(time * 1.85 + i * 0.62) * 0.28
  const r = (2 + hash1(i * 13.7) * 1.4) * pulse

  ctx.save()

  const caustic = ctx.createRadialGradient(x - r * 0.5, y - r * 0.2, 0, x, y, r * 3.2)
  caustic.addColorStop(0, `rgba(255,255,255,${alpha * 0.08 * pulse})`)
  caustic.addColorStop(0.4, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.04 * pulse})`)
  caustic.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = caustic
  ctx.beginPath()
  ctx.arc(x, y, r * 3.2, 0, Math.PI * 2)
  ctx.fill()

  const shadow = ctx.createRadialGradient(x, y + r * 0.3, 0, x, y + r * 0.3, r * 1.2)
  shadow.addColorStop(0, `rgba(0,0,0,${alpha * 0.28 * pulse})`)
  shadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shadow
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.4, r * 0.9, r * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  const sphere = ctx.createRadialGradient(x - r * 0.28, y - r * 0.32, 0, x, y, r * 1.7)
  sphere.addColorStop(0, `rgba(255,255,255,${alpha * 0.98 * pulse})`)
  sphere.addColorStop(0.3, `rgba(230,242,218,${alpha * 0.58 * pulse})`)
  sphere.addColorStop(0.7, `rgba(150,165,130,${alpha * 0.24 * pulse})`)
  sphere.addColorStop(1, 'rgba(70,80,60,0)')
  ctx.fillStyle = sphere
  ctx.beginPath()
  ctx.arc(x, y, r * 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(255,255,255,${alpha * pulse})`
  ctx.beginPath()
  ctx.arc(x - r * 0.35, y - r * 0.42, r * 0.42, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35 * pulse})`
  ctx.lineWidth = 0.45
  ctx.beginPath()
  ctx.arc(x, y, r * 1.08, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function drawOrganicHub(ctx, x, y, alpha, time, seed, spokeCount) {
  ctx.save()
  ctx.lineCap = 'round'

  const gr = ctx.createRadialGradient(x, y, 0, x, y, 88)
  gr.addColorStop(0, `rgba(${WARM.r},${WARM.g},${WARM.b},${alpha * 0.18})`)
  gr.addColorStop(0.25, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.28})`)
  gr.addColorStop(0.55, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.08})`)
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gr
  ctx.fillRect(x - 88, y - 88, 176, 176)

  for (let loop = 0; loop < 8; loop += 1) {
    const r = 2.5 + loop * 2.2 + Math.sin(time * 0.65 + loop * 0.8) * 0.45
    const steps = 14 + loop * 2
    ctx.beginPath()
    for (let i = 0; i <= steps; i += 1) {
      const a = (Math.PI * 2 * i) / steps + time * 0.035 + loop * 0.48
      const wob = hash1(seed + loop * 17 + i) * 2.4
      const px = x + Math.cos(a) * (r + wob)
      const py = y + Math.sin(a) * (r + wob * 0.78)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.strokeStyle = `rgba(${WARM.r},${WARM.g},${WARM.b},${alpha * (0.42 - loop * 0.038)})`
    ctx.lineWidth = 0.55 + loop * 0.06
    ctx.stroke()
  }

  const ticks = Math.max(18, spokeCount)
  for (let i = 0; i < ticks; i += 1) {
    const a = (Math.PI * 2 * i) / ticks + time * 0.022
    const len = 11 + hash1(seed + i * 2.3) * 7
    ctx.strokeStyle = `rgba(${SILK.r},${SILK.g},${SILK.b},${alpha * (0.28 + hash1(i + seed) * 0.22)})`
    ctx.lineWidth = 0.38 + hash1(i * 1.7) * 0.42
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5)
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
  }

  ctx.fillStyle = `rgba(20,26,18,${alpha * 0.72})`
  ctx.beginPath()
  ctx.arc(x, y, 4.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.98})`
  ctx.beginPath()
  ctx.arc(x - 0.8, y - 1, 2.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = `rgba(${SILK.r},${SILK.g},${SILK.b},${alpha * 0.35})`
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(x, y, 5.8, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function drawAnchorPin(ctx, x, y, alpha, time, seed) {
  ctx.save()
  const pulse = 0.85 + Math.sin(time * 2.2 + seed) * 0.15
  const gr = ctx.createRadialGradient(x, y, 0, x, y, 14 * pulse)
  gr.addColorStop(0, `rgba(255,255,255,${alpha * 0.5 * pulse})`)
  gr.addColorStop(0.5, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.2 * pulse})`)
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gr
  ctx.beginPath()
  ctx.arc(x, y, 14 * pulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(255,255,255,${alpha * pulse})`
  ctx.beginPath()
  ctx.arc(x, y, 3.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.6})`
  ctx.beginPath()
  ctx.arc(x, y, 5.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

let noisePattern = null

export function getSilkNoisePattern() {
  if (noisePattern) return noisePattern
  const size = 128
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const g = c.getContext('2d')
  const img = g.createImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      const v = hash2(x, y)
      const fiber = hash2(x * 3.1 + y * 0.5, y * 2.7) > 0.78 ? 35 : 0
      const thread = hash2(x * 0.4, y * 8) > 0.92 ? 18 : 0
      const val = Math.floor(v * 50 + fiber + thread)
      img.data[i] = val
      img.data[i + 1] = val + 6
      img.data[i + 2] = val - 3
      img.data[i + 3] = Math.floor(v * 26 + fiber * 0.5 + thread * 0.3)
    }
  }
  g.putImageData(img, 0, 0)
  noisePattern = g.createPattern(c, 'repeat')
  return noisePattern
}

export function drawFilmGrain(ctx, w, h, alpha = 0.08, time = 0) {
  getSilkNoisePattern()
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = alpha
  const size = 128
  const ox = (time * 13) % size
  const oy = (time * 9) % size
  ctx.translate(-ox, -oy)
  ctx.fillStyle = noisePattern
  ctx.fillRect(ox, oy, w + size, h + size)
  ctx.restore()
}

export function drawVignetteSilk(ctx, w, h) {
  const vg = ctx.createRadialGradient(w * 0.5, h * 0.32, h * 0.08, w * 0.5, h * 0.5, h * 0.9)
  vg.addColorStop(0, 'rgba(200,214,188,0.06)')
  vg.addColorStop(0.5, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.15)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, w, h)
}

export function drawSilkMist(ctx, w, h, time, alpha = 0.04) {
  const mx = w * (0.45 + Math.sin(time * 0.15) * 0.08)
  const my = h * (0.38 + Math.cos(time * 0.12) * 0.05)
  const gr = ctx.createRadialGradient(mx, my, 0, mx, my, w * 0.55)
  gr.addColorStop(0, `rgba(210,222,198,${alpha})`)
  gr.addColorStop(0.6, `rgba(160,175,145,${alpha * 0.35})`)
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gr
  ctx.fillRect(0, 0, w, h)
}

/** Soft prismatic light pools at web hub focal points. */
export function drawSilkCaustics(ctx, w, h, time, hubs = []) {
  hubs.forEach((hub, i) => {
    const pulse = 0.82 + Math.sin(time * 0.55 + i * 1.7) * 0.18
    const r = (90 + i * 24) * pulse
    const ox = Math.sin(time * 0.22 + i) * 12
    const oy = Math.cos(time * 0.18 + i * 1.3) * 10
    const gr = ctx.createRadialGradient(hub.x + ox, hub.y + oy, 0, hub.x, hub.y, r)
    gr.addColorStop(0, `rgba(255,255,255,${0.045 * pulse})`)
    gr.addColorStop(0.35, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${0.028 * pulse})`)
    gr.addColorStop(0.7, `rgba(${DEEP.r},${DEEP.g},${DEEP.b},${0.012 * pulse})`)
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gr
    ctx.beginPath()
    ctx.arc(hub.x, hub.y, r, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawWebAtmosphere(ctx, w, h, time, hubs, alpha = 1) {
  drawSilkCaustics(ctx, w, h, time, hubs)
  drawSilkMist(ctx, w, h, time, 0.038 * alpha)
}

export function drawSilkPulsePoint(ctx, p, alpha) {
  const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7)
  gr.addColorStop(0, `rgba(255,255,255,${alpha})`)
  gr.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gr
  ctx.beginPath()
  ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
  ctx.fill()
}

/** Expanding shock ring when a card snaps into the web. */
export function drawLandingBurst(ctx, x, y, life, seed) {
  const expand = 1 - life
  const r = 10 + expand * 56
  const alpha = life * 0.92
  const flicker = 0.88 + Math.sin(seed * 0.07 + expand * 14) * 0.12

  const gr = ctx.createRadialGradient(x, y, 0, x, y, r)
  gr.addColorStop(0, `rgba(255,255,255,${alpha * 0.95 * flicker})`)
  gr.addColorStop(0.25, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.55 * flicker})`)
  gr.addColorStop(0.65, `rgba(${SAGE.r},${SAGE.g},${SAGE.b},${alpha * 0.12 * flicker})`)
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gr
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.42 * flicker})`
  ctx.lineWidth = 1.1 + life * 0.6
  ctx.beginPath()
  ctx.arc(x, y, r * 0.68, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(${SILK.r},${SILK.g},${SILK.b},${alpha * 0.22 * flicker})`
  ctx.lineWidth = 0.65
  ctx.beginPath()
  ctx.arc(x, y, r * 0.38 + expand * 6, 0, Math.PI * 2)
  ctx.stroke()
}
