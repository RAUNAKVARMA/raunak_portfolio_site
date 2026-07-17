import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import GenerativeHeroMesh from './GenerativeHeroMesh'
import OrbitalRing from './OrbitalRing'
import ParticleField from './ParticleField'
import FloatingShapes from './FloatingShapes'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

function SceneContents() {
  const { enableParticles } = useReducedMotionProfile()

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 6]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, -2, 5]} intensity={0.5} color="#1c69d4" />
      <pointLight position={[2, 1, 4]} intensity={1.2} color="#4d9fff" />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="#0066b1" />
      <Environment preset="night" environmentIntensity={0.65} background={false} />
      <GenerativeHeroMesh />
      <OrbitalRing />
      {enableParticles && <FloatingShapes />}
      {enableParticles && <ParticleField count={420} />}
      {/* PostFX disabled — @react-three/postprocessing v3 crashes the canvas */}
    </>
  )
}

export default function SceneCanvas() {
  const scene = useSceneProgressOptional()
  const { prefersReducedMotion } = useReducedMotionProfile()
  const [heroFade, setHeroFade] = useState(1)

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.85
      const next = Math.max(0, Math.min(1, 1 - window.scrollY / threshold))
      setHeroFade(next)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visibleOpacity = scene?.canvasReady ? heroFade : 0

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[3] h-[100svh] w-full transition-opacity duration-700 ease-out-expo"
      style={{ opacity: visibleOpacity }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 2]}
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.05) 62%, transparent 75%), linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 35%, transparent 65%)',
        }}
      />
    </div>
  )
}
