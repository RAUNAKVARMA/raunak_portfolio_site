import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'

const PAD_URL = '/models/circular_pad.glb?v=2'
const COLOR_MAPS = new Set(['map', 'emissiveMap'])
const DETAIL_MAPS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
  'bumpMap',
]

useGLTF.preload(PAD_URL)

function prepareTextures(mat) {
  DETAIL_MAPS.forEach((key) => {
    const tex = mat[key]
    if (!tex) return
    tex.colorSpace = COLOR_MAPS.has(key) ? THREE.SRGBColorSpace : THREE.NoColorSpace
    tex.anisotropy = Math.max(tex.anisotropy || 1, 8)
    tex.needsUpdate = true
  })
}

function polishMaterials(root) {
  const grey = new THREE.Color('#d8dce2')

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    obj.castShadow = false
    obj.receiveShadow = false
    obj.frustumCulled = true

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach((mat) => {
      if (!mat) return
      prepareTextures(mat)

      if ('color' in mat) {
        mat.color.copy(mat.map ? new THREE.Color('#f6f8fa') : grey)
      }
      if ('normalScale' in mat && mat.normalMap) {
        mat.normalScale = new THREE.Vector2(1.35, 1.35)
      }
      if ('aoMapIntensity' in mat) mat.aoMapIntensity = 0.45
      if ('emissive' in mat) {
        mat.emissive.set('#c4ccd6')
        mat.emissiveIntensity = mat.emissiveMap ? 0.72 : 0.48
      }
      if ('metalness' in mat) mat.metalness = Math.min(mat.metalness ?? 0.4, 0.28)
      if ('roughness' in mat) mat.roughness = Math.max(mat.roughness ?? 0.45, 0.42)
      if ('envMapIntensity' in mat) mat.envMapIntensity = 1

      mat.transparent = false
      mat.opacity = 1
      mat.needsUpdate = true
    })
  })
}

function preparePad(scene, targetDiameter) {
  const clone = scene.clone(true)
  polishMaterials(clone)

  const box = new THREE.Box3().setFromObject(clone)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const scale = targetDiameter / maxDim

  clone.scale.setScalar(scale)
  clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  return clone
}

function PadInstance({ position, rotation, targetDiameter }) {
  const { scene } = useGLTF(PAD_URL)
  const model = useMemo(
    () => preparePad(scene, targetDiameter),
    [scene, targetDiameter],
  )

  return <primitive object={model} position={position} rotation={rotation} />
}

function PadLights({ lite = false }) {
  if (lite) {
    return (
      <>
        <ambientLight intensity={1.2} color="#f2f4f7" />
        <directionalLight position={[2, 3, 4]} intensity={1.1} color="#ffffff" />
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={1.05} color="#f2f4f7" />
      <hemisphereLight args={['#ffffff', '#7d8590', 1]} />
      <Environment preset="studio" environmentIntensity={0.65} />
      <directionalLight position={[2, 3, 4]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-2, -1, 3]} intensity={0.95} color="#e2e6ec" />
      <pointLight position={[0, 0, 2.5]} intensity={1.1} color="#ffffff" />
    </>
  )
}

/** Single pad — top ring or bottom floor, locked in its CSS frame */
function PadScene({ placement, lite = false }) {
  const isTop = placement === 'top'

  return (
    <>
      <PadLights lite={lite} />
      <PadInstance
        position={[0, 0, 0]}
        rotation={isTop ? [0, 0, 0] : [Math.PI, 0, 0]}
        targetDiameter={isTop ? 4.4 : 5}
      />
    </>
  )
}

/** CSS disc — zero WebGL cost on phones; keeps the Ciao ring silhouette */
function StaticPad({ placement }) {
  return (
    <div
      className={`movies-pad-static movies-pad-static--${placement}`}
      aria-hidden
    >
      <span className="movies-pad-static__rim" />
      <span className="movies-pad-static__ring" />
      <span className="movies-pad-static__core" />
      <span className="movies-pad-static__shine" />
    </div>
  )
}

function MoviesPadCanvas({ placement = 'top', className = '', lite = false }) {
  if (lite) {
    return (
      <div
        className={`movies-pad-canvas movies-pad-canvas--${placement} ${className}`.trim()}
        aria-hidden
      >
        <StaticPad placement={placement} />
      </div>
    )
  }

  return (
    <WebGLErrorBoundary fallback={<StaticPad placement={placement} />}>
      <div
        className={`movies-pad-canvas movies-pad-canvas--${placement} ${className}`.trim()}
        aria-hidden
      >
        <Canvas
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          camera={{ position: [0, 0, 3.6], fov: 50, near: 0.1, far: 40 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.toneMappingExposure = 1.35
          }}
        >
          <Suspense fallback={null}>
            <PadScene placement={placement} />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  )
}

export default MoviesPadCanvas
