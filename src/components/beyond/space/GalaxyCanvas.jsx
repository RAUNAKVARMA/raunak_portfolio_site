import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import GalaxyField from './GalaxyField'
import { spaceGalaxyDefaults } from '../../../lib/galaxyParams'

function CameraRig({ zoom }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    const t = Math.min(1, Math.max(0, zoom))
    const z = THREE.MathUtils.lerp(3.5, 16, t)
    const y = THREE.MathUtils.lerp(2.0, 5.5, t)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 4, 0.05)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 4, 0.05)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 4, 0.05)
    camera.lookAt(target.current)
  })

  return null
}

function GalaxyCanvas({
  zoom = 0,
  mobileLite = false,
  reducedMotion = false,
  insideColor = spaceGalaxyDefaults.insideColor,
  midColor = spaceGalaxyDefaults.midColor,
  outsideColor = spaceGalaxyDefaults.outsideColor,
}) {
  const count = mobileLite ? 120000 : spaceGalaxyDefaults.count
  const dpr = mobileLite ? [1, 1.25] : [1, 2]

  const params = useMemo(
    () => ({
      ...spaceGalaxyDefaults,
      insideColor,
      midColor,
      outsideColor,
    }),
    [insideColor, midColor, outsideColor],
  )

  return (
    <Canvas
      className="h-full w-full"
      dpr={dpr}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.NoToneMapping,
      }}
      camera={{ position: [0, 2, 3.5], fov: 75, near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 1)
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <color attach="background" args={['#000000']} />
      <Suspense fallback={null}>
        <CameraRig zoom={zoom} />
        <GalaxyField
          count={count}
          zoom={zoom}
          reducedMotion={reducedMotion}
          params={params}
        />
      </Suspense>
    </Canvas>
  )
}

export default GalaxyCanvas
