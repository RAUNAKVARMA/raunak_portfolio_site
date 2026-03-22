import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'

/** Slow drift so the void feels alive */
function CinematicRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 0.35, 0.02)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y * 0.22 + 0.35, 0.02)
    state.camera.position.z = 9.2 + Math.sin(t * 0.12) * 0.15
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

function DistortOrb() {
  return (
    <mesh position={[0.2, -0.6, 0.5]} scale={0.95}>
      <sphereGeometry args={[0.55, 64, 64]} />
      <MeshDistortMaterial
        color="#7c3aed"
        emissive="#4c1d95"
        emissiveIntensity={0.65}
        roughness={0.15}
        metalness={0.85}
        distort={0.42}
        speed={3.2}
      />
    </mesh>
  )
}

function SciFiMeshes() {
  return (
    <group>
      <Spin speed={0.28}>
        <Float speed={2.4} rotationIntensity={0.65} floatIntensity={0.85}>
          <mesh position={[-3.8, 0.9, -2.2]}>
            <torusKnotGeometry args={[0.62, 0.2, 140, 36]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#0891b2"
              emissiveIntensity={1.1}
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
              emissiveIntensity={0.95}
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
              emissiveIntensity={0.55}
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
              emissiveIntensity={0.75}
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
              emissiveIntensity={0.65}
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
              emissiveIntensity={0.85}
              metalness={0.25}
              roughness={0.35}
            />
          </mesh>
        </Float>
      </Spin>

      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.55}>
          <DistortOrb />
        </Float>
      </Suspense>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[10, 8, 8]} intensity={1.35} color="#22d3ee" />
      <pointLight position={[-10, -6, 6]} intensity={1.05} color="#e879f9" />
      <pointLight position={[0, 4, 6]} intensity={0.55} color="#fbbf24" />
      <directionalLight position={[4, 10, 6]} intensity={0.35} color="#f8fafc" />

      <Stars radius={120} depth={60} count={9000} factor={3.5} saturation={0} fade speed={0.65} />
      <Sparkles count={520} scale={16} size={2.4} speed={0.45} color="#67e8f9" opacity={0.55} />
      <Sparkles count={280} scale={12} size={1.9} speed={0.55} color="#f0abfc" opacity={0.42} />
      <Sparkles count={160} scale={8} size={1.2} speed={0.65} color="#fde68a" opacity={0.35} />

      <Suspense fallback={null}>
        <SciFiMeshes />
      </Suspense>

      <CinematicRig />
    </>
  )
}

/**
 * Full-screen WebGL layer — transparent over SpaceBackdrop.
 */
export default function SciFiCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[3] h-[100svh] w-full mix-blend-screen">
      <Canvas
        camera={{ position: [0, 0.35, 9.2], fov: 46, near: 0.1, far: 120 }}
        dpr={[1, 1.65]}
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
