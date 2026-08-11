import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { createFluidSimulation } from '../../lib/webglFluid'

/** Soft palette for mid-page / contact beats. */
const SOFT_FLUID_OPTIONS = {
  SIM_RESOLUTION: 96,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 1.25,
  VELOCITY_DISSIPATION: 0.28,
  PRESSURE_ITERATIONS: 12,
  CURL: 20,
  SPLAT_RADIUS: 0.2,
  SPLAT_FORCE: 4200,
  BLOOM: true,
  BLOOM_ITERATIONS: 4,
  BLOOM_RESOLUTION: 128,
  BLOOM_INTENSITY: 0.45,
  SUNRAYS: false,
  SHADING: true,
  COLORFUL: true,
}

/** Rich home-hero settings — punchy neon trail. */
const RICH_FLUID_OPTIONS = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 768,
  DENSITY_DISSIPATION: 0.95,
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE_ITERATIONS: 16,
  CURL: 30,
  SPLAT_RADIUS: 0.26,
  SPLAT_FORCE: 5600,
  BLOOM: true,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.78,
  BLOOM_THRESHOLD: 0.45,
  SUNRAYS: false,
  SHADING: true,
  COLORFUL: true,
  COLOR_MULTIPLIER: 0.28,
}

const PEAK_OPACITY = {
  rich: 0.72,
  soft: 0.4,
}

const ZONE_SELECTOR = '[data-fluid-zone]'

function peakFor(zone) {
  const key = zone?.dataset?.fluidZone === 'rich' ? 'rich' : 'soft'
  return PEAK_OPACITY[key]
}

function zoneUnderPointer(clientX, clientY) {
  const zones = document.querySelectorAll(ZONE_SELECTOR)
  for (const el of zones) {
    const r = el.getBoundingClientRect()
    if (
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom
    ) {
      return el
    }
  }
  return null
}

/**
 * Site fluid overlay driven by `[data-fluid-zone="rich"|"soft"]` markers.
 * Strong inside tagged immersive beats; fades as those sections leave the viewport.
 * Not forced onto every page intro — only curated zones.
 */
function FluidCanvas() {
  const canvasRef = useRef(null)
  const simRef = useRef(null)
  const visibilityRef = useRef(0)
  const acceptSplatRef = useRef(false)
  const { pathname } = useLocation()
  const { prefersReducedMotion, isTouchLike, enableFluidSim } = useReducedMotionProfile()

  const heavyRoute =
    pathname.startsWith('/beyond/cars') ||
    pathname.startsWith('/beyond/drawing') ||
    pathname.startsWith('/beyond/art') ||
    pathname.startsWith('/beyond/space') ||
    pathname.startsWith('/beyond/editing')
  const canRun = enableFluidSim && !isTouchLike && !heavyRoute && !prefersReducedMotion

  useEffect(() => {
    if (!canRun) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    let rafFade = 0
    let stopTimer = 0
    let destroyed = false
    let currentMode = null
    let sim = null

    const setVisual = (visibility) => {
      visibilityRef.current = visibility
      canvas.style.opacity = String(visibility)
      canvas.style.visibility = visibility > 0.01 ? 'visible' : 'hidden'
    }

    const ensureSim = (mode) => {
      if (sim && currentMode === mode) return sim
      if (sim) {
        sim.destroy()
        sim = null
        simRef.current = null
      }
      currentMode = mode
      sim = createFluidSimulation(
        canvas,
        mode === 'rich' ? RICH_FLUID_OPTIONS : SOFT_FLUID_OPTIONS,
      )
      simRef.current = sim
      sim.start()
      return sim
    }

    const pauseSoon = () => {
      window.clearTimeout(stopTimer)
      stopTimer = window.setTimeout(() => {
        if (destroyed || visibilityRef.current > 0.02) return
        acceptSplatRef.current = false
        if (sim) {
          sim.stop()
        }
      }, 900)
    }

    const resumeSim = () => {
      window.clearTimeout(stopTimer)
      if (sim) sim.start()
    }

    const recompute = () => {
      const zones = document.querySelectorAll(ZONE_SELECTOR)
      if (!zones.length) {
        acceptSplatRef.current = false
        setVisual(0)
        pauseSoon()
        return
      }

      const vh = window.innerHeight || 1
      let bestVis = 0
      let bestMode = 'soft'

      zones.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
        if (visible <= 0) return

        const ratio = Math.min(1, Math.max(0, visible / Math.min(rect.height || vh, vh)))
        // Soften exit: insist the zone still occupies a useful slice of the first screen.
        const occupy = Math.min(1, Math.max(0, visible / vh))
        const mode = el.dataset.fluidZone === 'rich' ? 'rich' : 'soft'
        // Rich zones should hit full punch even when the section is shorter than 100vh
        // (Beyond hero used to score ~0.45 opacity vs home ~0.62 — washed colors).
        const score =
          mode === 'rich'
            ? Math.min(1, ratio * (0.55 + 0.7 * occupy))
            : ratio * (0.35 + 0.65 * occupy)
        const weighted = score * (mode === 'rich' ? 1 : 0.85)

        if (weighted > bestVis) {
          bestVis = weighted
          bestMode = mode
        }
      })

      const peak = peakFor({ dataset: { fluidZone: bestMode } })
      // Rich zones: snap toward peak opacity so short Beyond blocks are not washed vs home
      const opacity =
        bestVis > 0.04
          ? peak * (bestMode === 'rich' ? Math.min(1, bestVis * 1.45) : bestVis)
          : 0
      acceptSplatRef.current = opacity > 0.06

      if (opacity > 0.04) {
        ensureSim(bestMode)
        resumeSim()
      } else {
        pauseSoon()
      }

      cancelAnimationFrame(rafFade)
      rafFade = requestAnimationFrame(() => setVisual(opacity))
    }

    // Defer first measure until route content mounts.
    const boot = window.setTimeout(recompute, 40)

    const onScrollOrResize = () => recompute()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    const mo = new MutationObserver(() => recompute())
    mo.observe(document.getElementById('main-content') || document.body, {
      childList: true,
      subtree: true,
    })

    const onPointerMove = (event) => {
      if (!acceptSplatRef.current || !simRef.current) return
      if (!zoneUnderPointer(event.clientX, event.clientY)) return
      const rect = canvas.getBoundingClientRect()
      simRef.current.splatAt(event.clientX, event.clientY, rect)
    }

    const onPointerDown = (event) => {
      if (!acceptSplatRef.current || !simRef.current) return
      if (!zoneUnderPointer(event.clientX, event.clientY)) return
      const rect = canvas.getBoundingClientRect()
      simRef.current.splatAt(event.clientX, event.clientY, rect)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    const ro = new ResizeObserver(() => {
      simRef.current?.resize()
      recompute()
    })
    ro.observe(canvas)

    setVisual(0)

    return () => {
      destroyed = true
      window.clearTimeout(boot)
      window.clearTimeout(stopTimer)
      cancelAnimationFrame(rafFade)
      mo.disconnect()
      ro.disconnect()
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      sim?.destroy()
      simRef.current = null
    }
  }, [canRun, pathname])

  if (!canRun) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[35] h-full w-full mix-blend-screen transition-opacity duration-500 ease-out"
      style={{ opacity: 0, visibility: 'hidden' }}
      aria-hidden
    />
  )
}

export default FluidCanvas
