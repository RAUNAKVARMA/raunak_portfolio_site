import { useEffect, useRef } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { createFluidSimulation } from '../../lib/webglFluid'

function FluidFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      aria-hidden
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(28,105,212,0.25), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(136,51,255,0.12), transparent 55%)',
      }}
    />
  )
}

function FluidCanvas() {
  const canvasRef = useRef(null)
  const simRef = useRef(null)
  const { prefersReducedMotion } = useReducedMotionProfile()

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const canvas = canvasRef.current
    const hero = document.getElementById('hero')
    if (!canvas || !hero) return undefined

    // Lively Wallpaper "Fluids" defaults (Pavel Dobryakov engine)
    const sim = createFluidSimulation(canvas)

    simRef.current = sim
    sim.start()

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return
      }
      sim.splatAt(event.clientX, event.clientY, rect)
    }

    const onPointerDown = (event) => {
      const rect = canvas.getBoundingClientRect()
      sim.splatAt(event.clientX, event.clientY, rect)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    const ro = new ResizeObserver(() => {
      sim.resize()
    })
    ro.observe(canvas)

    return () => {
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      sim.destroy()
      simRef.current = null
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    return <FluidFallback />
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.12)_30%,black_46%,black_100%)]"
      aria-hidden
    />
  )
}

export default FluidCanvas
