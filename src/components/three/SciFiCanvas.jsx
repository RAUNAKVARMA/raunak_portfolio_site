import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Sparkles, Stars } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import NebulaSky from './NebulaSky'
import EtherealObjects from './EtherealObjects'

function SubtleCameraBreath() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = Math.sin(t * 0.014) * 0.08
    state.camera.position.y = Math.cos(t * 0.011) * 0.055
    state.camera.position.z = 8.45 + Math.sin(t * 0.018) * 0.07
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.18} />
      {/* HDR reflections — makes metals & glass read “real” & extra luminous with bloom */}
      <Environment preset="city" environmentIntensity={0.55} background={false} />

      <NebulaSky />

      <Stars
        radius={220}
        depth={120}
        count={18000}
        factor={3.2}
        saturation={0.12}
        fade
        speed={0.11}
      />

      <Sparkles count={200} scale={18} size={2.8} speed={0.32} color="#a5f3fc" opacity={0.45} />
      <Sparkles count={140} scale={16} size={2.2} speed={0.38} color="#f0abfc" opacity={0.38} />
      <Sparkles count={90} scale={22} size={1.4} speed={0.22} color="#fde68a" opacity={0.22} />

      <EtherealObjects />

      <SubtleCameraBreath />

      <PostFX />
    </>
  )
}

/** Heavy bloom — “unbelievable” glow on emissive + HDR highlights */
function PostFX() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.055}
        luminanceSmoothing={0.82}
        intensity={1.95}
        mipmapBlur
        radius={0.72}
      />
      <Vignette eskil={false} offset={0.04} darkness={0.34} />
      <ChromaticAberration offset={new THREE.Vector2(0.00055, 0.00065)} />
    </EffectComposer>
  )
}

export default function SciFiCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[3] h-[100svh] w-full mix-blend-screen">
      <Canvas
        camera={{ position: [0, 0, 8.45], fov: 48, near: 0.1, far: 280 }}
        dpr={[1, 1.55]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.22
          scene.background = null
          scene.fog = new THREE.FogExp2('#020617', 0.0032)
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
