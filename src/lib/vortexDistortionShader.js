import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Vincent Canyon twin — two silk semicircle eyes on the left + right bezels.
 * Drawings stay readable in the center canyon. Not a spiral/twirl filter.
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
    float soft = 0.12;
    if (localY < soft) {
      mid = mix(samplePage(pageIndex - 1.0, 1.0, lx), mid, smoothstep(0.0, soft, localY));
    } else if (localY > 1.0 - soft) {
      mid = mix(samplePage(pageIndex + 1.0, 0.0, lx), mid, smoothstep(0.0, soft, 1.0 - localY));
    }
    return mid;
  }

  // Soft silk sink — mild spin (spiral/twirl comes from over-spin + hard pull)
  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin) {
    vec2 d = uv - center;
    float dist = length(vec2(d.x * 0.58, d.y * 1.02)) + 1e-5;
    float fall = exp(-dist * 2.85);
    fall = fall * fall * (3.0 - 2.0 * fall);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, 0.52, clamp(fall * power, 0.0, 1.0));
    return center + d * pull;
  }

  vec3 enrich(vec3 c) {
    c = pow(max(c, 0.0), vec3(0.9));
    c *= 1.2;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    return mix(vec3(l), c, 1.08);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.022;
    float I = clamp(uIntensity, 0.55, 1.75);
    float pages = max(uPageCount, 1.0);
    float E = clamp(uEnergy, 0.0, 1.0);

    // Bezel semicircles — half of each circular eye sits on L/R screen edge
    vec2 leftC = vec2(0.0, 0.5);
    vec2 rightC = vec2(1.0, 0.5);

    float spin = (0.95 + E * 0.18) * I;
    float power = (1.1 + E * 0.14) * I;

    vec2 wL = eyeWarp(uv, leftC, power, spin + t);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.82);
    float sideBlend = smoothstep(0.42, 0.58, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    // Outer sides only — CENTER keeps drawings readable (Canyon corridor)
    float edge = smoothstep(0.16, 0.58, abs(uv.x - 0.5));
    edge = pow(edge, 1.2);
    vec2 w = mix(uv, warped, clamp(edge * I * (0.86 + E * 0.06), 0.0, 1.0));

    float corridor = 1.0 - edge;
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * 0.1 * I);
    w.y = 0.5 + (w.y - 0.5) * (1.0 + corridor * 0.03 * I);
    w = clamp(w, 0.0, 1.0);

    // Full-bleed stretch — no X expand that leaks white margins
    vec2 local = clamp(w, vec2(0.001, 0.0), vec2(0.999, 1.0));
    float pageFloat = mod(uScroll + (1.0 - local.y), pages);

    float vBias = (0.0003 + E * 0.0002) / max(pages, 1.0);
    vec3 col = enrich(
      sampleField(pageFloat, local.x) * 0.7
      + sampleField(pageFloat + vBias, local.x) * 0.15
      + sampleField(pageFloat - vBias, local.x) * 0.15
    );

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * 0.75, uv.y - leftC.y)) * 3.4);
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * 0.75, uv.y - rightC.y)) * 3.4);
    float vig = smoothstep(1.75, 0.28, length((uv - 0.5) * vec2(1.05, 1.0)));
    col *= mix(0.95, 1.0, vig);
    col += col * (eyeL + eyeR) * edge * 0.04;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export function createVortexMaterial(intensity = 1.45) {
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
