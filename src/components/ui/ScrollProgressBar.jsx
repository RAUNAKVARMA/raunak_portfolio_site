import { motion } from 'framer-motion'
import { useScrollProgress } from '../../hooks/useScrollProgress'

function ScrollProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-white/5">
      <motion.div
        className="h-full origin-left bg-accentPrimary shadow-[0_0_12px_rgba(0,212,255,0.9)]"
        style={{ scaleX: progress }}
      />
    </div>
  )
}

export default ScrollProgressBar
