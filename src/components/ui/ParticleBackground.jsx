import { useCallback, useMemo } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from '../../hooks/useIsMobileOrTouch'

function ParticleBackground() {
  const prefersReducedMotion = useReducedMotion()
  const isTouchLike = useIsMobileOrTouch()

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  const particleConfig = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280
    const deviceMemory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? navigator.deviceMemory : 8
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8
    const lowPower = deviceMemory <= 4 || cores <= 4
    const compact = width < 768 || isTouchLike

    return {
      count: lowPower ? 34 : compact ? 48 : 80,
      linkDistance: compact ? 95 : 120,
      moveSpeed: lowPower ? 0.24 : compact ? 0.32 : 0.45,
      fpsLimit: lowPower ? 42 : 60,
    }
  }, [isTouchLike])

  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 0 },
      fpsLimit: particleConfig.fpsLimit,
      particles: {
        number: { value: particleConfig.count, density: { enable: true, area: 900 } },
        color: { value: ['#22D3EE', '#E879F9', '#F0F9FF', '#C084FC'] },
        opacity: { value: { min: 0.25, max: 0.55 } },
        size: { value: { min: 1, max: 2.2 } },
        links: {
          enable: true,
          distance: particleConfig.linkDistance,
          color: '#67E8F9',
          opacity: 0.22,
          width: 1,
        },
        move: {
          enable: true,
          speed: particleConfig.moveSpeed,
          outModes: { default: 'out' },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          resize: true,
        },
        modes: {
          grab: { distance: 125, links: { opacity: 0.26 } },
        },
      },
      detectRetina: true,
      background: { color: 'transparent' },
    }),
    [particleConfig],
  )

  if (prefersReducedMotion) return null

  return <Particles id="neural-particles" init={particlesInit} options={options} />
}

export default ParticleBackground
