import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

function AnimatedCounter({ target, suffix = '+' }) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView) return

    const duration = 1200
    const start = performance.now()

    const animate = (timestamp) => {
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [inView, target])

  return <span ref={ref}>{count + suffix}</span>
}

export default AnimatedCounter
