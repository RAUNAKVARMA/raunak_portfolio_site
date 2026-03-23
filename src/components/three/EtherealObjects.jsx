import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

/** Slow orbit: child sits at local +X, group Y spins */
function OrbitRing({ radius, speed, tilt = 0, children }) {
  const ref = useRef(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += speed * dt
  })
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <group position={[radius, 0, 0]}>{children}</group>
      </group>
    </group>
  )
}

/** Additive neon ring — reads like energy conduit */
function EnergyTorus({ radius, tube, color, speed, tilt = 0, reverse }) {
  const meshRef = useRef(null)
  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.z += (reverse ? -1 : 1) * speed * dt
  })
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, tube, 48, 96]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** Breathing dimensional core */
function PulsingCore() {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const s = 0.52 + Math.sin(t * 2.1) * 0.12
    ref.current.scale.setScalar(s)
    const mat = ref.current.material
    if (mat && mat.emissiveIntensity !== undefined) {
      mat.emissiveIntensity = 2.8 + Math.sin(t * 3) * 0.6
    }
  })
  return (
    <mesh ref={ref} position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.26, 40, 40]} />
      <meshStandardMaterial
        color="#fae8ff"
        emissive="#f472b6"
        emissiveIntensity={2.8}
        metalness={0.35}
        roughness={0.08}
      />
    </mesh>
  )
}

/**
 * Max-intensity sci-fi field — emissive meshes + additive energy + HDR reflections (Environment in parent).
 */
export default function EtherealObjects() {
  return (
    <group>
      {/* Rim & fill — push bloom */}
      <hemisphereLight intensity={0.35} color="#67e8f9" groundColor="#4c1d95" />
      <pointLight position={[7, 5, 7]} intensity={2.2} color="#22d3ee" distance={55} decay={2} />
      <pointLight position={[-6, -4, 5]} intensity={1.9} color="#e879f9" distance={50} decay={2} />
      <pointLight position={[0, 7, -5]} intensity={1.5} color="#a78bfa" distance={45} decay={2} />
      <pointLight position={[-4, 3, -7]} intensity={1.4} color="#2dd4bf" distance={42} decay={2} />
      <pointLight position={[4, -5, 3]} intensity={1.2} color="#fbbf24" distance={38} decay={2} />

      {/* Additive orbital energy — “another dimension” ribbons */}
      <EnergyTorus radius={2.1} tube={0.03} color="#22d3ee" speed={0.22} tilt={0.4} />
      <EnergyTorus radius={2.85} tube={0.022} color="#e879f9" speed={-0.18} tilt={-0.35} reverse />
      <EnergyTorus radius={3.6} tube={0.018} color="#67e8f9" speed={0.12} tilt={0.85} />

      {/* Central flux */}
      <Float speed={3} rotationIntensity={0.6} floatIntensity={0.85}>
        <PulsingCore />
      </Float>

      {/* Cyan torus knot */}
      <OrbitRing radius={3.2} speed={0.1} tilt={0.35}>
        <Float speed={2.4} rotationIntensity={0.9} floatIntensity={0.85}>
          <mesh>
            <torusKnotGeometry args={[0.46, 0.12, 160, 32]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#22d3ee"
              emissiveIntensity={2.4}
              metalness={0.95}
              roughness={0.08}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Magenta icosahedron */}
      <OrbitRing radius={2.45} speed={-0.12} tilt={-0.28}>
        <Float speed={2} rotationIntensity={1.2} floatIntensity={0.65}>
          <mesh>
            <icosahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial
              color="#c026d3"
              emissive="#f0abfc"
              emissiveIntensity={2.6}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Teal distorted core */}
      <OrbitRing radius={1.65} speed={0.16} tilt={0.5}>
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.55}>
          <mesh>
            <sphereGeometry args={[0.42, 48, 48]} />
            <MeshDistortMaterial
              color="#14b8a6"
              emissive="#5eead4"
              emissiveIntensity={2.8}
              distort={0.5}
              speed={4.5}
              roughness={0.12}
              metalness={0.82}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Violet torus */}
      <OrbitRing radius={3.85} speed={0.07} tilt={1.12}>
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.45}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.58, 0.065, 48, 96]} />
            <meshStandardMaterial
              color="#7c3aed"
              emissive="#d8b4fe"
              emissiveIntensity={2.2}
              metalness={0.97}
              roughness={0.06}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Amber dodecahedron */}
      <OrbitRing radius={2.95} speed={0.052} tilt={-0.42}>
        <Float speed={1.7} rotationIntensity={1} floatIntensity={0.6}>
          <mesh>
            <dodecahedronGeometry args={[0.44, 0]} />
            <meshStandardMaterial
              color="#d97706"
              emissive="#fde68a"
              emissiveIntensity={2.1}
              metalness={0.85}
              roughness={0.12}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Capsule probe */}
      <OrbitRing radius={3.45} speed={-0.075} tilt={0.62}>
        <Float speed={2.1} rotationIntensity={0.8} floatIntensity={0.5}>
          <mesh rotation={[0.4, 0.7, 0.2]}>
            <capsuleGeometry args={[0.14, 0.55, 12, 24]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#7dd3fc"
              emissiveIntensity={2.3}
              metalness={0.88}
              roughness={0.1}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Wireframe lattice */}
      <OrbitRing radius={4.5} speed={0.038} tilt={0.22}>
        <mesh>
          <octahedronGeometry args={[0.32, 0]} />
          <meshBasicMaterial color="#a5f3fc" wireframe transparent opacity={0.45} />
        </mesh>
      </OrbitRing>

      {/* Bonus: second smaller knot — hot accent */}
      <OrbitRing radius={2.2} speed={0.14} tilt={0.15}>
        <Float speed={2.6} rotationIntensity={1.3} floatIntensity={0.7}>
          <mesh>
            <torusKnotGeometry args={[0.28, 0.09, 96, 24]} />
            <meshStandardMaterial
              color="#ec4899"
              emissive="#fda4af"
              emissiveIntensity={2.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </Float>
      </OrbitRing>
    </group>
  )
}
