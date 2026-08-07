import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { spaceGalaxyDefaults } from '../../../lib/galaxyParams'

const vertexShader = /* glsl */ `
uniform float uSize;
uniform float uMinSize;
attribute float aScale;
attribute vec3 aColor;
varying vec3 vColor;
varying float vPointSize;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Distance attenuation, but never collapse to sub-pixel noise
  float size = uSize * aScale * (1.0 / max(-viewPosition.z, 0.001));
  gl_PointSize = max(size, uMinSize);
  vPointSize = gl_PointSize;
  vColor = aColor;
}
`

const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vPointSize;

void main() {
  // Sharper discs when points get small (zoom-out) — avoids soft “blur mist”
  float softPow = mix(10.0, 3.2, smoothstep(2.5, 8.0, vPointSize));
  float dist = distance(gl_PointCoord, vec2(0.5));
  float strength = 1.0 - dist;
  strength = clamp(strength, 0.0, 1.0);
  strength = pow(strength, softPow);

  // Drop near-zero fringe that reads as haze when densely packed
  if (strength < 0.06) discard;

  vec3 color = vColor * strength;
  gl_FragColor = vec4(color, strength);
}
`

function paintColors(colorsArr, count, radius, positions, insideColor, midColor, outsideColor) {
  const colorInside = new THREE.Color(insideColor)
  const colorMid = new THREE.Color(midColor || insideColor)
  const colorOutside = new THREE.Color(outsideColor)

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    const x = positions[i3]
    const z = positions[i3 + 2]
    const r = Math.min(radius, Math.sqrt(x * x + z * z))
    const t = r / radius
    let mixed
    if (t < 0.45) {
      mixed = colorInside.clone().lerp(colorMid, t / 0.45)
    } else {
      mixed = colorMid.clone().lerp(colorOutside, (t - 0.45) / 0.55)
    }
    colorsArr[i3] = mixed.r
    colorsArr[i3 + 1] = mixed.g
    colorsArr[i3 + 2] = mixed.b
  }
}

/**
 * Astrarise spiral topology + live recolor.
 * Zoom-out keeps crisped point sizes (no sub-pixel blur).
 */
function GalaxyField({
  count = spaceGalaxyDefaults.count,
  zoom = 0,
  reducedMotion = false,
  params = spaceGalaxyDefaults,
}) {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)
  const colorsAttrRef = useRef(null)

  const merged = { ...spaceGalaxyDefaults, ...params }
  const {
    branches,
    radius,
    randomness,
    randomnessPower,
    spin,
    insideColor,
    midColor,
    outsideColor,
  } = merged

  const topology = useMemo(() => {
    const positionsArr = new Float32Array(count * 3)
    const scalesArr = new Float32Array(count)

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      const r = Math.random() * radius
      const branchAngle = ((i % branches) / branches) * Math.PI * 2
      const spinAngle = r * spin

      const randomX =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        r
      const randomY =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        r
      const randomZ =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        r

      positionsArr[i3] = Math.cos(branchAngle + spinAngle) * r + randomX
      positionsArr[i3 + 1] = randomY
      positionsArr[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ
      // Floor scale so far-away stars stay visible
      scalesArr[i] = 0.4 + Math.random() * 0.6
    }

    return { positions: positionsArr, scales: scalesArr }
  }, [count, branches, radius, randomness, randomnessPower, spin])

  const colors = useMemo(() => {
    const colorsArr = new Float32Array(count * 3)
    paintColors(
      colorsArr,
      count,
      radius,
      topology.positions,
      insideColor,
      midColor,
      outsideColor,
    )
    return colorsArr
  }, [count, radius, topology.positions, insideColor, midColor, outsideColor])

  useEffect(() => {
    const attr = colorsAttrRef.current
    if (!attr) return
    attr.array.set(colors)
    attr.needsUpdate = true
  }, [colors])

  const uniforms = useMemo(() => {
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
    return {
      uSize: { value: 30 * dpr },
      uMinSize: { value: 2.25 * dpr },
    }
  }, [])

  useFrame((_, delta) => {
    const pts = pointsRef.current
    const mat = materialRef.current
    if (!pts || !mat) return

    if (!reducedMotion) {
      pts.rotation.y += delta * 0.05
    }

    const t = Math.min(1, Math.max(0, zoom))
    pts.rotation.x = THREE.MathUtils.lerp(0.3, 0.55, t)
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

    // Compensate 1/z shrink when camera pulls back — keep crisp spiral, not haze
    mat.uniforms.uSize.value = THREE.MathUtils.lerp(28 * dpr, 72 * dpr, t)
    mat.uniforms.uMinSize.value = THREE.MathUtils.lerp(2.0 * dpr, 2.8 * dpr, t)
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={topology.positions}
          itemSize={3}
        />
        <bufferAttribute
          ref={colorsAttrRef}
          attach="attributes-aColor"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={count}
          array={topology.scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </points>
  )
}

export default GalaxyField
