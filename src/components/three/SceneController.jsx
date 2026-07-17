import { useEffect } from 'react'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

export default function SceneController() {
  const scene = useSceneProgressOptional()
  const { prefersReducedMotion } = useReducedMotionProfile()

  useEffect(() => {
    if (!scene || prefersReducedMotion) return undefined

    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      scene.setMouse({ x, y })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [prefersReducedMotion, scene])

  useEffect(() => {
    if (!scene) return undefined

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      scene.setScrollProgress(Math.min(1, Math.max(0, progress)))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scene])

  return null
}
