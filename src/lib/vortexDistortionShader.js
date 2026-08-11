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
 * uMobile: phones use object-fit contain (full drawing inside screen) + inset eyes.
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
  uniform float uMobile;
  varying vec2 vUv;

  float cumulAt(float index) {
    float pages = max(uPageCount, 1.0);
    float u = (index + 0.5) / pages;
    return texture2D(uCumulTex, vec2(u, 0.5)).r;
  }

  // Desktop: height-fit cover (fills frame, may crop sides).
  // Phone: object-fit contain — entire page inside the screen with letterbox.
  // Returns page UV; out of [0,1] means outside the drawing (letterbox).
  vec2 pageFitUv(vec2 uv, float viewAspect, float pageAspect, float zoomOut, float mobile) {
    float z = max(zoomOut, 1.0);
    float m = clamp(mobile, 0.0, 1.0);
    vec2 cover;
    vec2 contain;

    if (viewAspect > pageAspect) {
      // Wide view: cover = fill height, crop width
      cover.y = 0.5 + (uv.y - 0.5) / z;
      cover.x = 0.5 + (uv.x - 0.5) * (viewAspect / pageAspect) / z;
      // Contain = fit width inside, pillarbox sides (or full if page wider)
      float margin = 1.0 / z;
      float pageW = (pageAspect / viewAspect) * margin;
      float pageH = margin;
      contain.x = (uv.x - 0.5) / max(pageW, 1e-4) + 0.5;
      contain.y = (uv.y - 0.5) / max(pageH, 1e-4) + 0.5;
    } else {
      // Tall view: cover = fill height, crop width (center column)
      float vis = viewAspect / pageAspect;
      cover.x = 0.5 + (uv.x - 0.5) * vis;
      cover.y = 0.5 + (uv.y - 0.5) / z;
      // Contain = fit page fully (width-limited for landscape pages on phone)
      float margin = 1.0 / z;
      float pageW;
      float pageH;
      if (pageAspect >= viewAspect) {
        pageW = margin;
        pageH = (viewAspect / pageAspect) * margin;
      } else {
        pageW = (pageAspect / viewAspect) * margin;
        pageH = margin;
      }
      contain.x = (uv.x - 0.5) / max(pageW, 1e-4) + 0.5;
      contain.y = (uv.y - 0.5) / max(pageH, 1e-4) + 0.5;
    }

    return mix(cover, contain, m);
  }

  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin, float wide) {
    vec2 d = uv - center;
    float xs = mix(0.58, 0.36, wide);
    float ys = mix(1.02, 0.9, wide);
    float dist = length(vec2(d.x * xs, d.y * ys)) + 1e-5;
    float fall = exp(-dist * mix(2.85, 2.2, wide));
    fall = fall * fall * (3.0 - 2.0 * fall);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, mix(0.48, 0.38, wide), fall * power);
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
    float zoomOut = max(uZoomOut, 1.0);

    // Phone: eyes sit on the drawing’s side regions (inset from bezel)
    vec2 leftC = mix(vec2(0.0, 0.5), vec2(0.16, 0.5), mobile);
    vec2 rightC = mix(vec2(1.0, 0.5), vec2(0.84, 0.5), mobile);

    float spin = (1.35 + E * 0.25) * I * mix(1.0, 1.22, mobile);
    float power = (1.2 + E * 0.2) * I * mix(1.0, 1.32, mobile);

    vec2 wL = eyeWarp(uv, leftC, power, spin + t, mobile);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.82, mobile);
    float sideBlend = smoothstep(0.36, 0.64, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    float edgeLo = mix(0.14, 0.06, mobile);
    float edgeHi = mix(0.58, 0.48, mobile);
    float edge = smoothstep(edgeLo, edgeHi, abs(uv.x - 0.5));
    edge = pow(edge, mix(1.22, 1.08, mobile));
    float warpAmt = edge * I * mix(0.88, 1.0, mobile) * (0.88 + E * 0.08);
    vec2 w = mix(uv, warped, clamp(warpAmt, 0.0, 1.0));

    float corridor = 1.0 - edge;
    float corridorAmp = mix(0.11, 0.04, mobile);
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * corridorAmp * I);
    w.y = 0.5 + (w.y - 0.5) * (1.0 + corridor * corridorAmp * 0.32 * I);
    w = clamp(w, 0.0, 1.0);

    vec2 local = pageFitUv(w, max(uAspect, 0.2), max(uPageAspect, 0.2), zoomOut, mobile);

    // Letterbox outside the drawing — do not clamp-stretch off-page samples
    float inside = smoothstep(0.0, 0.012, local.x) * smoothstep(0.0, 0.012, 1.0 - local.x)
                 * smoothstep(0.0, 0.012, local.y) * smoothstep(0.0, 0.012, 1.0 - local.y);
    // Soft mask stronger on phone contain; desktop cover barely uses it
    inside = mix(1.0, inside, mobile);

    vec2 sampleLocal = clamp(local, vec2(0.001, 0.0), vec2(0.999, 1.0));

    float pageFloat = mod(uScroll + (1.0 - sampleLocal.y), pages);
    float pageIndex = floor(pageFloat);
    float localY = fract(pageFloat);

    float vStart = pageIndex <= 0.5 ? 0.0 : cumulAt(pageIndex - 1.0);
    float vEnd = cumulAt(pageIndex);
    float sy = mix(vStart, vEnd, localY);

    vec2 sampleUv = vec2(sampleLocal.x, sy);

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * mix(0.75, 0.55, mobile), uv.y - leftC.y)) * mix(3.6, 2.9, mobile));
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * mix(0.75, 0.55, mobile), uv.y - rightC.y)) * mix(3.6, 2.9, mobile));
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
    col += col * (eyeL + eyeR) * edge * mix(0.045, 0.065, mobile);
    col *= inside;

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
      uMobile: { value: 0 },
    },
    vertexShader: vortexVertexShader,
    fragmentShader: vortexFragmentShader,
    depthWrite: false,
    depthTest: false,
  })
}
