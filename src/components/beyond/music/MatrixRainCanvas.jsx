import { useEffect, useRef } from 'react'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'

const NOTE_COUNT = 5

function pickKind() {
  return (Math.random() * NOTE_COUNT) | 0
}

function makeStreams(cols, rows) {
  return Array.from({ length: cols }, () => {
    const len = 18 + ((Math.random() * 16) | 0)
    return {
      head: -((Math.random() * rows) | 0),
      speed: 14 + Math.random() * 18,
      hold: Math.random(),
      len,
      glyphs: Array.from({ length: rows + 40 }, pickKind),
    }
  })
}

function trailColor(i, len) {
  if (i === 0) return '#ffffff'
  if (i === 1) return '#d8ffdc'
  const t = i / len
  const g = Math.round(255 * (1 - t) ** 1.65)
  const a = (1 - t) ** 1.05
  return `rgba(0, ${Math.max(48, g)}, 58, ${a})`
}

function drawNote(ctx, kind, x, y, size, color) {
  const s = size
  ctx.save()
  ctx.translate(x + s * 0.08, y + s * 0.08)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowBlur = 0
  ctx.lineWidth = Math.max(1.1, s * 0.09)

  const head = (hx, hy, filled = true) => {
    ctx.beginPath()
    ctx.ellipse(hx, hy, s * 0.18, s * 0.125, -0.5, 0, Math.PI * 2)
    if (filled) ctx.fill()
    else ctx.stroke()
  }

  const stem = (hx, hy) => {
    const sx = hx + s * 0.14
    ctx.beginPath()
    ctx.moveTo(sx, hy)
    ctx.lineTo(sx, hy - s * 0.52)
    ctx.stroke()
    return sx
  }

  const flag = (sx, top) => {
    ctx.beginPath()
    ctx.moveTo(sx, top)
    ctx.bezierCurveTo(sx + s * 0.36, top, sx + s * 0.34, top + s * 0.22, sx, top + s * 0.3)
    ctx.closePath()
    ctx.fill()
  }

  if (kind === 0) {
    head(s * 0.28, s * 0.62, false)
  } else if (kind === 1) {
    head(s * 0.28, s * 0.64)
    stem(s * 0.28, s * 0.64)
  } else if (kind === 2) {
    head(s * 0.26, s * 0.64)
    flag(stem(s * 0.26, s * 0.64), s * 0.12)
  } else if (kind === 3) {
    head(s * 0.26, s * 0.64)
    const sx = stem(s * 0.26, s * 0.64)
    flag(sx, s * 0.1)
    flag(sx, s * 0.24)
  } else {
    head(s * 0.16, s * 0.64)
    head(s * 0.52, s * 0.64)
    const a = s * 0.16 + s * 0.14
    const b = s * 0.52 + s * 0.14
    ctx.lineWidth = Math.max(1.8, s * 0.14)
    ctx.beginPath()
    ctx.moveTo(a, s * 0.12)
    ctx.lineTo(b, s * 0.12)
    ctx.stroke()
    ctx.lineWidth = Math.max(1.1, s * 0.09)
    ctx.beginPath()
    ctx.moveTo(a, s * 0.64)
    ctx.lineTo(a, s * 0.12)
    ctx.moveTo(b, s * 0.64)
    ctx.lineTo(b, s * 0.12)
    ctx.stroke()
  }

  ctx.restore()
}

function MatrixRainCanvas() {
  const canvasRef = useRef(null)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return undefined

    let raf = 0
    let running = true
    let last = performance.now()
    let streams = []
    let size = 14
    let rows = 40

    const paint = (dt, w, h) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
      ctx.fillRect(0, 0, w, h)

      const step = (dt / 1000) * size

      for (let i = 0; i < streams.length; i += 1) {
        const col = streams[i]
        const x = i * size

        col.hold += step * col.speed
        while (col.hold >= size) {
          col.hold -= size
          col.head += 1
          const idx = ((col.head % col.glyphs.length) + col.glyphs.length) % col.glyphs.length
          col.glyphs[idx] = pickKind()
          if (Math.random() < 0.18) {
            const flicker = ((col.head - 2 - ((Math.random() * 8) | 0)) % col.glyphs.length + col.glyphs.length) % col.glyphs.length
            col.glyphs[flicker] = pickKind()
          }
          if (col.head > rows + col.len + ((Math.random() * 20) | 0)) {
            col.head = -col.len - ((Math.random() * 24) | 0)
            col.speed = 14 + Math.random() * 18
            col.len = 18 + ((Math.random() * 16) | 0)
          }
        }

        for (let t = 0; t < col.len; t += 1) {
          const row = col.head - t
          if (row < 0 || row >= rows) continue
          const gi = ((row % col.glyphs.length) + col.glyphs.length) % col.glyphs.length
          drawNote(ctx, col.glyphs[gi], x, row * size, size, trailColor(t, col.len))
        }
      }
    }

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true

      size = isTouchLike ? 13 : 14
      rows = Math.max(22, Math.ceil(h / size) + 4)
      const cols = Math.max(28, Math.floor(w / size))
      streams = makeStreams(cols, rows)

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      for (let k = 0; k < 30; k += 1) paint(32, w, h)
    }

    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (document.hidden || prefersReducedMotion) return

      const dt = Math.min(34, now - last)
      last = now
      paint(dt, window.innerWidth, window.innerHeight)
    }

    resize()
    last = performance.now()
    if (!prefersReducedMotion) raf = requestAnimationFrame(frame)

    window.addEventListener('resize', resize, { passive: true })
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [isTouchLike, prefersReducedMotion])

  return <canvas ref={canvasRef} className="music-rain" aria-hidden />
}

export default MatrixRainCanvas
