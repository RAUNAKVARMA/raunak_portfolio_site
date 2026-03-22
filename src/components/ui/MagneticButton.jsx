import { motion, useReducedMotion } from 'framer-motion'
import { useMagneticEffect } from '../../hooks/useMagneticEffect'

function MagneticButton({
  children,
  className = '',
  as: Component = 'button',
  ...props
}) {
  const prefersReducedMotion = useReducedMotion()
  const { ref, transform, handleMove, reset } = useMagneticEffect(100, 8)

  return (
    <motion.div
      ref={ref}
      onMouseMove={prefersReducedMotion ? undefined : handleMove}
      onMouseLeave={prefersReducedMotion ? undefined : reset}
      animate={prefersReducedMotion ? { x: 0, y: 0 } : { x: transform.x, y: transform.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, mass: 0.3 }}
      className="inline-block"
    >
      <Component
        {...props}
        className={`rounded-xl transition-all duration-300 ease-neural ${className}`}
      >
        {children}
      </Component>
    </motion.div>
  )
}

export default MagneticButton
