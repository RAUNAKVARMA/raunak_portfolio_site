import { useCallback, useRef, useState } from 'react'

export function useMagneticEffect(maxDistance = 90, strength = 8) {
  const ref = useRef(null)
  const [transform, setTransform] = useState({ x: 0, y: 0 })

  const handleMove = useCallback(
    (event) => {
      if (!ref.current) return

      const bounds = ref.current.getBoundingClientRect()
      const centerX = bounds.left + bounds.width / 2
      const centerY = bounds.top + bounds.height / 2
      const distanceX = event.clientX - centerX
      const distanceY = event.clientY - centerY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance < maxDistance) {
        const x = (distanceX / maxDistance) * strength
        const y = (distanceY / maxDistance) * strength
        setTransform({ x, y })
      } else {
        setTransform({ x: 0, y: 0 })
      }
    },
    [maxDistance, strength],
  )

  const reset = useCallback(() => setTransform({ x: 0, y: 0 }), [])

  return { ref, transform, handleMove, reset }
}
