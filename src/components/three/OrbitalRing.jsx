import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneProgressOptional } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

export default function OrbitalRing() {
  const ringRef = useRef()
  const ring2Ref = useRef()
  const scene = useSceneProgressOptional()
  const { enable3DAutoRotation } = useReducedMotionProfile()

  useFrame((state, delta) => {
    const morph = scene?.morphProgress ?? 0
    const t = state.clock.elapsedTime
    const damp = Math.min(1, delta * 3)
    const variant = scene?.sceneVariant || 'home'
    const isHome = variant === 'home'

    if (ringRef.current) {
      const targetX = THREE.MathUtils.lerp(isHome ? 1.0 : 0, 2.8, morph)
      const targetY = THREE.MathUtils.lerp(isHome ? 0.2 : 0, 1.6, morph)
      ringRef.current.position.x = THREE.MathUtils.lerp(ringRef.current.position.x, targetX, damp)
      ringRef.current.position.y = THREE.MathUtils.lerp(ringRef.current.position.y, targetY, damp)
      ringRef.current.scale.setScalar(THREE.MathUtils.lerp(isHome ? 2.8 : 1.6, 0.8, morph))

      if (enable3DAutoRotation) {
        ringRef.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.4) * 0.08
        ringRef.current.rotation.z = t * 0.12
      }
    }

    if (ring2Ref.current && ringRef.current) {
      ring2Ref.current.position.copy(ringRef.current.position)
      ring2Ref.current.scale.copy(ringRef.current.scale)
      if (enable3DAutoRotation) {
        ring2Ref.current.rotation.x = Math.PI / 3.2
        ring2Ref.current.rotation.y = t * 0.18
      }
    }
  })

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.55, 0.012, 16, 128]} />
        <meshBasicMaterial color="#1c69d4" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.85, 0.006, 12, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  )
}
