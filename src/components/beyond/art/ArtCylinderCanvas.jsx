import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import VortexBackground from './VortexBackground'

/**
 * Full-bleed image pages + strong twin side vortices.
 * Phone uses a wider FOV / pulled camera so both eyes + sketches stay readable.
 */
function ArtScene({ active, intensity, mobileLite }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <VortexBackground active={active} intensity={intensity} mobileLite={mobileLite} />
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
  // Same warp strength as desktop — framing differs on phone
  const intensity = 1.5
  const dpr = mobileLite ? [1, 1.75] : [1, 2]

  return (
    <Canvas
      className="absolute inset-0 block h-full w-full"
      camera={{
        position: [0, 0, mobileLite ? 6.35 : 5],
        fov: mobileLite ? 62 : 40,
        near: 0.1,
        far: 80,
      }}
      dpr={dpr}
      gl={{
        alpha: false,
        antialias: !mobileLite,
        powerPreference: 'high-performance',
        stencil: false,
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x000000, 1)
        gl.toneMapping = THREE.NoToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
        if (mobileLite) {
          camera.position.set(0, 0, 6.35)
          camera.fov = 62
          camera.updateProjectionMatrix()
        }
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
        <ArtScene active={isActive} intensity={intensity} mobileLite={mobileLite} />
      </Suspense>
    </Canvas>
  )
}

export default ArtCylinderCanvas
