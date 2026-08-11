import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Vincent Canyon twin — two clean semicircle eyes (L @ ~0.2, R @ ~0.8).
 * Strong radial sink + light silk shear. Heavy spin was wrapping sketches into
 * nested corkscrews instead of one smooth semicircle per side.
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

  vec3 sampleField(float pageFloat, float lx) {
    float pageIndex = floor(pageFloat);
    float localY = fract(pageFloat);
    vec3 mid = samplePage(pageIndex, localY, lx);
    float soft = 0.14;
    if (localY < soft) {
      mid = mix(samplePage(pageIndex - 1.0, 1.0, lx), mid, smoothstep(0.0, soft, localY));
    } else if (localY > 1.0 - soft) {
      mid = mix(samplePage(pageIndex + 1.0, 0.0, lx), mid, smoothstep(0.0, soft, 1.0 - localY));
    }
    return mid;
  }

  // Semicircle Canyon eye: radial sink first, mild silk only
  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin, float aspect) {
    vec2 d = uv - center;
    float dist = length(vec2(d.x * aspect, d.y)) + 1e-5;
    float fall = exp(-dist * 2.05);
    // Soft peak — no hard rings
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, 0.34, clamp(fall * power, 0.0, 1.0));
    return center + d * pull;
  }

  vec3 enrich(vec3 c) {
    c = max(c, 0.0);
    c = pow(c, vec3(0.88));
    c *= 1.26;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    return mix(vec3(l), c, 1.1);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.018;
    float I = clamp(uIntensity, 0.7, 2.0);
    float pages = max(uPageCount, 1.0);
    float E = clamp(uEnergy, 0.0, 1.0);
    float aspect = clamp(uAspect, 0.45, 2.2);

    // Vincent twin semicircle centers
    vec2 leftC = vec2(0.20, 0.5);
    vec2 rightC = vec2(0.80, 0.5);

    // LOW spin (sketches must not multi-wrap). HIGH sink for iconic semicircles.
    float spin = (0.42 + E * 0.1) * I;
    float power = (1.45 + E * 0.15) * I;

    vec2 wL = eyeWarp(uv, leftC, power, spin + t, aspect);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.85, aspect);

    float sideBlend = smoothstep(0.48, 0.52, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    // Large semicircles fill each half; thin canyon through center
    float edge = smoothstep(0.015, 0.2, abs(uv.x - 0.5));
    edge = pow(edge, 0.9);
    vec2 w = mix(uv, warped, clamp(edge * min(I, 1.7) * (0.97 + E * 0.03), 0.0, 1.0));

    float corridor = 1.0 - edge;
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * 0.12 * I);
    w = clamp(w, 0.0, 1.0);

    vec2 local = clamp(w, vec2(0.001, 0.0), vec2(0.999, 1.0));
    float pageFloat = mod(uScroll + (1.0 - local.y), pages);

    float vBias = (0.00022 + E * 0.00018) / max(pages, 1.0);
    vec3 col = enrich(
      sampleField(pageFloat, local.x) * 0.7
      + sampleField(pageFloat + vBias, local.x) * 0.15
      + sampleField(pageFloat - vBias, local.x) * 0.15
    );

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * aspect, uv.y - leftC.y)) * 2.6);
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * aspect, uv.y - rightC.y)) * 2.6);
    float vig = smoothstep(1.85, 0.24, length((uv - 0.5) * vec2(1.05, 1.0)));
    col *= mix(0.94, 1.0, vig);
    col += col * (eyeL + eyeR) * edge * 0.05;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export function createVortexMaterial(intensity = 1.6) {
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
