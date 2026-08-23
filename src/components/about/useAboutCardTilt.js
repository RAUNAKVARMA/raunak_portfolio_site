import { useCallback, useEffect, useRef } from 'react'

const states = new Map()
let raf = 0
let running = false

function tick() {
  if (!running) return
  raf = requestAnimationFrame(tick)
  states.forEach((s) => {
    const follow = s.hover ? 0.32 : 0.16
    s.cx += (s.tx - s.cx) * follow
    s.cy += (s.ty - s.cy) * follow
    s.gx += (s.tgx - s.gx) * follow
    s.gy += (s.tgy - s.gy) * follow
    s.el.style.setProperty('--tilt-x', `${s.cy.toFixed(2)}deg`)
    s.el.style.setProperty('--tilt-y', `${s.cx.toFixed(2)}deg`)
    s.el.style.setProperty('--glow-x', `${s.gx.toFixed(1)}%`)
    s.el.style.setProperty('--glow-y', `${s.gy.toFixed(1)}%`)
  })
}

function startLoop() {
  if (running) return
  running = true
  raf = requestAnimationFrame(tick)
}

function stopLoop() {
  if (states.size > 0) return
  running = false
  cancelAnimationFrame(raf)
}

/** Spring-smoothed 3D tilt for premium card interaction. */
export function useAboutCardTilt(maxTilt = 4) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const state = { el, tx: 0, ty: 0, cx: 0, cy: 0, tgx: 50, tgy: 50, gx: 50, gy: 50, hover: false }
    states.set(el, state)
    startLoop()
    return () => {
      states.delete(el)
      stopLoop()
    }
  }, [])

  const onMove = useCallback(
    (e) => {
      const el = ref.current
      const state = el ? states.get(el) : null
      if (!state) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      state.hover = true
      state.tx = x * maxTilt
      state.ty = -y * maxTilt
      state.tgx = (x + 0.5) * 100
      state.tgy = (y + 0.5) * 100
    },
    [maxTilt],
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    const state = el ? states.get(el) : null
    if (!state) return
    state.hover = false
    state.tx = 0
    state.ty = 0
    state.tgx = 50
    state.tgy = 50
  }, [])

  const onDown = useCallback(() => {
    ref.current?.classList.add('about-net-card--pressed')
  }, [])

  const onUp = useCallback(() => {
    ref.current?.classList.remove('about-net-card--pressed')
  }, [])

  return { ref, onMove, onLeave, onDown, onUp }
}
