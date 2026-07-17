import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import VortexBackground from './VortexBackground'

/**
 * Full-bleed image pages + strong twin side vortices.
 * DRAWING text is baked into each page so the warp pulls it like Canyon.
 */
function ArtScene({ active }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <VortexBackground active={active} intensity={1.35} />
    </>
  )
}

function ArtCylinderCanvas({ active = true, paused = false }) {
  const { prefersReducedMotion } = useReducedMotionProfile()
  const isActive = active && !paused && !prefersReducedMotion

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 80 }}
      dpr={[1, 2]}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 1)
        gl.toneMapping = THREE.NoToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
      frameloop={isActive ? 'always' : 'demand'}
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <ArtScene active={isActive} />
      </Suspense>
    </Canvas>
  )
}

export default ArtCylinderCanvas
