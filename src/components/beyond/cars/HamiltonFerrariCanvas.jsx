import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { ensureDracoDecoder, preloadCar } from './carGltf'

const MODEL_URL = '/models/cars/ferrari-f1-2026-concept.glb?v=4'
const CAM_DESKTOP = [4.1, 1.35, 5.4]
const CAM_MOBILE = [3.55, 1.28, 4.55]

ensureDracoDecoder()

const COLOR_MAPS = new Set(['map', 'emissiveMap', 'specularMap'])
const DATA_MAPS = [
  'map',
  'emissiveMap',
  'normalMap',
  'bumpMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'alphaMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'specularMap',
]

function fixTextureSlots(mat, mobileLite) {
  const aniso = mobileLite ? 4 : 16
  DATA_MAPS.forEach((key) => {
    const tex = mat[key]
    if (!tex) return
    tex.colorSpace = COLOR_MAPS.has(key) ? THREE.SRGBColorSpace : THREE.NoColorSpace
    tex.anisotropy = Math.min(Math.max(tex.anisotropy || 1, aniso), aniso)
    tex.needsUpdate = true
  })
}

/**
 * Preserve every authored color + texture. Polish by material name only.
 */
function polishF1Materials(root, mobileLite = false) {
  const seen = new Set()

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return

    const meshName = obj.name || ''
    if (/Base_Geo|Base_Material|platform|podium|plinth|ground|shadow/i.test(meshName)) {
      obj.visible = false
      return
    }

    obj.castShadow = false
    obj.receiveShadow = false
    obj.frustumCulled = true

    const list = Array.isArray(obj.material) ? obj.material : [obj.material]
    list.forEach((mat) => {
      if (!mat || seen.has(mat.uuid)) return
      seen.add(mat.uuid)

      const name = mat.name || ''
      fixTextureSlots(mat, mobileLite)

      if (mat.map) {
        mat.color.setRGB(1, 1, 1)
      }

      if ('envMapIntensity' in mat) {
        mat.envMapIntensity = mat.map ? (mobileLite ? 1.28 : 1.15) : 1.0
      }

      if (/^base$|^wings$/i.test(name)) {
        if ('clearcoat' in mat) {
          mat.clearcoat = mobileLite ? 0.72 : 1
          mat.clearcoatRoughness = mobileLite ? 0.1 : 0.04
        }
        if ('specularIntensity' in mat) mat.specularIntensity = 1.05
        if (!mat.metalnessMap) mat.metalness = Math.min(mat.metalness ?? 0.35, 0.4)
        if (!mat.roughnessMap) mat.roughness = Math.min(Math.max(mat.roughness ?? 0.25, 0.14), 0.32)
        mat.envMapIntensity = mobileLite ? 1.05 : 1.25
        mat.side = mobileLite ? THREE.FrontSide : THREE.DoubleSide
      }

      if (/^Tyre$/i.test(name)) {
        if (!mat.map) mat.color.setRGB(0.04, 0.04, 0.045)
        mat.metalness = 0.05
        mat.roughness = 0.88
        mat.envMapIntensity = 0.2
        mat.side = THREE.FrontSide
        if (mat.emissive) {
          mat.emissive.setRGB(0, 0, 0)
          mat.emissiveIntensity = 0
        }
      }

      if (/^carbon$/i.test(name)) {
        mat.metalness = Math.max(mat.metalness ?? 0.4, 0.55)
        mat.roughness = Math.min(mat.roughness ?? 0.45, 0.42)
        mat.envMapIntensity = mobileLite ? 0.85 : 1.05
        if ('clearcoat' in mat && !mobileLite) {
          mat.clearcoat = 0.35
          mat.clearcoatRoughness = 0.25
        }
        mat.side = THREE.FrontSide
      }

      if (/^chrome$/i.test(name)) {
        if (!mat.map) {
          const c = mat.color
          if (c.r + c.g + c.b < 0.3) c.setRGB(0.92, 0.93, 0.95)
        }
        mat.metalness = 1
        mat.roughness = 0.08
        mat.envMapIntensity = mobileLite ? 1.2 : 1.75
        mat.side = THREE.FrontSide
      }

      if (/^secondary$/i.test(name)) {
        mat.metalness = Math.min(mat.metalness ?? 0.3, 0.45)
        mat.roughness = Math.max(mat.roughness ?? 0.4, 0.28)
        mat.envMapIntensity = 0.9
        mat.side = THREE.FrontSide
      }

      if (/^lambert1$|^material$/i.test(name)) {
        mat.metalness = mat.metalness ?? 0.25
        mat.roughness = mat.roughness ?? 0.45
        mat.envMapIntensity = 0.95
        mat.side = THREE.FrontSide
        if (mat.emissive && (mat.emissiveIntensity ?? 1) > 3) {
          mat.emissiveIntensity = 1.4
        }
      }

      mat.needsUpdate = true
    })
  })
}

function EpicFloorGlow({ mobileLite }) {
  if (mobileLite) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={-1}>
        <circleGeometry args={[2.8, 32]} />
        <meshBasicMaterial
          color="#e10600"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    )
  }

  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[3.4, 64]} />
        <meshBasicMaterial
          color="#e10600"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} renderOrder={-1}>
        <ringGeometry args={[1.1, 2.85, 64]} />
        <meshBasicMaterial
          color="#ff2a1a"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function FerrariF1Model({ reducedMotion = false, autoRotate = true, mobileLite = false }) {
  const { scene } = useGLTF(MODEL_URL, true)
  const rootRef = useRef(null)
  const baseY = useRef(0)
  const t = useRef(0)

  const model = useMemo(() => {
    const root = scene.clone(true)
    polishF1Materials(root, mobileLite)
    return root
  }, [scene, mobileLite])

  useLayoutEffect(() => {
    if (!rootRef.current) return
    rootRef.current.position.set(0, 0, 0)
    rootRef.current.scale.set(1, 1, 1)
    rootRef.current.rotation.set(0, Math.PI * 0.18, 0)

    const box = new THREE.Box3().setFromObject(rootRef.current)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = (mobileLite ? 5.05 : 5.15) / maxDim
    rootRef.current.scale.setScalar(scale)

    const fitted = new THREE.Box3().setFromObject(rootRef.current)
    const center = fitted.getCenter(new THREE.Vector3())
    rootRef.current.position.set(-center.x, -fitted.min.y, -center.z)
    baseY.current = rootRef.current.position.y
  }, [model, mobileLite])

  useFrame((_, delta) => {
    if (!rootRef.current || reducedMotion) return
    t.current += delta
    // Skip float bob on mobile — saves per-frame writes
    if (!mobileLite) {
      rootRef.current.position.y = baseY.current + Math.sin(t.current * 0.85) * 0.035
    }
    if (!autoRotate) {
      rootRef.current.rotation.y += delta * (mobileLite ? 0.1 : 0.14)
    }
  })

  return (
    <group ref={rootRef}>
      <primitive object={model} />
    </group>
  )
}

function HamiltonFerrariScene({ reducedMotion, autoRotate, mobileLite, allowOrbit }) {
  return (
    <>
      <hemisphereLight intensity={mobileLite ? 0.36 : 0.22} color="#f2e8e4" groundColor="#080404" />
      <ambientLight intensity={mobileLite ? 0.32 : 0.16} color="#e8d8d2" />

      <directionalLight position={[5.2, 8.5, 4.2]} intensity={mobileLite ? 2.05 : 2.1} color="#fffaf6" />
      <directionalLight position={[-4.2, 3.8, 3]} intensity={mobileLite ? 0.75 : 0.7} color="#ffe8dc" />
      <directionalLight position={[6.5, 2.2, -5]} intensity={mobileLite ? 1.15 : 1.15} color="#ff4a3a" />

      {!mobileLite && (
        <>
          <directionalLight position={[-6.2, 2.6, -4.2]} intensity={0.9} color="#e83028" />
          <directionalLight position={[0, 7.5, 2]} intensity={0.75} color="#fff5ee" />
          <directionalLight position={[0, 2.5, -6]} intensity={0.65} color="#ff6050" />
          <pointLight position={[0, 0.08, 0]} intensity={1.6} distance={5.5} color="#ff2a1a" />
          <pointLight position={[0, 1.1, 2.4]} intensity={1.5} distance={7} color="#ff6a4a" />
          <spotLight
            position={[0.4, 9.5, 4]}
            intensity={2.1}
            angle={0.42}
            penumbra={0.72}
            color="#fff4ec"
            castShadow={false}
          />
        </>
      )}

      {mobileLite && (
        <pointLight position={[0, 0.9, 2]} intensity={1.1} distance={6} color="#ff5a40" />
      )}

      <EpicFloorGlow mobileLite={mobileLite} />

      <Suspense fallback={null}>
        <FerrariF1Model
          reducedMotion={reducedMotion}
          autoRotate={autoRotate}
          mobileLite={mobileLite}
        />
        <Environment
          preset={mobileLite ? 'apartment' : 'city'}
          environmentIntensity={mobileLite ? 0.72 : 0.48}
          resolution={64}
        />
      </Suspense>

      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={mobileLite ? 0.85 : 1}
        scale={mobileLite ? 14 : 18}
        blur={mobileLite ? 1.6 : 1.15}
        far={mobileLite ? 8 : 12}
        color="#1a0000"
        frames={1}
        resolution={256}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={allowOrbit}
        enableDamping
        dampingFactor={mobileLite ? 0.12 : 0.075}
        rotateSpeed={mobileLite ? 0.7 : 1}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate && !reducedMotion}
        autoRotateSpeed={mobileLite ? 0.35 : 0.28}
        target={[0, mobileLite ? 0.48 : 0.55, 0]}
      />
    </>
  )
}

function HamiltonFerrariCanvas({
  reducedMotion = false,
  active = true,
  autoRotate = true,
  mobileLite = false,
  allowOrbit = true,
}) {
  const cam = mobileLite ? CAM_MOBILE : CAM_DESKTOP

  return (
    <WebGLErrorBoundary
      resetKey={`${MODEL_URL}-${mobileLite ? 'm' : 'd'}`}
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-black">
          <p className="font-studio text-[11px] uppercase tracking-[0.2em] text-white/40">
            3D model unavailable
          </p>
        </div>
      }
    >
      <Canvas
        className="absolute inset-0 block h-full w-full"
        camera={{ position: cam, fov: mobileLite ? 36 : 30, near: 0.1, far: 80 }}
        dpr={mobileLite ? [1, 1.15] : [1, 1.5]}
        gl={{
          alpha: true,
          antialias: !mobileLite,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop={active ? 'always' : 'never'}
        style={{
          touchAction: allowOrbit ? 'none' : 'pan-y',
          width: '100%',
          height: '100%',
          background: 'transparent',
          pointerEvents: allowOrbit ? 'auto' : 'none',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = mobileLite ? 1.32 : 1.18
          gl.domElement.style.display = 'block'
          gl.domElement.style.width = '100%'
          gl.domElement.style.height = '100%'
          if (allowOrbit) gl.domElement.style.touchAction = 'none'
        }}
      >
        <HamiltonFerrariScene
          reducedMotion={reducedMotion}
          autoRotate={autoRotate && active && !reducedMotion}
          mobileLite={mobileLite}
          allowOrbit={allowOrbit && !reducedMotion}
        />
      </Canvas>
    </WebGLErrorBoundary>
  )
}

export default HamiltonFerrariCanvas
