import { motion } from 'framer-motion'
import { useScrollProgress } from '../../hooks/useScrollProgress'

function ScrollProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-white/[0.04]">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-indigo-500 to-violet-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
        style={{ scaleX: progress }}
      />
    </div>
  )
}

export default ScrollProgressBar
