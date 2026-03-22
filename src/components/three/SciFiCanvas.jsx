import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'

function CinematicRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 0.38, 0.022)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y * 0.24 + 0.35, 0.022)
    state.camera.position.z = 9.2 + Math.sin(t * 0.14) * 0.18
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function Spin({ children, speed = 0.35 }) {
  const ref = useRef(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })
  return <group ref={ref}>{children}</group>
}

function CounterSpin({ children, speed = 0.18 }) {
  const ref = useRef(null)
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y -= dt * speed
      ref.current.rotation.z += dt * speed * 0.35
    }
  })
  return <group ref={ref}>{children}</group>
}

function DistortOrb({ position, color, emissive, scale = 1, distortSpeed = 3 }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.52, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.7}
        roughness={0.12}
        metalness={0.88}
        distort={0.38}
        speed={distortSpeed}
      />
    </mesh>
  )
}

/** Foreground cluster — high detail */
function SciFiMeshesNear() {
  return (
    <Spin speed={0.3}>
      <Float speed={2.4} rotationIntensity={0.65} floatIntensity={0.85}>
        <mesh position={[-3.8, 0.9, -2.2]}>
          <torusKnotGeometry args={[0.62, 0.2, 140, 36]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#0891b2"
            emissiveIntensity={1.15}
            metalness={0.35}
            roughness={0.25}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={1.9} rotationIntensity={0.45} floatIntensity={0.55}>
        <mesh position={[3.6, -0.4, -3]}>
          <icosahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#86198f"
            emissiveIntensity={1}
            metalness={0.5}
            roughness={0.2}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={2.1} rotationIntensity={0.55} floatIntensity={0.7}>
        <mesh position={[0.2, 1.5, -4.2]} rotation={[0.45, 0.8, 0.2]}>
          <octahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#b45309"
            emissiveIntensity={0.6}
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
      </Float>

      <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.45}>
        <mesh position={[-2.4, -1.6, -1.5]} rotation={[1.2, 0, 0.6]}>
          <torusGeometry args={[0.95, 0.12, 24, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0369a1"
            emissiveIntensity={0.78}
            metalness={0.4}
            roughness={0.3}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={2.8} rotationIntensity={0.75} floatIntensity={0.95}>
        <mesh position={[2.8, 1.2, -1.2]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#5b21b6"
            emissiveIntensity={0.68}
            metalness={0.55}
            roughness={0.2}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.35}>
        <mesh position={[-1.2, -2.2, -3.8]}>
          <torusGeometry args={[1.15, 0.04, 16, 100]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#9d174d"
            emissiveIntensity={0.88}
            metalness={0.25}
            roughness={0.35}
          />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh position={[4.1, 0.5, -2.8]} rotation={[0.3, 0.9, 0]}>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#047857"
            emissiveIntensity={0.55}
            metalness={0.45}
            roughness={0.28}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={1.7} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh position={[-3.2, -0.8, -2.5]} rotation={[0.5, 0, 0.3]}>
          <tetrahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial
            color="#fb7185"
            emissive="#9f1239"
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.22}
          />
        </mesh>
      </Float>

      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.55}>
          <DistortOrb position={[0.2, -0.6, 0.5]} color="#7c3aed" emissive="#4c1d95" scale={0.95} distortSpeed={3.1} />
        </Float>
        <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.45}>
          <DistortOrb position={[-2.8, 1.4, -0.5]} color="#06b6d4" emissive="#155e75" scale={0.65} distortSpeed={2.6} />
        </Float>
      </Suspense>
    </Spin>
  )
}

/** Deeper field — smaller, counter-rotating “debris” */
function SciFiMeshesDeep() {
  return (
    <CounterSpin speed={0.22}>
      <group position={[0, 0, -4.5]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.55}>
          <mesh position={[-2, 1.5, -1]}>
            <coneGeometry args={[0.45, 0.95, 8]} />
            <meshStandardMaterial
              color="#67e8f9"
              emissive="#0e7490"
              emissiveIntensity={0.5}
              metalness={0.4}
              roughness={0.35}
              wireframe
            />
          </mesh>
        </Float>
        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.45}>
          <mesh position={[2.2, -1, -2]} rotation={[0.4, 0, 0.5]}>
            <cylinderGeometry args={[0.35, 0.35, 1.1, 16]} />
            <meshStandardMaterial
              color="#d8b4fe"
              emissive="#6b21a8"
              emissiveIntensity={0.45}
              metalness={0.55}
              roughness={0.25}
              wireframe
            />
          </mesh>
        </Float>
        <Float speed={2.4} rotationIntensity={0.6} floatIntensity={0.65}>
          <mesh position={[0, -1.8, -3]}>
            <sphereGeometry args={[0.42, 24, 24]} />
            <meshStandardMaterial
              color="#fde68a"
              emissive="#b45309"
              emissiveIntensity={0.4}
              metalness={0.35}
              roughness={0.4}
              wireframe
            />
          </mesh>
        </Float>
        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
          <mesh position={[-3, 0.2, -2.5]} rotation={[0.8, 0.4, 0]}>
            <torusKnotGeometry args={[0.35, 0.1, 64, 16]} />
            <meshStandardMaterial
              color="#f472b6"
              emissive="#be185d"
              emissiveIntensity={0.65}
              metalness={0.3}
              roughness={0.35}
              wireframe
            />
          </mesh>
        </Float>
        <Float speed={2.1} rotationIntensity={0.45} floatIntensity={0.55}>
          <mesh position={[3.4, 1.8, -1.5]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#2dd4bf"
              emissive="#0f766e"
              emissiveIntensity={0.5}
              metalness={0.48}
              roughness={0.3}
              wireframe
            />
          </mesh>
        </Float>
      </group>
    </CounterSpin>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.26} />
      <pointLight position={[10, 8, 8]} intensity={1.45} color="#22d3ee" />
      <pointLight position={[-10, -6, 6]} intensity={1.15} color="#e879f9" />
      <pointLight position={[0, 4, 6]} intensity={0.62} color="#fbbf24" />
      <pointLight position={[0, -8, 2]} intensity={0.45} color="#67e8f9" />
      <pointLight position={[6, 2, -4]} intensity={0.4} color="#f472b6" />
      <directionalLight position={[4, 10, 6]} intensity={0.38} color="#f8fafc" />

      <Stars radius={145} depth={72} count={16000} factor={3.8} saturation={0} fade speed={0.72} />
      <Sparkles count={720} scale={18} size={2.6} speed={0.48} color="#67e8f9" opacity={0.58} />
      <Sparkles count={420} scale={14} size={2.1} speed={0.52} color="#f0abfc" opacity={0.48} />
      <Sparkles count={260} scale={11} size={1.5} speed={0.62} color="#fde68a" opacity={0.4} />
      <Sparkles count={180} scale={22} size={1.1} speed={0.38} color="#e2e8f0" opacity={0.28} />
      <Sparkles count={320} scale={9} size={3.2} speed={0.55} color="#c084fc" opacity={0.35} />

      <Suspense fallback={null}>
        <SciFiMeshesNear />
        <SciFiMeshesDeep />
      </Suspense>

      <CinematicRig />
    </>
  )
}

export default function SciFiCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[3] h-[100svh] w-full mix-blend-screen">
      <Canvas
        camera={{ position: [0, 0.35, 9.2], fov: 48, near: 0.1, far: 140 }}
        dpr={[1, 1.75]}
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
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
