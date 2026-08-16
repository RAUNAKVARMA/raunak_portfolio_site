import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ensureDracoDecoder, warmCar, warmCars } from './carGltf'
import { applyLiteBrandPolish } from './CarModel'

ensureDracoDecoder()

const CAM = new THREE.Vector3(3.35, 1.05, 4.75)

/** Polished scene clones — avoids re-polish hitch on every car swap. */
const polishCache = new Map()

function getPolishedRoot(url, scene) {
  const hit = polishCache.get(url)
  if (hit && hit.uuid === scene.uuid) return hit.template.clone(true)

  const template = scene.clone(true)
  applyLiteBrandPolish(template, url)
  template.traverse((obj) => {
    if (!obj.isMesh) return
    obj.castShadow = false
    obj.receiveShadow = false
    obj.frustumCulled = false
    if (/ground|floor|shadow|plane|platform|podium|stand|plinth|Base_Geo|Base_Material/i.test(obj.name || '')) {
      obj.visible = false
    }
  })
  polishCache.set(url, { uuid: scene.uuid, template })
  return template.clone(true)
}

/** Per-car showroom look */
const CAR_LOOK = {
  supra: {
    exposure: 1.48,
    ambient: 0.9,
    hemi: 0.7,
    key: 2.9,
    fill: 1.35,
    rim: 1.15,
    spot: 2.0,
    fillColor: '#ffb070',
    rimColor: '#ffe0b8',
    accent: '#e87722',
    env: 0.62,
    accentLight: 0.85,
  },
  stradale: {
    exposure: 1.18,
    ambient: 0.58,
    hemi: 0.42,
    key: 2.2,
    fill: 0.75,
    rim: 0.7,
    spot: 1.35,
    fillColor: '#ff8a78',
    rimColor: '#ffd0c4',
    accent: '#E22718',
    env: 0.28,
    accentLight: 0.45,
  },
  bugatti: {
    exposure: 1.22,
    ambient: 0.55,
    hemi: 0.42,
    key: 2.55,
    fill: 0.85,
    rim: 1.05,
    spot: 1.55,
    fillColor: '#c8b890',
    rimColor: '#e8dcc0',
    accent: '#E8B84A',
    env: 0.28,
    accentLight: 0.35,
  },
  spyder: {
    exposure: 1.5,
    ambient: 0.95,
    hemi: 0.75,
    key: 3.0,
    fill: 1.4,
    rim: 1.2,
    spot: 2.1,
    fillColor: '#e8f0ff',
    rimColor: '#d8ff60',
    accent: '#C8F000',
    env: 0.62,
    accentLight: 0.85,
  },
  aventador: {
    exposure: 1.52,
    ambient: 0.95,
    hemi: 0.78,
    key: 3.05,
    fill: 1.45,
    rim: 1.25,
    spot: 2.15,
    fillColor: '#90b8ff',
    rimColor: '#d0e4ff',
    accent: '#3B82F6',
    env: 0.62,
    accentLight: 0.85,
  },
  m4: {
    exposure: 1.24,
    ambient: 0.58,
    hemi: 0.45,
    key: 2.45,
    fill: 0.9,
    rim: 0.95,
    spot: 1.5,
    fillColor: '#6a8fc8',
    rimColor: '#a8c0e0',
    accent: '#1C69D4',
    env: 0.32,
    accentLight: 0.4,
  },
  valour: {
    exposure: 1.26,
    ambient: 0.6,
    hemi: 0.48,
    key: 2.5,
    fill: 0.95,
    rim: 1.0,
    spot: 1.55,
    fillColor: '#3a9a68',
    rimColor: '#88c8a8',
    accent: '#00A86B',
    env: 0.34,
    accentLight: 0.42,
  },
}

const DEFAULT_LOOK = CAR_LOOK.stradale

function lookForUrl(url = '') {
  if (/supra|toyota/i.test(url)) return CAR_LOOK.supra
  if (/ferrari|sf90|stradale/i.test(url)) return CAR_LOOK.stradale
  if (/bugatti/i.test(url)) return CAR_LOOK.bugatti
  if (/porsche|918|spyder/i.test(url)) return CAR_LOOK.spyder
  if (/lamborghini|aventador/i.test(url)) return CAR_LOOK.aventador
  if (/bmw|m4/i.test(url)) return CAR_LOOK.m4
  if (/aston|valour/i.test(url)) return CAR_LOOK.valour
  return DEFAULT_LOOK
}

function FitCamera() {
  const { camera } = useThree()
  useLayoutEffect(() => {
    camera.position.copy(CAM)
    camera.lookAt(0, 0.45, 0)
  }, [camera])
  return null
}

function Exposure({ value }) {
  const { gl } = useThree()
  useLayoutEffect(() => {
    gl.toneMappingExposure = value
  }, [gl, value])
  return null
}

function EnvIntensity({ value = 0.6 }) {
  const { scene } = useThree()
  useLayoutEffect(() => {
    if ('environmentIntensity' in scene) scene.environmentIntensity = value
  }, [scene, value])
  return null
}

function fitCarGroup(group, rooted, targetSize) {
  group.position.set(0, 0, 0)
  group.rotation.set(0, Math.PI * 0.18, 0)
  group.scale.set(1, 1, 1)
  group.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  group.scale.setScalar(targetSize / maxDim)
  group.updateMatrixWorld(true)

  const bounds = new THREE.Box3().setFromObject(group)
  const center = bounds.getCenter(new THREE.Vector3())
  group.position.x -= center.x
  group.position.z -= center.z
  group.position.y -= bounds.min.y
}

function GarageCar({ url, targetSize = 4.4 }) {
  const group = useRef(null)
  const { scene } = useGLTF(url, true)
  const rooted = useMemo(() => getPolishedRoot(url, scene), [url, scene])

  useLayoutEffect(() => {
    if (!group.current) return
    fitCarGroup(group.current, rooted, targetSize)
  }, [rooted, targetSize])

  return (
    <group ref={group}>
      <primitive object={rooted} />
    </group>
  )
}

function CarScene({ modelUrl, poolUrls, autoRotate, active }) {
  const look = lookForUrl(modelUrl)
  const boosted = /bmw|m4|aston|valour|lamborghini|aventador|porsche|918|spyder|supra|toyota|ferrari/i.test(
    modelUrl || '',
  )

  useEffect(() => {
    if (modelUrl) warmCar(modelUrl)
  }, [modelUrl])

  useEffect(() => {
    if (!poolUrls?.length) return undefined
    warmCars(poolUrls, { concurrency: 3 })
    return undefined
  }, [poolUrls])

  return (
    <>
      <color attach="background" args={['#000000']} />
      <Exposure value={look.exposure} />
      <ambientLight intensity={look.ambient} />
      <hemisphereLight intensity={look.hemi} color="#ffffff" groundColor="#151515" />
      <directionalLight position={[4.8, 7.2, 5.2]} intensity={look.key} color="#ffffff" />
      <directionalLight position={[-5.2, 3.2, -2.2]} intensity={look.fill} color={look.fillColor} />
      <directionalLight position={[0.2, 2.8, -6.2]} intensity={look.rim} color={look.rimColor} />
      <spotLight
        position={[1.4, 7.8, 3]}
        intensity={look.spot}
        angle={0.55}
        penumbra={0.85}
        color="#fff8f0"
      />
      <pointLight
        position={[-2.2, 1.4, 2.4]}
        intensity={look.accentLight ?? 0.85}
        color={look.accent}
        distance={12}
      />
      <pointLight
        position={[2.6, 1.1, -1.8]}
        intensity={(look.accentLight ?? 0.85) * 0.55}
        color={look.fillColor}
        distance={10}
      />

      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <EnvIntensity value={look.env ?? 0.62} />

      {/* Single car — GLBs are pre-warmed so Suspense resolves without a blank frame */}
      <Suspense fallback={null}>
        <GarageCar key={modelUrl} url={modelUrl} targetSize={boosted ? 4.55 : 4.15} />
      </Suspense>

      <FitCamera />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.85}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={Boolean(autoRotate && active)}
        autoRotateSpeed={0.35}
        target={[0, 0.5, 0]}
      />
    </>
  )
}

function CarStageCanvas({
  modelUrl,
  poolUrls,
  active = true,
  autoRotate = false,
  reducedMotion = false,
  mobileLite: _mobileLite,
  playIntro: _playIntro,
  carId: _carId,
  onReady: _onReady,
}) {
  return (
    <Canvas
      className="absolute inset-0 block h-full w-full"
      camera={{ position: CAM.toArray(), fov: 36, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        failIfMajorPerformanceCaveat: false,
      }}
      frameloop={active ? 'always' : 'demand'}
      style={{
        touchAction: 'none',
        width: '100%',
        height: '100%',
        background: '#000',
        pointerEvents: 'auto',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 1)
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.35
        gl.domElement.style.display = 'block'
        gl.domElement.style.width = '100%'
        gl.domElement.style.height = '100%'
      }}
    >
      <CarScene
        modelUrl={modelUrl}
        poolUrls={poolUrls}
        autoRotate={autoRotate && active && !reducedMotion}
        active={active}
      />
    </Canvas>
  )
}

export default CarStageCanvas
