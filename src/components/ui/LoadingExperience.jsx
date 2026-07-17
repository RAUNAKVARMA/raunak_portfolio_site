import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'

function LoadingExperience() {
  const scene = useSceneProgressOptional()

  if (scene?.canvasReady) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[45] flex items-end justify-center pb-32">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">Initializing scene</p>
    </div>
  )
}

export default LoadingExperience
