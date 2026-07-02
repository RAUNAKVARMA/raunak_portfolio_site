import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import GenerativeHeroMesh from './GenerativeHeroMesh'
import ParticleField from './ParticleField'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

function SceneContents() {
  const { enableParticles } = useReducedMotionProfile()

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 8]} intensity={0.85} color="#c7d2fe" />
      <directionalLight position={[-6, -2, 4]} intensity={0.35} color="#6366f1" />
      <Environment preset="city" environmentIntensity={0.4} background={false} />
      <GenerativeHeroMesh />
      {enableParticles && <ParticleField count={600} />}
    </>
  )
}

export default function SceneCanvas() {
  const scene = useSceneProgressOptional()
  const { prefersReducedMotion } = useReducedMotionProfile()

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] h-[100svh] w-full transition-opacity duration-1000 ease-out-expo"
      style={{ opacity: scene?.canvasReady ? 1 : 0 }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onCreated={() => {
          scene?.setCanvasReady(true)
        }}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bgPrimary/40" />
    </div>
  )
}
