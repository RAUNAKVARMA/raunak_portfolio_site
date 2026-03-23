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

/**
 * Multicolor emissive 3D “other dimension” artefacts — torus knots, icosahedra, distorted spheres.
 * Bloom + emissive reads as glowing volumetric light.
 */
export default function EtherealObjects() {
  return (
    <group>
      {/* Key lights — colored rim on meshes */}
      <pointLight position={[6, 4, 6]} intensity={1.1} color="#22d3ee" distance={40} decay={2} />
      <pointLight position={[-5, -3, 4]} intensity={0.85} color="#e879f9" distance={35} decay={2} />
      <pointLight position={[0, 6, -4]} intensity={0.65} color="#a78bfa" distance={30} decay={2} />
      <pointLight position={[-3, 2, -6]} intensity={0.55} color="#2dd4bf" distance={28} decay={2} />

      {/* Cyan torus knot — wide orbit */}
      <OrbitRing radius={3.2} speed={0.09} tilt={0.35}>
        <Float speed={2.2} rotationIntensity={0.85} floatIntensity={0.7}>
          <mesh castShadow>
            <torusKnotGeometry args={[0.42, 0.11, 160, 32]} />
            <meshStandardMaterial
              color="#0891b2"
              emissive="#22d3ee"
              emissiveIntensity={1.6}
              metalness={0.92}
              roughness={0.12}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Magenta icosahedron — counter orbit */}
      <OrbitRing radius={2.45} speed={-0.11} tilt={-0.28}>
        <Float speed={1.8} rotationIntensity={1.1} floatIntensity={0.55}>
          <mesh>
            <icosahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial
              color="#a21caf"
              emissive="#e879f9"
              emissiveIntensity={1.75}
              metalness={0.88}
              roughness={0.15}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Teal distorted core — inner mystic */}
      <OrbitRing radius={1.65} speed={0.14} tilt={0.5}>
        <Float speed={2.8} rotationIntensity={0.4} floatIntensity={0.45}>
          <mesh>
            <sphereGeometry args={[0.38, 48, 48]} />
            <MeshDistortMaterial
              color="#0d9488"
              emissive="#2dd4bf"
              emissiveIntensity={2}
              distort={0.45}
              speed={4}
              roughness={0.18}
              metalness={0.75}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Violet torus — horizontal ring world */}
      <OrbitRing radius={3.8} speed={0.065} tilt={1.15}>
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.06, 48, 96]} />
            <meshStandardMaterial
              color="#6d28d9"
              emissive="#c084fc"
              emissiveIntensity={1.5}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Amber dodecahedron — slow drift */}
      <OrbitRing radius={2.9} speed={0.048} tilt={-0.4}>
        <Float speed={1.5} rotationIntensity={0.9} floatIntensity={0.5}>
          <mesh>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial
              color="#b45309"
              emissive="#fbbf24"
              emissiveIntensity={1.35}
              metalness={0.82}
              roughness={0.2}
            />
          </mesh>
        </Float>
      </OrbitRing>

      {/* Extra: wire octahedron shell — dimensional frame */}
      <OrbitRing radius={4.4} speed={0.035} tilt={0.2}>
        <mesh>
          <octahedronGeometry args={[0.28, 0]} />
          <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.35} />
        </mesh>
      </OrbitRing>
    </group>
  )
}
