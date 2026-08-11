import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Twin vortices — silky scroll + soft side eyes.
 * Variable-height pages via uCumulTex; framing lerped in JS (uPageAspect).
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
  uniform float uZoomOut;
  varying vec2 vUv;

  float cumulAt(float index) {
    float pages = max(uPageCount, 1.0);
    float u = (index + 0.5) / pages;
    return texture2D(uCumulTex, vec2(u, 0.5)).r;
  }

  vec2 heightFitUv(vec2 uv, float viewAspect, float pageAspect, float zoomOut) {
    float z = max(zoomOut, 1.0);
    vec2 u;
    if (viewAspect > pageAspect) {
      u.y = 0.5 + (uv.y - 0.5) / z;
      u.x = 0.5 + (uv.x - 0.5) * (viewAspect / pageAspect) / z;
    } else {
      // Tall phone: lift crop toward full page width so both edges stay in frame
      float vis = viewAspect / pageAspect;
      vis = mix(vis, 1.0, clamp((z - 1.0) * 1.75, 0.0, 1.0));
      u.x = 0.5 + (uv.x - 0.5) * vis;
      u.y = 0.5 + (uv.y - 0.5) / z;
    }
    return u;
  }

  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin) {
    vec2 d = uv - center;
    float dist = length(vec2(d.x * 0.58, d.y * 1.02)) + 1e-5;
    // Softer falloff = silkier eyes, less sparkling
    float fall = exp(-dist * 2.85);
    fall = fall * fall * (3.0 - 2.0 * fall);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, 0.48, fall * power);
    return center + d * pull;
  }

  vec3 enrich(vec3 c) {
    c = pow(max(c, 0.0), vec3(0.9));
    c *= 1.2;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, 1.08);
    return c;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.028;
    float I = clamp(uIntensity, 0.5, 2.0);
    float pages = max(uPageCount, 1.0);
    float E = clamp(uEnergy, 0.0, 1.0);

    vec2 leftC = vec2(0.0, 0.5);
    vec2 rightC = vec2(1.0, 0.5);

    float spin = (1.35 + E * 0.25) * I;
    float power = (1.2 + E * 0.2) * I;

    vec2 wL = eyeWarp(uv, leftC, power, spin + t);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.82);
    float sideBlend = smoothstep(0.36, 0.64, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    float edge = smoothstep(0.14, 0.58, abs(uv.x - 0.5));
    edge = pow(edge, 1.22);
    vec2 w = mix(uv, warped, edge * I * (0.88 + E * 0.08));

    float corridor = 1.0 - edge;
    // On phone (uZoomOut > 1), suppress center “push” that feels over-zoomed
    float zoomOut = max(uZoomOut, 1.0);
    float corridorAmp = mix(0.11, 0.028, clamp((zoomOut - 1.0) * 2.5, 0.0, 1.0));
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * corridorAmp * I);
    w.y = 0.5 + (w.y - 0.5) * (1.0 + corridor * corridorAmp * 0.32 * I);
    w = clamp(w, 0.0, 1.0);

    vec2 local = heightFitUv(w, max(uAspect, 0.2), max(uPageAspect, 0.2), zoomOut);
    local.x = clamp(local.x, 0.001, 0.999);
    local.y = clamp(local.y, 0.0, 1.0);

    float pageFloat = mod(uScroll + (1.0 - local.y), pages);
    float pageIndex = floor(pageFloat);
    float localY = fract(pageFloat);

    float vStart = pageIndex <= 0.5 ? 0.0 : cumulAt(pageIndex - 1.0);
    float vEnd = cumulAt(pageIndex);
    float sy = mix(vStart, vEnd, localY);

    vec2 sampleUv = vec2(local.x, sy);

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * 0.75, uv.y - leftC.y)) * 3.6);
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * 0.75, uv.y - rightC.y)) * 3.6);
    float ring = max(eyeL * (1.0 - eyeL), eyeR * (1.0 - eyeR)) * edge;
    float ca = ring * 0.0024 * I;

    // 2-tap mild blur along scroll axis reduces shimmer while scrolling
    vec3 colA = vec3(
      texture2D(uTexture, sampleUv + vec2(ca, 0.0)).r,
      texture2D(uTexture, sampleUv).g,
      texture2D(uTexture, sampleUv - vec2(ca, 0.0)).b
    );
    float vBias = (0.00035 + E * 0.00025) / max(pages, 1.0);
    vec3 colB = texture2D(uTexture, sampleUv + vec2(0.0, vBias)).rgb;
    vec3 colC = texture2D(uTexture, sampleUv - vec2(0.0, vBias)).rgb;
    vec3 col = enrich(colA * 0.7 + (colB + colC) * 0.15);

    float vig = smoothstep(1.75, 0.28, length((uv - 0.5) * vec2(1.05, 1.0)));
    col *= mix(0.95, 1.0, vig);
    col += col * (eyeL + eyeR) * edge * 0.045;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export function createVortexMaterial(intensity = 1.5) {
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
      uZoomOut: { value: 1 },
    },
    vertexShader: vortexVertexShader,
    fragmentShader: vortexFragmentShader,
    depthWrite: false,
    depthTest: false,
  })
}
