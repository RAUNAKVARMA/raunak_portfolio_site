import { motion } from 'framer-motion'
import { useScrollProgress } from '../../hooks/useScrollProgress'

function ScrollProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-1 bg-black">
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX: progress,
          background: 'linear-gradient(90deg, #0066b1 0%, #1c69d4 50%, #e22718 100%)',
        }}
      />
    </div>
  )
}

export default ScrollProgressBar
