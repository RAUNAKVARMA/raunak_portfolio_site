import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'

const CAM_START = new THREE.Vector3(5.2, 1.9, 3.8)
const CAM_END = new THREE.Vector3(3.35, 1.05, 4.75)

function CameraIntro({ active, reducedMotion, playIntro }) {
  const { camera } = useThree()
  const done = useRef(false)
  const t = useRef(0)

  useEffect(() => {
    if (!active) return
    if (reducedMotion || !playIntro) {
      camera.position.copy(CAM_END)
      camera.lookAt(0, 0.45, 0)
      done.current = true
      return
    }
    camera.position.copy(CAM_START)
    camera.lookAt(0, 0.35, 0)
    done.current = false
    t.current = 0
  }, [active, camera, reducedMotion, playIntro])

  useFrame((_, delta) => {
    if (!active || done.current || reducedMotion || !playIntro) return
    t.current = Math.min(1, t.current + delta * 1.35)
    const e = 1 - Math.pow(1 - t.current, 3)
    camera.position.lerpVectors(CAM_START, CAM_END, e)
    camera.lookAt(0, 0.35 + 0.1 * e, 0)
    if (t.current >= 1) done.current = true
  })

  return null
}

function CarScene({
  modelUrl,
  autoRotate,
  active,
  reducedMotion,
  mobileLite,
  playIntro,
  onReady,
}) {
  const isBugatti = /bugatti/i.test(modelUrl)
  const isFerrari = /ferrari/i.test(modelUrl)
  const isLambo = /lamborghini|aventador/i.test(modelUrl)
  const isSupra = /supra|toyota/i.test(modelUrl)
  const isBmw = /bmw|m4/i.test(modelUrl)
  const isAston = /aston|valour/i.test(modelUrl)
  const isPorsche = /porsche|918|spyder/i.test(modelUrl)
  const boosted =
    isBugatti || isFerrari || isLambo || isSupra || isBmw || isAston || isPorsche

  // Ferrari: iconic Rosso — studio env, red rim silhouette, color-first paint
  // Supra: vivid orange, softer wash so paint doesn't fade
  // Lambo: studio lights + soft blue fill
  // Bugatti: deep Noire — warm gold rim, low env so black stays black
  // BMW: iconic M product shot — low env wash, blue silhouette, hot LEDs
  // Aston: British Racing Green — green rim, warm gold accents
  // Porsche: GT Silver — cool studio, Porsche-red rim
  const ambient = isFerrari
    ? 0.12
    : isSupra
      ? 0.12
      : isLambo
        ? 0.12
        : isBugatti
          ? 0.1
          : isBmw
            ? 0.16
            : isAston
              ? 0.12
              : isPorsche
                ? 0.14
                : boosted
                  ? 0.5
                  : 0.4
  const hemi = isFerrari
    ? 0.14
    : isSupra
      ? 0.14
      : isLambo
        ? 0.14
        : isBugatti
          ? 0.14
          : isBmw
            ? 0.18
            : isAston
              ? 0.14
              : isPorsche
                ? 0.16
                : boosted
                  ? 0.48
                  : 0.38
  const keyLight = isFerrari
    ? 1.75
    : isSupra
      ? 1.7
      : isLambo
        ? 1.7
        : isBugatti
          ? 1.35
          : isBmw
            ? 1.85
            : isAston
              ? 1.9
              : isPorsche
                ? 1.75
                : boosted
                  ? 1.9
                  : 1.65
  const fillLight = isFerrari
    ? 0.48
    : isSupra
      ? 0.42
      : isLambo
        ? 0.45
        : isBugatti
          ? 0.35
          : isBmw
            ? 0.55
            : isAston
              ? 0.5
              : isPorsche
                ? 0.42
                : boosted
                  ? 0.8
                  : 0.55
  const spot = isFerrari
    ? 1.45
    : isSupra
      ? 1.25
      : isLambo
        ? 1.35
        : isBugatti
          ? 1.1
          : isBmw
            ? 1.45
            : isAston
              ? 1.55
              : isPorsche
                ? 1.35
                : boosted
                  ? 1.25
                  : 0.95
  const envIntensity = isFerrari
    ? 0.32
    : isSupra
      ? 0.45
      : isLambo
        ? 0.22
        : isBugatti
          ? 0.22
          : isBmw
            ? 0.55
            : isAston
              ? 0.38
              : isPorsche
                ? 0.75
                : boosted
                  ? 1.15
                  : 0.7
  const envPreset =
    isFerrari || isLambo || isBugatti || isBmw || isAston || isPorsche || isSupra
      ? 'studio'
      : 'city'
  const rimColor = isFerrari
    ? '#ff2222'
    : isLambo
      ? '#3B82F6'
      : isSupra
        ? '#ff6a1a'
        : isBugatti
          ? '#E8B84A'
          : isBmw
            ? '#3B82F6'
            : isAston
              ? '#00A86B'
              : isPorsche
                ? '#C8D0DC'
                : '#c9a227'
  const rimIntensity = isFerrari
    ? 1.35
    : isSupra
      ? 1.05
      : isLambo
        ? 1.2
        : isBugatti
          ? 1.15
          : isBmw
            ? 1.35
            : isAston
              ? 1.4
              : isPorsche
                ? 1.15
                : boosted
                  ? 0.5
                  : 0.2

  return (
    <>
      <hemisphereLight
        intensity={hemi}
        color={
          isFerrari
            ? '#ffd8d0'
            : isLambo
              ? '#b8d0ff'
              : isBugatti
                ? '#ffe8c0'
                : isBmw
                  ? '#c8d8f8'
                  : isAston
                    ? '#c8e0d0'
                    : isPorsche
                      ? '#e8e8f0'
                      : '#ffffff'
        }
        groundColor={
          isFerrari
            ? '#060303'
            : isLambo
              ? '#06060c'
              : isBugatti
                ? '#050504'
                : isBmw
                  ? '#040508'
                  : isAston
                    ? '#030605'
                    : isPorsche
                      ? '#050506'
                      : '#050505'
        }
      />
      <ambientLight
        intensity={ambient}
        color={
          isFerrari
            ? '#e8a090'
            : isLambo
              ? '#8eb0ff'
              : isBugatti
                ? '#d4c4a0'
                : isBmw
                  ? '#a8b8d8'
                  : isAston
                    ? '#90b8a0'
                    : isPorsche
                      ? '#c8c8d4'
                      : '#ffffff'
        }
      />
      <directionalLight
        position={[4.5, 7, 5]}
        intensity={keyLight}
        color={
          isFerrari
            ? '#fff8f5'
            : isSupra
              ? '#fff4ec'
              : isBugatti
                ? '#fff6ea'
                : isBmw
                  ? '#f2f6ff'
                  : isAston
                    ? '#f2fff6'
                    : isPorsche
                      ? '#f5f5fa'
                      : '#ffffff'
        }
      />
      <directionalLight
        position={[-6, 3, -1]}
        intensity={fillLight}
        color={
          isFerrari
            ? '#d06050'
            : isSupra
              ? '#ffd8b8'
              : isLambo
                ? '#4d7fff'
                : isBugatti
                  ? '#b8924a'
                  : isBmw
                    ? '#3d6ec8'
                    : isAston
                      ? '#2a8f55'
                      : isPorsche
                        ? '#9aa3b0'
                        : '#f5e6b8'
        }
      />
      <directionalLight position={[0, 2.5, -6]} intensity={rimIntensity} color={rimColor} />
      {isFerrari && (
        <>
          {/* Rosso silhouette — product-shot edges + underglow */}
          <directionalLight position={[5.5, 1.7, -4]} intensity={1.25} color="#ff2222" />
          <directionalLight position={[-5, 2.1, -3.5]} intensity={0.95} color="#e01820" />
          <directionalLight position={[3.5, 1.5, -5]} intensity={0.55} color="#ffd100" />
          <directionalLight position={[0, 5, 4.5]} intensity={0.6} color="#fff0ea" />
          <pointLight position={[0, 0.14, 0]} intensity={2.1} distance={4.5} color="#ff2a2a" />
          <pointLight position={[0.9, 1.5, 2.1]} intensity={1.55} distance={6.5} color="#ff5533" />
          <pointLight position={[-0.7, 1.2, -2.1]} intensity={0.95} distance={5.5} color="#ff1a1a" />
          <pointLight position={[0, 1.15, -2.2]} intensity={0.85} distance={5} color="#ff2244" />
          <spotLight
            position={[0, 8, -1.2]}
            intensity={1.7}
            angle={0.28}
            penumbra={0.9}
            color="#ffe8e0"
          />
        </>
      )}
      {isSupra && (
        <>
          {/* F&F orange silhouette + neon green tribal accents */}
          <directionalLight position={[5.5, 1.7, -4]} intensity={1.15} color="#ff6a1a" />
          <directionalLight position={[-5, 2.1, -3.5]} intensity={0.75} color="#e87722" />
          <directionalLight position={[3.5, 1.5, -5]} intensity={0.55} color="#b8ff2a" />
          <directionalLight position={[0, 5, 4.5]} intensity={0.55} color="#fff4ec" />
          <pointLight position={[0, 0.14, 0]} intensity={2.2} distance={4.5} color="#ff6a1a" />
          <pointLight position={[0.9, 1.35, 2]} intensity={1.4} distance={6.5} color="#ff9a40" />
          <pointLight position={[-0.7, 1.15, -2]} intensity={0.85} distance={5.5} color="#c8ff33" />
          <pointLight position={[0, 1.1, -2.2]} intensity={0.8} distance={5} color="#ff2244" />
          <spotLight
            position={[0, 8, -1.2]}
            intensity={1.55}
            angle={0.28}
            penumbra={0.9}
            color="#fff0e4"
          />
        </>
      )}
      {isLambo && (
        <>
          {/* Blu silhouette + Lambo Y-gold accents */}
          <directionalLight position={[5.5, 1.7, -4]} intensity={1.15} color="#3B82F6" />
          <directionalLight position={[-5, 2.1, -3.5]} intensity={0.8} color="#1D4ED8" />
          <directionalLight position={[3.5, 1.5, -5]} intensity={0.7} color="#FFD100" />
          <directionalLight position={[0, 5, 4.5]} intensity={0.55} color="#e8f0ff" />
          <pointLight position={[0, 0.14, 0]} intensity={2.0} distance={4.5} color="#2563EB" />
          <pointLight position={[0.9, 1.4, 2.1]} intensity={1.4} distance={6.5} color="#60A5FA" />
          <pointLight position={[-0.7, 1.15, -2]} intensity={0.95} distance={5.5} color="#FFD100" />
          <pointLight position={[0, 1.15, -2.2]} intensity={0.85} distance={5} color="#ff2244" />
          <spotLight
            position={[0, 8, -1.2]}
            intensity={1.55}
            angle={0.28}
            penumbra={0.92}
            color="#f0f6ff"
          />
        </>
      )}
      {isBugatti && (
        <>
          {/* Noire gold silhouette — soft exterior only, no cabin neon */}
          <directionalLight position={[5, 1.8, -4]} intensity={0.95} color="#E8B84A" />
          <directionalLight position={[-4.5, 2.2, -3]} intensity={0.8} color="#CA8A04" />
          <directionalLight position={[0, 4, 5]} intensity={0.5} color="#fff0d0" />
          <pointLight position={[0.8, 1.4, 2.2]} intensity={1.25} distance={6} color="#ffd78a" />
          <pointLight position={[-0.6, 1.1, -2]} intensity={0.75} distance={5} color="#E8B84A" />
          <spotLight
            position={[0, 7, -2]}
            intensity={1.35}
            angle={0.32}
            penumbra={0.9}
            color="#ffe6b0"
          />
        </>
      )}
      {isBmw && (
        <>
          {/* M-stripe silhouette + NFS underglow */}
          <directionalLight position={[5.5, 1.8, -4]} intensity={1.25} color="#1C69D4" />
          <directionalLight position={[-5.2, 2.2, -3.2]} intensity={0.85} color="#0653B6" />
          <directionalLight position={[4, 1.5, -5.5]} intensity={0.7} color="#E51A22" />
          <directionalLight position={[0, 5, 4.5]} intensity={0.65} color="#ffffff" />
          <directionalLight position={[-3, 3, 4]} intensity={0.45} color="#C4A35A" />
          <pointLight position={[0, 0.12, 0]} intensity={2.4} distance={5} color="#1C69D4" />
          <pointLight position={[0, 0.18, 1.5]} intensity={1.4} distance={4} color="#4d8fff" />
          <pointLight position={[0, 0.18, -1.6]} intensity={1.1} distance={4} color="#ff2244" />
          <pointLight position={[1.1, 1.35, 2]} intensity={1.5} distance={6.5} color="#6aa8ff" />
          <pointLight position={[-0.9, 1.2, -2]} intensity={1.05} distance={5.5} color="#ff3a3a" />
          <spotLight
            position={[0, 8, -1.2]}
            intensity={1.7}
            angle={0.28}
            penumbra={0.9}
            color="#f4f8ff"
          />
        </>
      )}
      {isAston && (
        <>
          {/* BRG silhouette + champagne gold — punchier so green doesn't go muddy */}
          <directionalLight position={[5.5, 1.7, -4]} intensity={1.35} color="#1ad67a" />
          <directionalLight position={[-5.2, 2.1, -3.5]} intensity={1.0} color="#006F3C" />
          <directionalLight position={[4, 1.5, -5]} intensity={0.75} color="#D4B896" />
          <directionalLight position={[0, 5, 4.5]} intensity={0.7} color="#f0fff4" />
          <pointLight position={[0, 0.14, 0]} intensity={2.2} distance={4.5} color="#00A86B" />
          <pointLight position={[0.9, 1.4, 2.1]} intensity={1.7} distance={6.5} color="#3dff9a" />
          <pointLight position={[-0.7, 1.15, -2]} intensity={1.1} distance={5.5} color="#C5A572" />
          <pointLight position={[0, 1.2, -2.2]} intensity={0.9} distance={5} color="#ff3333" />
          <spotLight
            position={[0, 8, -1.2]}
            intensity={1.85}
            angle={0.28}
            penumbra={0.9}
            color="#f6fff9"
          />
        </>
      )}
      {isPorsche && (
        <>
          {/* Cool silver studio — acid-yellow accents, no red wash */}
          <directionalLight position={[5.5, 1.8, -4]} intensity={0.85} color="#C8D0DC" />
          <directionalLight position={[-5, 2.2, -3.2]} intensity={0.65} color="#A8B4C4" />
          <directionalLight position={[0, 5, 4.5]} intensity={0.7} color="#ffffff" />
          <directionalLight position={[3.5, 1.6, -5]} intensity={0.4} color="#D4E157" />
          <pointLight position={[0, 0.14, 0]} intensity={0.9} distance={4} color="#B8C0CC" />
          <pointLight position={[0.9, 1.4, 2.1]} intensity={1.35} distance={6.5} color="#eef0f5" />
          <pointLight position={[-0.7, 1.15, -2]} intensity={0.75} distance={5.5} color="#C8F000" />
          <spotLight
            position={[0, 8, -1.2]}
            intensity={1.6}
            angle={0.28}
            penumbra={0.9}
            color="#f8f9fc"
          />
        </>
      )}
      <spotLight
        position={[1.5, 8, 3]}
        intensity={spot}
        angle={
          isFerrari || isLambo || isBugatti || isBmw || isAston || isPorsche ? 0.48 : 0.42
        }
        penumbra={
          isFerrari || isSupra || isLambo || isBugatti || isBmw || isAston || isPorsche
            ? 0.85
            : 0.7
        }
        color={
          isFerrari
            ? '#ffe8e0'
            : isSupra
              ? '#ffc090'
              : isLambo
                ? '#ffffff'
                : isBugatti
                  ? '#fff0d8'
                  : isBmw
                    ? '#eef4ff'
                    : isAston
                      ? '#e8fff0'
                      : isPorsche
                        ? '#f4f4f8'
                        : '#ffe9a8'
        }
      />
      {!mobileLite && active && (
        <Environment
          preset={envPreset}
          environmentIntensity={envIntensity}
          resolution={128}
        />
      )}
      <CarModel
        url={modelUrl}
        targetSize={isBmw || isAston || isLambo || isPorsche || isSupra || isFerrari ? 4.55 : 4.15}
        playReveal={playIntro && active}
        reducedMotion={reducedMotion}
        active={active}
        onReady={onReady}
      />
      {!mobileLite && (
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={
            isFerrari || isBugatti || isBmw || isAston || isLambo || isPorsche || isSupra
              ? 0.96
              : 0.85
          }
          scale={16}
          blur={
            isFerrari
              ? 1.35
              : isBugatti || isBmw || isAston || isLambo || isPorsche || isSupra
                ? 1.4
                : 2
          }
          far={10}
          color="#000000"
          frames={1}
        />
      )}
      <CameraIntro active={active} reducedMotion={reducedMotion} playIntro={playIntro} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={!mobileLite}
        enableDamping={!mobileLite}
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3.15}
        maxPolarAngle={Math.PI / 2.02}
        autoRotate={autoRotate}
        autoRotateSpeed={
          isFerrari
            ? 0.18
            : isBugatti
              ? 0.22
              : isBmw
                ? 0.2
                : isAston
                  ? 0.22
                  : isPorsche
                    ? 0.24
                    : isLambo
                      ? 0.28
                      : 0.45
        }
        target={[0, 0.5, 0]}
      />
    </>
  )
}

function CarStageCanvas({
  modelUrl,
  active = true,
  mobileLite = false,
  autoRotate = true,
  reducedMotion = false,
  playIntro = true,
  onReady,
}) {
  const isFerrari = /ferrari/i.test(modelUrl)
  const isSupra = /supra|toyota/i.test(modelUrl)
  const isLambo = /lamborghini|aventador/i.test(modelUrl)
  const isBugatti = /bugatti/i.test(modelUrl)
  const isBmw = /bmw|m4/i.test(modelUrl)
  const isAston = /aston|valour/i.test(modelUrl)
  const isPorsche = /porsche|918|spyder/i.test(modelUrl)
  const dpr = mobileLite
    ? [1, 1.15]
    : isLambo || isBugatti || isFerrari || isBmw || isAston || isPorsche
      ? [1, 1.85]
      : [1, 1.65]

  return (
    <Canvas
      className="absolute inset-0 block h-full w-full"
      camera={{ position: CAM_END.toArray(), fov: mobileLite ? 38 : 34, near: 0.1, far: 80 }}
      dpr={dpr}
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
        touchAction: mobileLite ? 'pan-y' : 'none',
        width: '100%',
        height: '100%',
        background: 'transparent',
        pointerEvents: mobileLite ? 'none' : 'auto',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = isFerrari
          ? 1.12
          : isSupra
            ? 1.02
            : isLambo
              ? 1.1
              : isBugatti
                ? 0.92
                : isBmw
                  ? 1.12
                  : isAston
                    ? 1.16
                    : isPorsche
                      ? 1.1
                      : 1.18
        gl.domElement.style.display = 'block'
        gl.domElement.style.width = '100%'
        gl.domElement.style.height = '100%'
      }}
    >
      <Suspense fallback={null}>
        <CarScene
          modelUrl={modelUrl}
          autoRotate={autoRotate && active && !reducedMotion}
          active={active}
          reducedMotion={reducedMotion}
          mobileLite={mobileLite}
          playIntro={playIntro}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  )
}

export default CarStageCanvas
