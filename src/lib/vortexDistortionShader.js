import * as THREE from 'three'

export const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Vincent Lowe Canyon — readable photos + side eyes
 * Center corridor ≈ almost clean full-bleed image (object-fit: cover)
 * Strong suck/swirl only near LEFT + RIGHT edges
 */
export const vortexFragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uScroll;
  uniform float uPageCount;
  uniform float uAspect; // viewport width / height
  varying vec2 vUv;

  // Map screen UV to square page UV with object-fit: cover
  vec2 coverUv(vec2 uv, float aspect) {
    vec2 u = uv;
    float imgAspect = 1.0; // square atlas pages
    if (aspect > imgAspect) {
      // landscape viewport — crop top/bottom of square
      float vis = imgAspect / aspect;
      u.y = (1.0 - vis) * 0.5 + uv.y * vis;
    } else {
      // portrait viewport — crop sides of square
      float vis = aspect / imgAspect;
      u.x = (1.0 - vis) * 0.5 + uv.x * vis;
    }
    return u;
  }

  vec2 eyeWarp(vec2 uv, vec2 center, float power, float spin) {
    vec2 d = uv - center;
    float dist = length(vec2(d.x * 0.62, d.y * 1.05)) + 1e-5;
    float fall = exp(-dist * 3.2);
    float ang = spin * fall;
    float s = sin(ang);
    float c = cos(ang);
    d = mat2(c, -s, s, c) * d;
    float pull = mix(1.0, 0.42, fall * power);
    return center + d * pull;
  }

  vec3 enrich(vec3 c) {
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, 1.12);
    c *= 1.05;
    return pow(max(c, 0.0), vec3(0.98));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.04;
    float I = clamp(uIntensity, 0.5, 1.8);
    float pages = max(uPageCount, 1.0);

    vec2 leftC = vec2(0.0, 0.5);
    vec2 rightC = vec2(1.0, 0.5);

    float spin = 1.35 * I;
    float power = 1.25 * I;

    vec2 wL = eyeWarp(uv, leftC, power, spin + t);
    vec2 wR = eyeWarp(uv, rightC, power, -(spin) - t * 0.8);
    float sideBlend = smoothstep(0.38, 0.62, uv.x);
    vec2 warped = mix(wL, wR, sideBlend);

    // Center = nearly clean photo; outer thirds = canyon eyes
    float edge = smoothstep(0.18, 0.58, abs(uv.x - 0.5));
    edge = pow(edge, 1.35);
    vec2 w = mix(uv, warped, edge * I * 0.92);

    float corridor = 1.0 - edge;
    w.x = 0.5 + (w.x - 0.5) * (1.0 + corridor * 0.12 * I);
    w.y = 0.5 + (w.y - 0.5) * (1.0 + corridor * 0.04 * I);
    w = clamp(w, 0.0, 1.0);

    // Cover-crop within the square page, then map into atlas strip
    vec2 local = coverUv(w, max(uAspect, 0.2));
    float sy = mod(uScroll + (1.0 - local.y), pages) / pages;
    vec2 sampleUv = vec2(local.x, sy);

    float eyeL = exp(-length(vec2((uv.x - leftC.x) * 0.75, uv.y - leftC.y)) * 4.0);
    float eyeR = exp(-length(vec2((uv.x - rightC.x) * 0.75, uv.y - rightC.y)) * 4.0);
    float ring = max(eyeL * (1.0 - eyeL), eyeR * (1.0 - eyeR)) * edge;
    float ca = ring * 0.0028 * I;

    vec3 col = vec3(
      texture2D(uTexture, sampleUv + vec2(ca, 0.0)).r,
      texture2D(uTexture, sampleUv).g,
      texture2D(uTexture, sampleUv - vec2(ca, 0.0)).b
    );
    col = enrich(col);

    float vig = smoothstep(1.6, 0.15, length((uv - 0.5) * vec2(1.05, 1.0)));
    col *= mix(0.88, 1.0, vig);
    col += col * (eyeL + eyeR) * edge * 0.05;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export function createVortexMaterial(intensity = 1.35) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: new THREE.Texture() },
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uScroll: { value: 0 },
      uPageCount: { value: 1 },
      uAspect: { value: 1.6 },
    },
    vertexShader: vortexVertexShader,
    fragmentShader: vortexFragmentShader,
    depthWrite: false,
    depthTest: false,
  })
}
