import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { drawingArtworks } from '../../../data/drawings'

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n))
}

function mix(a, b, t) {
  return a + (b - a) * t
}

/** Same curve as the liquid wipe — keeps color & art morph locked */
function morphCurve(t) {
  const x = clamp(t, 0, 1)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

const FALLBACK_A = drawingArtworks.map((p) => new THREE.Color(p.accent || '#2EC4B6'))
const FALLBACK_B = drawingArtworks.map((p) => new THREE.Color(p.accentB || '#5B8CFF'))
const TEX_URLS = drawingArtworks.map((p) => p.src)

function AspectOf(tex) {
  const img = tex?.image
  if (img?.width && img?.height) return img.width / img.height
  return 0.75
}

/** Lush aurora grade — hue locked to the art, saturation lifted for premium glow */
function enrichColor(r, g, b, { satBoost = 1.5, lightPush = 0.2 } = {}) {
  const c = new THREE.Color(r / 255, g / 255, b / 255)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  // near-grey graphite: invent a rich cool plate that still feels like charcoal paper
  if (hsl.s < 0.14) {
    c.setHSL(0.58, 0.42, clamp(hsl.l * 0.55 + 0.28, 0.3, 0.52))
    return c
  }
  c.setHSL(
    hsl.h,
    clamp(hsl.s * satBoost + 0.18, 0.58, 1),
    clamp(hsl.l * 0.75 + lightPush, 0.32, 0.56),
  )
  return c
}

function enrichSibling(base, hueShift = 0.08) {
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)
  const c = new THREE.Color()
  c.setHSL(
    (hsl.h + hueShift + 1) % 1,
    clamp(hsl.s * 0.92, 0.5, 1),
    clamp(hsl.l + 0.06, 0.3, 0.58),
  )
  return c
}

function deepen(base) {
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)
  const c = new THREE.Color()
  c.setHSL(hsl.h, clamp(hsl.s * 0.85, 0.35, 0.9), clamp(hsl.l * 0.35, 0.08, 0.22))
  return c
}

/**
 * Sample the study itself → primary + secondary hues.
 * World-class match: background is born from the drawing, then graded richer.
 */
function extractPaletteFromTexture(texture, fallbackA, fallbackB) {
  try {
    const img = texture?.image
    if (!img?.width || !img?.height) {
      return { a: fallbackA.clone(), b: fallbackB.clone(), deep: deepen(fallbackA) }
    }
    const size = 28
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      return { a: fallbackA.clone(), b: fallbackB.clone(), deep: deepen(fallbackA) }
    }
    ctx.drawImage(img, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)

    const scored = []
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const l = (max + min) * 0.5
      if (l < 16 || l > 245) continue
      const sat = max === 0 ? 0 : (max - min) / max
      const mid = 1 - Math.abs(l - 130) / 130
      const w = (sat < 0.1 ? 0.25 : sat * sat) * (0.35 + mid)
      scored.push({ r, g, b, sat, w, hue: Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) })
    }

    if (!scored.length) {
      return { a: fallbackA.clone(), b: fallbackB.clone(), deep: deepen(fallbackA) }
    }

    scored.sort((x, y) => y.w - x.w)
    const primary = scored[0]
    let secondary = scored.find((s) => Math.abs(s.hue - primary.hue) > 0.7) || null
    if (!secondary) {
      secondary = scored.find((s) => Math.abs(s.hue - primary.hue) > 0.35) || scored[Math.min(4, scored.length - 1)]
    }

    const a = enrichColor(primary.r, primary.g, primary.b)
    const b = secondary
      ? enrichColor(secondary.r, secondary.g, secondary.b, { satBoost: 1.4, lightPush: 0.22 })
      : enrichSibling(a, primary.sat < 0.12 ? 0.12 : 0.09)
    return { a, b, deep: deepen(a) }
  } catch {
    return { a: fallbackA.clone(), b: fallbackB.clone(), deep: deepen(fallbackA) }
  }
}

/* ── Aurora — lush, art-harmonized mesh ── */
const auroraVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const auroraFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  uniform float uFlow;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorDeep;
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.7, 1.2, -1.2, 1.7);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = m * p + 0.12;
      a *= 0.52;
    }
    return v;
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.09;
    float scroll = uProgress * 0.2;
    float flow = uFlow;

    float n1 = fbm(p * 1.25 + vec2(t * 0.6 + scroll, t * 0.28));
    float n2 = fbm(p * 2.4 - vec2(t * 0.42, scroll * 1.35) + n1);
    float n3 = fbm(p * 0.7 + vec2(n2 * 0.75, t * 0.18 - scroll));
    float n4 = fbm(p * 3.8 + vec2(-t * 0.25, n3));

    float ribbon = smoothstep(0.32, 0.8, n2 + n1 * 0.35);
    float veil = smoothstep(0.2, 0.86, n3);
    float spark = pow(smoothstep(0.6, 0.96, n4), 2.8);

    // Palette locked: only A / B / deep from the active morph — never a foreign hue
    vec3 col = uColorDeep;
    col = mix(col, uColorA, ribbon * 0.95);
    col = mix(col, uColorB, veil * 0.72);
    col += mix(uColorA, uColorB, 0.5) * spark * (0.45 + flow * 0.55);
    col += uColorA * (1.0 - length(p) * 0.65) * (0.28 + flow * 0.4);
    col += uColorB * ribbon * ribbon * (0.3 + flow * 0.45);

    // Keep the study readable — strong center dim, vivid edges
    float vig = smoothstep(1.4, 0.18, length(p * vec2(1.08, 1.18)));
    col *= 0.22 + vig * 0.78;
    col = mix(uColorDeep * 0.55, col, 0.88 + flow * 0.08);

    gl_FragColor = vec4(col, 1.0);
  }
`

/* ── Liquid dual-texture morph ── */
const liquidVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const liquidFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform float uMix;
  uniform float uTime;
  uniform float uFlow;
  uniform float uAsp0;
  uniform float uAsp1;
  uniform float uFrameAsp;
  uniform vec3 uAccent0;
  uniform vec3 uAccent1;
  uniform vec2 uPointer;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  vec2 containUV(vec2 uv, float imgAsp) {
    float r = imgAsp / max(uFrameAsp, 0.001);
    vec2 suv = uv;
    if (r > 1.0) {
      suv.y = (uv.y - 0.5) * r + 0.5;
    } else {
      suv.x = (uv.x - 0.5) / max(r, 0.001) + 0.5;
    }
    return suv;
  }

  vec4 sampleArt(sampler2D tex, vec2 uv, float imgAsp, float aberr) {
    vec2 suv = containUV(uv, imgAsp);
    if (suv.x < -0.002 || suv.x > 1.002 || suv.y < -0.002 || suv.y > 1.002) {
      return vec4(0.02, 0.025, 0.04, 0.0);
    }
    float r = texture2D(tex, suv + vec2(aberr, 0.0)).r;
    float g = texture2D(tex, suv).g;
    float b = texture2D(tex, suv - vec2(aberr, 0.0)).b;
    return vec4(r, g, b, 1.0);
  }

  void main() {
    vec2 uv = vUv + uPointer * 0.016;
    float mixv = clamp(uMix, 0.0, 1.0);
    // Same curve as JS title/focus — keeps name locked to the visible study
    float m = mixv * mixv * mixv * (mixv * (mixv * 6.0 - 15.0) + 10.0);

    float n = fbm(uv * 3.1 + vec2(uTime * 0.07, m * 1.4));
    // Dissolves A→B as m rises (m=0 shows tex0, m=1 shows tex1)
    float band = 0.14 + uFlow * 0.08;
    float field = n * 0.62 + uv.x * 0.2 + uv.y * 0.08;
    float wipe = 1.0 - smoothstep(m - band, m + band, field);

    float seam = 1.0 - abs(wipe - 0.5) * 2.0;
    vec2 warp = vec2(
      (n - 0.5) * seam * (0.045 + uFlow * 0.04),
      (fbm(uv.yx * 2.4 + uTime * 0.05) - 0.5) * seam * 0.035
    );

    float aberr = seam * (0.0025 + uFlow * 0.004);
    vec4 a = sampleArt(uTex0, uv + warp * wipe, uAsp0, aberr);
    vec4 b = sampleArt(uTex1, uv - warp * (1.0 - wipe), uAsp1, aberr);

    vec3 art = mix(a.rgb, b.rgb, wipe);
    vec3 accent = mix(uAccent0, uAccent1, m);
    art += accent * seam * seam * (0.18 + uFlow * 0.42);
    art += accent * pow(max(0.0, 1.0 - length((vUv - 0.5) * 1.15)), 2.5) * 0.06;
    art += (hash(uv * (uTime * 0.2 + 1.0)) - 0.5) * 0.018;

    gl_FragColor = vec4(art, 1.0);
  }
`

function AuroraField({ progressRef, flowRef, colorA, colorB, colorDeep }) {
  const mat = useRef(null)
  const { size } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uFlow: { value: 0 },
      uColorA: { value: new THREE.Color('#2EC4B6') },
      uColorB: { value: new THREE.Color('#5B8CFF') },
      uColorDeep: { value: new THREE.Color('#0a1620') },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!mat.current) return
    const u = mat.current.uniforms
    u.uTime.value += dt
    u.uProgress.value = progressRef.current
    u.uFlow.value = flowRef.current
    u.uColorA.value.copy(colorA.current)
    u.uColorB.value.copy(colorB.current)
    u.uColorDeep.value.copy(colorDeep.current)
    u.uRes.value.set(size.width, size.height)
  })

  return (
    <mesh frustumCulled={false} renderOrder={-20}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={auroraVert}
        fragmentShader={auroraFrag}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

function LiquidHero({ textures, progressRef, flowRef, palettesRef, mobileLite, pointer, onSelect }) {
  const group = useRef(null)
  const mat = useRef(null)
  const rim = useRef(null)
  const frameAsp = mobileLite ? 0.72 : 0.78
  const h = mobileLite ? 2.85 : 3.45
  const w = h * frameAsp

  const uniforms = useMemo(
    () => ({
      uTex0: { value: textures[0] },
      uTex1: { value: textures[Math.min(1, textures.length - 1)] },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uAsp0: { value: AspectOf(textures[0]) },
      uAsp1: { value: AspectOf(textures[Math.min(1, textures.length - 1)]) },
      uFrameAsp: { value: frameAsp },
      uAccent0: { value: FALLBACK_A[0].clone() },
      uAccent1: { value: FALLBACK_A[Math.min(1, FALLBACK_A.length - 1)].clone() },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [textures, frameAsp],
  )

  useEffect(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = true
      tex.needsUpdate = true
    })
  }, [textures])

  useFrame((_, dt) => {
    if (!mat.current || !group.current) return
    const progress = progressRef.current
    const max = textures.length - 1
    const i0 = clamp(Math.floor(progress), 0, max)
    const i1 = clamp(i0 + 1, 0, max)
    const frac = progress - Math.floor(progress)
    const m = morphCurve(frac)
    const flow = flowRef.current
    const pals = palettesRef.current

    const u = mat.current.uniforms
    u.uTex0.value = textures[i0]
    u.uTex1.value = textures[i1]
    u.uMix.value = frac
    u.uTime.value += dt
    u.uFlow.value = flow
    u.uAsp0.value = AspectOf(textures[i0])
    u.uAsp1.value = AspectOf(textures[i1])
    if (pals?.[i0] && pals?.[i1]) {
      u.uAccent0.value.copy(pals[i0].a)
      u.uAccent1.value.copy(pals[i1].a)
    }
    u.uPointer.value.lerp(pointer.current, 0.1)

    const settle = 1 + flow * 0.04 + Math.sin(performance.now() * 0.0012) * 0.005 * (1 - flow)
    group.current.scale.setScalar(settle)
    group.current.rotation.y = pointer.current.x * 0.1
    group.current.rotation.x = -pointer.current.y * 0.06
    group.current.position.y = 0.04 + Math.sin(performance.now() * 0.0009) * 0.02

    if (rim.current && pals?.[i0] && pals?.[i1]) {
      rim.current.opacity = 0.3 + flow * 0.55
      rim.current.color.copy(pals[i0].a).lerp(pals[i1].a, m)
    }
  })

  return (
    <group
      ref={group}
      position={[0, 0.04, 0.65]}
      onClick={(e) => {
        e.stopPropagation()
        const progress = progressRef.current
        const max = textures.length - 1
        const i0 = clamp(Math.floor(progress), 0, max)
        const i1 = clamp(i0 + 1, 0, max)
        const m = morphCurve(progress - Math.floor(progress))
        onSelect?.(m < 0.5 ? i0 : i1)
      }}
    >
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[w + 0.12, h + 0.12]} />
        <meshBasicMaterial
          ref={rim}
          color="#2EC4B6"
          transparent
          opacity={0.4}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[w + 0.04, h + 0.04]} />
        <meshBasicMaterial color="#07090f" />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h, 1, 1]} />
        <shaderMaterial
          ref={mat}
          vertexShader={liquidVert}
          fragmentShader={liquidFrag}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function FlowScene({ progressRef, maxProgress, mobileLite, onSelect, onProgress }) {
  const textures = useTexture(TEX_URLS)
  const texList = useMemo(() => (Array.isArray(textures) ? textures : [textures]), [textures])
  const flowRef = useRef(0)
  const colorA = useRef(new THREE.Color('#2EC4B6'))
  const colorB = useRef(new THREE.Color('#5B8CFF'))
  const colorDeep = useRef(new THREE.Color('#0a1620'))
  const palettesRef = useRef([])
  const pointer = useRef(new THREE.Vector2(0, 0))
  const { camera, gl } = useThree()

  // Extract real color DNA from every study once textures land
  useEffect(() => {
    palettesRef.current = texList.map((tex, i) =>
      extractPaletteFromTexture(tex, FALLBACK_A[i], FALLBACK_B[i]),
    )
  }, [texList])

  useEffect(() => {
    const el = gl.domElement
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      pointer.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      )
    }
    const onLeave = () => pointer.current.set(0, 0)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [gl])

  useFrame(() => {
    // Progress is owned by DrawingArchiveExperience (local wheel/touch)
    const progress = clamp(progressRef.current, 0, maxProgress)
    progressRef.current = progress

    const max = drawingArtworks.length - 1
    const i0 = clamp(Math.floor(progress), 0, max)
    const i1 = clamp(i0 + 1, 0, max)
    const frac = progress - Math.floor(progress)
    const m = morphCurve(frac)
    flowRef.current = Math.sin(frac * Math.PI)

    const pals = palettesRef.current
    const p0 = pals[i0] || { a: FALLBACK_A[i0], b: FALLBACK_B[i0], deep: deepen(FALLBACK_A[i0]) }
    const p1 = pals[i1] || { a: FALLBACK_A[i1], b: FALLBACK_B[i1], deep: deepen(FALLBACK_A[i1]) }

    colorA.current.copy(p0.a).lerp(p1.a, m)
    colorB.current.copy(p0.b).lerp(p1.b, m)
    colorDeep.current.copy(p0.deep).lerp(p1.deep, m)

    // Name matches the study that owns the frame (same m as liquid wipe)
    const focus = m < 0.5 ? i0 : i1
    onProgress?.(progress, focus, flowRef.current, {
      a: `#${colorA.current.getHexString()}`,
      b: `#${colorB.current.getHexString()}`,
    })

    const baseZ = mobileLite ? 5.7 : 5.15
    camera.position.z = mix(camera.position.z, baseZ - flowRef.current * 0.22, 0.1)
    camera.position.x = mix(camera.position.x, pointer.current.x * 0.12, 0.06)
    camera.position.y = mix(camera.position.y, pointer.current.y * 0.06, 0.06)
  })

  return (
    <>
      <AuroraField
        progressRef={progressRef}
        flowRef={flowRef}
        colorA={colorA}
        colorB={colorB}
        colorDeep={colorDeep}
      />
      <LiquidHero
        textures={texList}
        progressRef={progressRef}
        flowRef={flowRef}
        palettesRef={palettesRef}
        mobileLite={mobileLite}
        pointer={pointer}
        onSelect={onSelect}
      />
    </>
  )
}

function DrawingHelixCanvas({
  progressRef,
  maxProgress,
  active = true,
  mobileLite = false,
  onContextLost,
  onSelect,
  onProgress,
}) {
  return (
    <Canvas
      className="drawing-helix-canvas"
      camera={{
        position: [0, 0, mobileLite ? 5.7 : 5.15],
        fov: mobileLite ? 40 : 34,
        near: 0.1,
        far: 50,
      }}
      dpr={
        mobileLite
          ? 1.2
          : Math.min(1.75, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5)
      }
      gl={{
        antialias: !mobileLite,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      frameloop={active ? 'always' : 'never'}
      flat
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x05070d, 1)
        gl.toneMapping = THREE.NoToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
        camera.lookAt(0, 0, 0)
        if (onContextLost) {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => {
              e.preventDefault()
              onContextLost()
            },
            false,
          )
        }
      }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#05070d']} />
        <FlowScene
          progressRef={progressRef}
          maxProgress={maxProgress}
          mobileLite={mobileLite}
          onSelect={onSelect}
          onProgress={onProgress}
        />
      </Suspense>
    </Canvas>
  )
}

export default DrawingHelixCanvas
