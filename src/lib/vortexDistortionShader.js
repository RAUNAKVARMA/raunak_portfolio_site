import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Iconic Canyon twin — exactly TWO powerful side eyes.
 *
 * Desktop multi-lobes came from: (1) midY×side gates carving incomplete wells,
 * (2) hard page seams warping into extra side voids while scrolling.
 * This rebuild: one fat circular sink per bezel, soft page dissolve, calm center.
 */
export const vortexFragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform sampler2D uCumulTex;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uScroll;
  uniform float uPageCount;
  uniform float uAspect;
  uniform float uPageAspect;
  uniform float uEnergy;
  varying vec2 vUv;

  float cumulAt(float index) {
    float pages = max(uPageCount, 1.0);
    float u = (index + 0.5) / pages;
    return texture2D(uCumulTex, vec2(u, 0.5)).r;
  }

  vec3 samplePage(float pageIndex, float localY, float lx) {
    float pages = max(uPageCount, 1.0);
    float idx = mod(pageIndex + pages * 4.0, pages);
    float vStart = idx <= 0.5 ? 0.0 : cumulAt(idx - 1.0);
    float vEnd = cumulAt(idx);
    float sy = mix(vStart, vEnd, clamp(localY, 0.0, 1.0));
    return texture2D(uTexture, vec2(clamp(lx, 0.001, 0.999), sy)).rgb;
  }

  // Wide dissolve so drawing→drawing joints don't curl into fake side eyes
  vec3 sampleField(float pageFloat, float lx) {
    float pageIndex = floor(pageFloat);
    float localY = fract(pageFloat);
    vec3 mid = samplePage(pageIndex, localY, lx);
    float soft = 0.26;
    if (localY < soft) {
      mid = mix(samplePage(pageIndex - 1.0, 1.0, lx), mid, smoothstep(0.0, soft, localY));
    } else if (localY > 1.0 - soft) {
      mid = mix(samplePage(pageIndex + 1.0, 0.0, lx), mid, smoothstep(0.0, soft, 1.0 - localY));
    }
    return mid;
  }

  // One powerful circular sink + silk spin (single peak, no nested rings)
  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin) {
    vec2 d = uv - center;
    float dist = length(vec2(d.x * 0.58, d.y * 1.0)) + 1e-5;
    float fall = exp(-dist * 2.55);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, 0.40, clamp(fall * power, 0.0, 1.0));
    return center + d * pull;
  }

  vec3 enrich(vec3 c) {
    c = max(c, 0.0);
    c = pow(c, vec3(0.88));
    c *= 1.28;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, 1.12);
    return c;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.026;
    float I = clamp(uIntensity, 0.6, 2.0);
    float pages = max(uPageCount, 1.0);
    float E = clamp(uEnergy, 0.0, 1.0);

    // Near-bezel centers (not deep inset — deep inset made stacked eyes)
    vec2 leftC = vec2(0.0, 0.5);
    vec2 rightC = vec2(1.0, 0.5);

    float spin = (1.15 + E * 0.22) * I;
    float power = (1.28 + E * 0.16) * I;

    vec2 wL = eyeWarp(uv, leftC, power, spin + t);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.82);

    // Soft exclusive ownership — no hard seam, no deep mid-band ghost
    float sideBlend = smoothstep(0.47, 0.53, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    // Side bezels fully engage the warp; center stays the canyon.
    // NO midY gate — that was slicing each bezel into stacked lobes.
    float side = smoothstep(0.16, 0.52, abs(uv.x - 0.5));
    side = pow(side, 1.15);
    float warpAmt = clamp(side * min(I, 1.55) * (0.94 + E * 0.05), 0.0, 1.0);
    vec2 w = mix(uv, warped, warpAmt);

    float corridor = 1.0 - side;
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * 0.09 * I);
    w = clamp(w, 0.0, 1.0);

    vec2 local = clamp(w, vec2(0.001, 0.0), vec2(0.999, 1.0));
    float pageFloat = mod(uScroll + (1.0 - local.y), pages);

    float vBias = (0.00028 + E * 0.0002) / max(pages, 1.0);
    vec3 col = enrich(
      sampleField(pageFloat, local.x) * 0.68
      + sampleField(pageFloat + vBias, local.x) * 0.16
      + sampleField(pageFloat - vBias, local.x) * 0.16
    );

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * 0.72, uv.y - leftC.y)) * 3.1);
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * 0.72, uv.y - rightC.y)) * 3.1);
    float vig = smoothstep(1.8, 0.26, length((uv - 0.5) * vec2(1.05, 1.0)));
    col *= mix(0.94, 1.0, vig);
    col += col * (eyeL + eyeR) * side * 0.05;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export function createVortexMaterial(intensity = 1.55) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: new THREE.Texture() },
      uCumulTex: { value: new THREE.Texture() },
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uScroll: { value: 0 },
      uPageCount: { value: 1 },
      uAspect: { value: 1.6 },
      uPageAspect: { value: 16 / 10 },
      uEnergy: { value: 0 },
    },
    vertexShader: vortexVertexShader,
    fragmentShader: vortexFragmentShader,
    depthWrite: false,
    depthTest: false,
  })
}
