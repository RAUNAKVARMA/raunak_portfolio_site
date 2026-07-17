import { useMemo } from 'react'
import { Float } from '@react-three/drei'

const SHAPES = [
  { position: [-3.4, 1.8, -2], scale: 0.32, geometry: 'tetra' },
  { position: [3.6, -1.4, -2.5], scale: 0.26, geometry: 'octa' },
  { position: [-2.8, -2.1, -1.5], scale: 0.2, geometry: 'box' },
  { position: [3.1, 2.2, -3], scale: 0.24, geometry: 'tetra' },
]

function ShapeGeometry({ geometry }) {
  switch (geometry) {
    case 'octa':
      return <octahedronGeometry args={[1, 0]} />
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />
    case 'tetra':
    default:
      return <tetrahedronGeometry args={[1, 0]} />
  }
}

export default function FloatingShapes() {
  const shapes = useMemo(() => SHAPES, [])

  return (
    <>
      {shapes.map((shape, i) => (
        <Float key={i} speed={1.2 + i * 0.2} rotationIntensity={0.6} floatIntensity={0.8}>
          <mesh position={shape.position} scale={shape.scale}>
            <ShapeGeometry geometry={shape.geometry} />
            <meshStandardMaterial
              color="#4d9fff"
              emissive="#0a2040"
              emissiveIntensity={0.65}
              metalness={0.75}
              roughness={0.35}
              transparent
              opacity={0.55}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}
