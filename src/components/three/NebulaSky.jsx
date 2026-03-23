import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Fullscreen additive nebula + auroral emission — reads like astro / film VFX,
 * not floating props (no geometry clutter in front of the camera).
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.032;

    vec2 warp = vec2(fbm(uv * 1.7 + t * 0.12), fbm(uv * 1.7 - t * 0.1));
    float clouds = fbm(uv * 2.2 + warp * 1.6 + vec2(t * 0.06, t * 0.035));
    float fine = fbm(uv * 9.0 + t * 0.04) * 0.28;

    // H II / molecular cloud tones (film-grade, not toy neon)
    vec3 core = vec3(0.42, 0.1, 0.48);
    vec3 oxygen = vec3(0.05, 0.38, 0.44);
    vec3 voidCol = vec3(0.01, 0.02, 0.08);

    float mixAmt = smoothstep(0.12, 0.92, clouds);
    vec3 nebula = mix(voidCol, mix(core, oxygen, clouds), mixAmt);

    // Auroral curtains — large-scale emission sheets (Earth-like + sci‑fi accent)
    float band = smoothstep(0.08, 0.95, uv.y);
    float wave = 0.5 + 0.5 * sin(uv.x * 24.0 + t * 2.4 + clouds * 5.0);
    float curtain = band * pow(wave, 4.0) * (0.35 + 0.65 * clouds);
    vec3 aurora = vec3(0.12, 0.88, 0.58) * curtain * 0.2;
    vec3 ray = vec3(0.55, 0.35, 1.0) * curtain * clouds * 0.14;

    vec3 col = nebula * (0.4 + 0.6 * clouds) + aurora + ray;
    col += fine * vec3(0.35, 0.45, 0.85);

    float vign = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.85);
    float breathe = 0.78 + 0.22 * sin(t * 0.45);
    float alpha = (0.1 + 0.55 * clouds * vign) * breathe * 0.92;

    gl_FragColor = vec4(col * alpha, alpha);
  }
`

export default function NebulaSky() {
  const matRef = useRef(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  )

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const w = viewport.width * 2.4
  const h = viewport.height * 2.4

  return (
    <mesh key={`${w.toFixed(2)}-${h.toFixed(2)}`} position={[0, 0, -82]} renderOrder={-100}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
