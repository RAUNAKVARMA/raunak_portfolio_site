import { motion } from 'framer-motion'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'

function LoadingExperience() {
  const scene = useSceneProgressOptional()

  if (scene?.canvasReady) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[50] flex items-center justify-center bg-bgPrimary">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-10 w-10 animate-pulse rounded-full border border-indigo-400/30 bg-indigo-500/10" />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-textMuted">Loading scene</p>
      </motion.div>
    </div>
  )
}

export default LoadingExperience
