import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Vincent Canyon twin — two perfect semicircle eyes.
 * Left eye ~quarter, right eye ~three-quarter (NOT edge bezels at 0/1 —
 * edge sinks destroyed the circles and leaked white margins).
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

  // Large circular Canyon sink — screen-round via aspect
  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin, float aspect) {
    vec2 d = uv - center;
    float dist = length(vec2(d.x * aspect, d.y)) + 1e-5;
    float fall = exp(-dist * 2.2);
    fall = fall * fall * (3.0 - 2.0 * fall);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, 0.36, clamp(fall * power, 0.0, 1.0));
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
    float t = uTime * 0.03;
    float I = clamp(uIntensity, 0.7, 2.0);
    float pages = max(uPageCount, 1.0);
    float E = clamp(uEnergy, 0.0, 1.0);
    float aspect = clamp(uAspect, 0.4, 2.4);

    // Canyon eye centers — half-way into each side (Vincent twin semicircles)
    vec2 leftC = vec2(0.20, 0.5);
    vec2 rightC = vec2(0.80, 0.5);

    float spin = (1.35 + E * 0.25) * I;
    float power = (1.35 + E * 0.18) * I;

    vec2 wL = eyeWarp(uv, leftC, power, spin + t, aspect);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.85, aspect);

    // Each half owns one eye — narrow soft join so canyon meets cleanly
    float sideBlend = smoothstep(0.48, 0.52, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    // Almost full engagement — large semicircles, thin calm canyon spine
    float edge = smoothstep(0.02, 0.22, abs(uv.x - 0.5));
    edge = pow(edge, 0.92);
    vec2 w = mix(uv, warped, clamp(edge * min(I, 1.7) * (0.96 + E * 0.04), 0.0, 1.0));

    // Canyon spine between the two semicircles
    float corridor = 1.0 - edge;
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * 0.14 * I);
    w = clamp(w, 0.0, 1.0);

    // Full-bleed stretch — keeps edges filled (no white bezel leak)
    vec2 local = clamp(w, vec2(0.001, 0.0), vec2(0.999, 1.0));
    float pageFloat = mod(uScroll + (1.0 - local.y), pages);

    float vBias = (0.00025 + E * 0.0002) / max(pages, 1.0);
    vec3 col = enrich(
      sampleField(pageFloat, local.x) * 0.66
      + sampleField(pageFloat + vBias, local.x) * 0.17
      + sampleField(pageFloat - vBias, local.x) * 0.17
    );

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * aspect, uv.y - leftC.y)) * 2.8);
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * aspect, uv.y - rightC.y)) * 2.8);
    float vig = smoothstep(1.85, 0.22, length((uv - 0.5) * vec2(1.05, 1.0)));
    col *= mix(0.93, 1.0, vig);
    col += col * (eyeL + eyeR) * edge * 0.055;

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
