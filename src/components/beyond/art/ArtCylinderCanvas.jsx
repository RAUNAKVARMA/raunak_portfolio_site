import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import VortexBackground from './VortexBackground'

/**
 * Canyon twin vortex — same field on phone and desktop; only DPR softens for GPU.
 */
function ArtScene({ active, intensity }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <VortexBackground active={active} intensity={intensity} />
    </>
  )
}

function ArtCylinderCanvas({
  active = true,
  paused = false,
  mobileLite = false,
  onContextLost,
}) {
  const isActive = active && !paused
  const intensity = 1.55
  const dpr = mobileLite ? [1, 1.85] : [1, 2.25]

  return (
    <Canvas
      className="absolute inset-0 block h-full w-full"
      camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 80 }}
      dpr={dpr}
      gl={{
        alpha: false,
        antialias: !mobileLite,
        powerPreference: 'high-performance',
        stencil: false,
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 1)
        gl.toneMapping = THREE.NoToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
        try {
          window.__MAX_TEX_SIZE__ = gl.capabilities?.getMaxTextureSize?.() || 8192
        } catch {
          /* */
        }
        const canvas = gl.domElement
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.display = 'block'
        if (onContextLost) {
          canvas.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault()
              onContextLost()
            },
            false,
          )
        }
      }}
      frameloop={isActive ? 'always' : 'demand'}
      style={{ touchAction: 'pan-y', width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ArtScene active={isActive} intensity={intensity} />
      </Suspense>
    </Canvas>
  )
}

export default ArtCylinderCanvas
