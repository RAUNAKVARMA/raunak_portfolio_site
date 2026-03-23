import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import NebulaSky from './NebulaSky'

/**
 * Cinematic deep space: procedural nebula/aurora (shader) + star field + bloom.
 * No sparkles, no meshes as “props”, no floating debris — phenomena only.
 */
function SubtleCameraBreath() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Imperceptible drift — like a slow spacecraft / film plate, not mouse-chasing
    state.camera.position.x = Math.sin(t * 0.018) * 0.04
    state.camera.position.y = Math.cos(t * 0.014) * 0.03
    state.camera.position.z = 8.8 + Math.sin(t * 0.022) * 0.04
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene() {
  return (
    <>
      <NebulaSky />

      {/* Distant stars — astronomical field, not UI particles */}
      <Stars
        radius={200}
        depth={110}
        count={18000}
        factor={3.2}
        saturation={0}
        fade
        speed={0.12}
      />

      <SubtleCameraBreath />

      <PostFX />
    </>
  )
}

/** Soft bloom — star bleed & nebula glow (movie glass, not arcade) */
function PostFX() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.28}
        luminanceSmoothing={0.93}
        intensity={0.78}
        mipmapBlur
        radius={0.36}
      />
      <Vignette eskil={false} offset={0.07} darkness={0.4} />
      <ChromaticAberration offset={new THREE.Vector2(0.00028, 0.00038)} />
    </EffectComposer>
  )
}

export default function SciFiCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[3] h-[100svh] w-full mix-blend-screen">
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 45, near: 0.1, far: 260 }}
        dpr={[1, 1.45]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
          scene.fog = new THREE.FogExp2('#020617', 0.0045)
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
