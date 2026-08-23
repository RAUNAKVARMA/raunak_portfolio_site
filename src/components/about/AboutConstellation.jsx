import { useEffect, useRef } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

function AboutConstellation({ className = '', density = 48, hue = 184, parallax = 1 }) {
  const canvasRef = useRef(null)
  const { prefersReducedMotion } = useReducedMotionProfile()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersReducedMotion) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    let raf = 0
    let running = true
    let visible = true
    let w = 0
    let h = 0
    let scrollY = 0
    let mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let time = 0

    const nodes = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      ox: Math.random(),
      oy: Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: (Math.random() - 0.5) * 0.00012,
      r: 0.5 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
    }))

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onScroll = () => {
      scrollY = window.scrollY
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - rect.left) / rect.width
      mouse.ty = (e.clientY - rect.top) / rect.height
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { root: null, threshold: 0 },
    )
    observer.observe(canvas)

    const draw = (now) => {
      if (!running) return
      raf = requestAnimationFrame(draw)
      if (!visible) return

      time = now * 0.001
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06

      ctx.clearRect(0, 0, w, h)

      const drift = scrollY * 0.00008 * parallax
      const linkDist = Math.min(w, h) * 0.16

      for (const n of nodes) {
        const wave = Math.sin(time * 0.4 + n.phase) * 0.000025
        n.x += n.vx + wave
        n.y += n.vy + Math.cos(time * 0.35 + n.phase) * 0.000025
        if (n.x < 0.02 || n.x > 0.98) n.vx *= -1
        if (n.y < 0.02 || n.y > 0.98) n.vy *= -1
        n.x = Math.max(0.02, Math.min(0.98, n.x))
        n.y = Math.max(0.02, Math.min(0.98, n.y))
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]
        const ax = a.x * w
        const ay = a.y * h
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]
          const bx = b.x * w
          const by = b.y * h
          const dx = bx - ax
          const dy = by - ay
          const dist = Math.hypot(dx, dy)
          if (dist > linkDist) continue
          const t = 1 - dist / linkDist
          const alpha = t * t * 0.18
          ctx.strokeStyle = `rgba(${hue}, 196, 168, ${alpha})`
          ctx.lineWidth = 0.6 + t * 0.4
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.stroke()
        }
      }

      for (const n of nodes) {
        const px = n.x * w
        const py = n.y * h
        const mx = (mouse.x - n.x) * 14
        const my = (mouse.y - n.y) * 14
        const pulse = 0.85 + Math.sin(time * 1.2 + n.phase) * 0.15

        ctx.fillStyle = `rgba(${hue}, 196, 168, ${0.28 * pulse})`
        ctx.beginPath()
        ctx.arc(px + mx, py + my, n.r * pulse, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      running = false
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [density, hue, parallax, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return <canvas ref={canvasRef} className={className} aria-hidden />
}

export default AboutConstellation
