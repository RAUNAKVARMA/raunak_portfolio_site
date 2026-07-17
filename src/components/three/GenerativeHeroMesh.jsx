import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

const VARIANTS = {
  home: { geometry: 'icosahedron', color: '#6ba3ff', emissive: '#1a4080', distort: 0.42, speed: 1.6, spin: 0.14, bounce: 0, scale: 2.35, offsetX: 1.05, offsetY: 0.15 },
  about: { geometry: 'dodecahedron', color: '#8a8a8a', emissive: '#1a1a1a', distort: 0.22, speed: 0.9, spin: 0.06, bounce: 0, scale: 1.2, offsetX: 0, offsetY: 0 },
  work: { geometry: 'torusKnot', color: '#b8b8b8', emissive: '#2a2a2a', distort: 0.24, speed: 1.6, spin: 0.14, bounce: 0, scale: 1.3, offsetX: 0, offsetY: 0 },
  experience: { geometry: 'octahedron', color: '#9a9a9a', emissive: '#222222', distort: 0.18, speed: 0.8, spin: 0.05, bounce: 0, scale: 1.2, offsetX: 0, offsetY: 0 },
  beyond: { geometry: 'sphere', color: '#e22718', emissive: '#6b1010', distort: 0.14, speed: 1.2, spin: 0.12, bounce: 0.35, scale: 1.45, offsetX: 0, offsetY: 0 },
  contact: { geometry: 'icosahedron', color: '#5a8fd4', emissive: '#0d2848', distort: 0.28, speed: 1.4, spin: 0.1, bounce: 0, scale: 1.3, offsetX: 0, offsetY: 0 },
}

function Geometry({ variant }) {
  switch (variant) {
    case 'torusKnot':
      return <torusKnotGeometry args={[0.85, 0.3, 180, 32]} />
    case 'octahedron':
      return <octahedronGeometry args={[1.25, 6]} />
    case 'dodecahedron':
      return <dodecahedronGeometry args={[1.2, 4]} />
    case 'sphere':
      return <sphereGeometry args={[1.2, 96, 96]} />
    case 'icosahedron':
    default:
      return <icosahedronGeometry args={[1.2, 64]} />
  }
}

export default function GenerativeHeroMesh({ meshRef }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const { enable3DAutoRotation } = useReducedMotionProfile()
  const scene = useSceneProgressOptional()

  const variantKey = scene?.sceneVariant || 'home'
  const variant = VARIANTS[variantKey] || VARIANTS.home

  const colorTarget = useMemo(() => new THREE.Color(variant.color), [variant.color])
  const emissiveTarget = useMemo(() => new THREE.Color(variant.emissive), [variant.emissive])

  useFrame((state, delta) => {
    const mesh = meshRef?.current || groupRef.current
    if (!mesh) return

    const t = state.clock.elapsedTime
    const morph = scene?.morphProgress ?? 0
    const contact = scene?.contactProgress ?? 0
    const mouse = scene?.mouse ?? { x: 0, y: 0 }
    const damp = Math.min(1, delta * 3)

    const baseScale = variant.scale ?? 1.35
    const heroScale = THREE.MathUtils.lerp(baseScale, 0.5, morph)
    const contactBoost = THREE.MathUtils.lerp(1, 1.25, contact)
    const targetScale = heroScale * contactBoost
    mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, damp))

    const homeOffsetX = variant.offsetX ?? 0
    const homeOffsetY = variant.offsetY ?? 0
    const targetX = THREE.MathUtils.lerp(homeOffsetX, 2.8, morph)
    const targetY = THREE.MathUtils.lerp(homeOffsetY, 1.6, morph) + variant.bounce * Math.sin(t * 1.6)
    const targetZ = THREE.MathUtils.lerp(0, -0.5, morph)
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, damp)
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, damp)
    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ, damp)

    if (enable3DAutoRotation) {
      mesh.rotation.x = THREE.MathUtils.lerp(mouse.y * 0.35, 0.2, morph) + t * (variant.spin * 0.6)
      mesh.rotation.y = THREE.MathUtils.lerp(mouse.x * 0.45, t * variant.spin, morph) + t * variant.spin
      mesh.rotation.z = t * 0.04
    }

    if (materialRef.current) {
      materialRef.current.color.lerp(colorTarget, damp)
      materialRef.current.emissive.lerp(emissiveTarget, damp)
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort,
        variant.distort + Math.sin(t * 0.6) * 0.04,
        damp,
      )
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(1.15, 0.25, morph) + contact * 0.4
    }
  })

  return (
    <group ref={meshRef || groupRef}>
      <mesh scale={1.12}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial color="#1c69d4" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <mesh>
        <Geometry variant={variant.geometry} />
        <MeshDistortMaterial
          ref={materialRef}
          color={variant.color}
          emissive={variant.emissive}
          emissiveIntensity={1.1}
          metalness={0.78}
          roughness={0.28}
          distort={variant.distort}
          speed={variant.speed}
          transparent
          opacity={0.97}
        />
      </mesh>
    </group>
  )
}
