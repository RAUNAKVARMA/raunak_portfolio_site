import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

export default function GenerativeHeroMesh({ meshRef }) {
  const innerRef = useRef()
  const materialRef = useRef()
  const { enable3DAutoRotation } = useReducedMotionProfile()
  const scene = useSceneProgressOptional()

  useFrame((state) => {
    const mesh = meshRef?.current || innerRef.current
    if (!mesh) return

    const t = state.clock.elapsedTime
    const morph = scene?.morphProgress ?? 0
    const contact = scene?.contactProgress ?? 0
    const mouse = scene?.mouse ?? { x: 0, y: 0 }

    const heroScale = THREE.MathUtils.lerp(1.35, 0.45, morph)
    const contactBoost = THREE.MathUtils.lerp(1, 1.25, contact)
    mesh.scale.setScalar(heroScale * contactBoost)

    mesh.position.x = THREE.MathUtils.lerp(0, 2.8, morph)
    mesh.position.y = THREE.MathUtils.lerp(0, 1.6, morph)
    mesh.position.z = THREE.MathUtils.lerp(0, -0.5, morph)

    if (enable3DAutoRotation) {
      mesh.rotation.x = THREE.MathUtils.lerp(mouse.y * 0.35, 0.2, morph) + t * 0.08
      mesh.rotation.y = THREE.MathUtils.lerp(mouse.x * 0.45, t * 0.12, morph)
      mesh.rotation.z = t * 0.04
    }

    if (materialRef.current) {
      materialRef.current.distort = THREE.MathUtils.lerp(0.45, 0.12, morph) + Math.sin(t * 0.6) * 0.04
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.6, 0.2, morph) + contact * 0.4
    }
  })

  return (
    <mesh ref={meshRef || innerRef}>
      <icosahedronGeometry args={[1.2, 64]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#6366f1"
        emissive="#4338ca"
        emissiveIntensity={0.6}
        metalness={0.7}
        roughness={0.2}
        distort={0.45}
        speed={1.8}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}
