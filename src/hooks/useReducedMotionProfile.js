import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from './useIsMobileOrTouch'

/**
 * Single gate for Lenis, GSAP scrub, custom cursor, particles, and 3D auto-rotation.
 */
export function useReducedMotionProfile() {
  const prefersReducedMotion = useReducedMotion()
  const isTouchLike = useIsMobileOrTouch()

  return {
    prefersReducedMotion: Boolean(prefersReducedMotion),
    isTouchLike,
    enableSmoothScroll: !prefersReducedMotion,
    enableGsapScrub: !prefersReducedMotion,
    enableCustomCursor: !prefersReducedMotion && !isTouchLike,
    enableParticles: !prefersReducedMotion,
    enable3DAutoRotation: !prefersReducedMotion,
    enableHeavyPostFX: !prefersReducedMotion,
    enableFluidSim: !prefersReducedMotion,
  }
}
