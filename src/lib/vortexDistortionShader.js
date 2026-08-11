import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Twin vortices — matches Vincent Lowe desktop: two circular side eyes + center seam.
 * Phone uses the same warp language with portrait-tuned eye centers / falloff so both
 * eyes stay round and readable while the field still covers the full screen (height-fit).
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
  uniform float uMobile;
  varying vec2 vUv;

  float cumulAt(float index) {
    float pages = max(uPageCount, 1.0);
    float u = (index + 0.5) / pages;
    return texture2D(uCumulTex, vec2(u, 0.5)).r;
  }

  // Vincent / desktop cover: page fills view height; crop width if needed.
  // On phone, slightly wider “virtual” aspect so both vortex sides still sample page
  // content instead of collapsing into a razor-thin center crop.
  vec2 heightFitUv(vec2 uv, float viewAspect, float pageAspect, float mobile) {
    float va = viewAspect;
    va = mix(va, max(va, 0.92), clamp(mobile, 0.0, 1.0));
    vec2 u;
    u.y = uv.y;
    if (va > pageAspect) {
      u.x = 0.5 + (uv.x - 0.5) * (va / pageAspect);
    } else {
      float vis = va / pageAspect;
      u.x = (1.0 - vis) * 0.5 + uv.x * vis;
    }
    return u;
  }

  // Circular sinkhole + spin — portrait uses different radius so both eyes look round
  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin, float mobile) {
    vec2 d = uv - center;
    float xs = mix(0.58, 0.95, mobile);
    float ys = mix(1.02, 0.72, mobile);
    float dist = length(vec2(d.x * xs, d.y * ys)) + 1e-5;
    float fall = exp(-dist * mix(2.85, 2.35, mobile));
    fall = fall * fall * (3.0 - 2.0 * fall);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float sink = mix(0.48, 0.40, mobile);
    float pull = mix(1.0, sink, fall * power);
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
    float I = clamp(uIntensity, 0.5, 2.2);
    float pages = max(uPageCount, 1.0);
    float E = clamp(uEnergy, 0.0, 1.0);
    float mobile = clamp(uMobile, 0.0, 1.0);

    // Desktop: eyes on bezels. Phone: sit in each half (≈1/4 & 3/4) like Vincent’s twin circles.
    vec2 leftC = mix(vec2(0.0, 0.5), vec2(0.22, 0.5), mobile);
    vec2 rightC = mix(vec2(1.0, 0.5), vec2(0.78, 0.5), mobile);

    float spin = (1.35 + E * 0.25) * I * mix(1.0, 1.18, mobile);
    float power = (1.2 + E * 0.2) * I * mix(1.0, 1.22, mobile);

    vec2 wL = eyeWarp(uv, leftC, power, spin + t, mobile);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.82, mobile);
    float sideBlend = smoothstep(0.36, 0.64, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    // Edge mix — phone engages twins earlier so both circular eyes fill the frame
    float edgeLo = mix(0.14, 0.04, mobile);
    float edgeHi = mix(0.58, 0.42, mobile);
    float edge = smoothstep(edgeLo, edgeHi, abs(uv.x - 0.5));
    edge = pow(edge, mix(1.22, 1.05, mobile));
    vec2 w = mix(uv, warped, clamp(edge * I * (0.88 + E * 0.08) * mix(1.0, 1.06, mobile), 0.0, 1.0));

    // Center seam / corridor (Vincent spine between the two eyes)
    float corridor = 1.0 - edge;
    float corridorAmp = mix(0.11, 0.08, mobile);
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * corridorAmp * I);
    w.y = 0.5 + (w.y - 0.5) * (1.0 + corridor * corridorAmp * 0.32 * I);
    w = clamp(w, 0.0, 1.0);

    vec2 local = heightFitUv(w, max(uAspect, 0.2), max(uPageAspect, 0.2), mobile);
    local.x = clamp(local.x, 0.001, 0.999);
    local.y = clamp(local.y, 0.0, 1.0);

    float pageFloat = mod(uScroll + (1.0 - local.y), pages);
    float pageIndex = floor(pageFloat);
    float localY = fract(pageFloat);

    float vStart = pageIndex <= 0.5 ? 0.0 : cumulAt(pageIndex - 1.0);
    float vEnd = cumulAt(pageIndex);
    float sy = mix(vStart, vEnd, localY);

    vec2 sampleUv = vec2(local.x, sy);

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * mix(0.75, 0.9, mobile), (uv.y - leftC.y) * mix(1.0, 0.75, mobile))) * mix(3.6, 2.6, mobile));
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * mix(0.75, 0.9, mobile), (uv.y - rightC.y) * mix(1.0, 0.75, mobile))) * mix(3.6, 2.6, mobile));
    float ring = max(eyeL * (1.0 - eyeL), eyeR * (1.0 - eyeR)) * edge;
    float ca = ring * 0.0024 * I * mix(1.0, 1.25, mobile);

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
    col += col * (eyeL + eyeR) * edge * mix(0.045, 0.07, mobile);

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
      uMobile: { value: 0 },
    },
    vertexShader: vortexVertexShader,
    fragmentShader: vortexFragmentShader,
    depthWrite: false,
    depthTest: false,
  })
}
