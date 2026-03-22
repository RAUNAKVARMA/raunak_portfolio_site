import { motion } from 'framer-motion'
import { useScrollProgress } from '../../hooks/useScrollProgress'

function ScrollProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-white/5">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 shadow-[0_0_14px_rgba(232,121,249,0.85)]"
        style={{ scaleX: progress }}
      />
    </div>
  )
}

export default ScrollProgressBar
