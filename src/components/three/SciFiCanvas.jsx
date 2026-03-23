import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import NebulaSky from './NebulaSky'
import EtherealObjects from './EtherealObjects'

function SubtleCameraBreath() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = Math.sin(t * 0.016) * 0.06
    state.camera.position.y = Math.cos(t * 0.012) * 0.045
    state.camera.position.z = 8.6 + Math.sin(t * 0.02) * 0.06
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <NebulaSky />

      <Stars
        radius={210}
        depth={115}
        count={16000}
        factor={3.1}
        saturation={0.08}
        fade
        speed={0.1}
      />

      {/* Near-field sparkle dust — reads as dimensional particles */}
      <Sparkles count={120} scale={16} size={2.2} speed={0.25} color="#a5f3fc" opacity={0.35} />
      <Sparkles count={80} scale={14} size={1.8} speed={0.3} color="#f0abfc" opacity={0.28} />

      <EtherealObjects />

      <SubtleCameraBreath />

      <PostFX />
    </>
  )
}

/** Strong bloom so emissive meshes read as glowing “other dimension” artefacts */
function PostFX() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.12}
        luminanceSmoothing={0.88}
        intensity={1.35}
        mipmapBlur
        radius={0.55}
      />
      <Vignette eskil={false} offset={0.05} darkness={0.38} />
      <ChromaticAberration offset={new THREE.Vector2(0.00045, 0.00055)} />
    </EffectComposer>
  )
}

export default function SciFiCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[3] h-[100svh] w-full mix-blend-screen">
      <Canvas
        camera={{ position: [0, 0, 8.6], fov: 46, near: 0.1, far: 260 }}
        dpr={[1, 1.5]}
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
          gl.toneMappingExposure = 1.05
          scene.background = null
          scene.fog = new THREE.FogExp2('#020617', 0.0038)
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
