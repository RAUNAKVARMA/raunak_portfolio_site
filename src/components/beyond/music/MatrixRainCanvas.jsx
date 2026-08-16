import { useEffect, useRef } from 'react'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'

const GLYPHS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789'

function glyph() {
  return GLYPHS[(Math.random() * GLYPHS.length) | 0]
}

function makeStreams(width, height, size) {
  const cols = Math.max(10, Math.floor(width / size))
  return Array.from({ length: cols }, (_, i) => ({
    x: i * size,
    y: Math.floor(Math.random() * (height / size)) * size,
    speed: 5.5 + Math.random() * 4.5,
    hold: 0,
    ch: glyph(),
  }))
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
    let size = 16

    const paint = (dt, w, h) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${size}px "Noto Sans JP", "Courier New", monospace`

      for (const col of streams) {
        if (Math.random() < 0.32) col.ch = glyph()

        ctx.fillStyle = '#00ff41'
        ctx.fillText(col.ch, col.x, col.y)

        col.hold += (dt / 1000) * col.speed * size
        if (col.hold >= size) {
          col.y += size
          col.hold -= size
          col.ch = glyph()
        }

        if (col.y > h && Math.random() > 0.975) {
          col.y = 0
          col.speed = 5.5 + Math.random() * 4.5
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
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
      ctx.shadowBlur = 0

      size = isTouchLike ? 15 : 16
      streams = makeStreams(w, h, size)

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 90; i += 1) paint(32, w, h)
    }

    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (document.hidden || prefersReducedMotion) return

      const dt = Math.min(34, now - last)
      last = now
      paint(dt, window.innerWidth, window.innerHeight)
    }

    const start = () => {
      resize()
      last = performance.now()
      if (!prefersReducedMotion) raf = requestAnimationFrame(frame)
    }

    const boot = document.fonts?.ready ? document.fonts.ready : Promise.resolve()
    boot.then(() => {
      if (running) start()
    })

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
