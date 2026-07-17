/**
 * WebGL Fluid Simulation — faithful port of Pavel Dobryakov's engine
 * (the same core used by Lively Wallpaper "Fluids").
 * MIT License — Copyright (c) 2017 Pavel Dobryakov
 */

function hashCode(s) {
  if (!s.length) return 0
  let hash = 0
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function clamp01(v) {
  return Math.min(Math.max(v, 0), 1)
}

function wrap(value, min, max) {
  const range = max - min
  if (range === 0) return min
  return ((value - min) % range) + min
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0: return { r: v, g: t, b: p }
    case 1: return { r: q, g: v, b: p }
    case 2: return { r: p, g: v, b: t }
    case 3: return { r: p, g: q, b: v }
    case 4: return { r: t, g: p, b: v }
    default: return { r: v, g: p, b: q }
  }
}

export function createFluidSimulation(canvas, userOptions = {}) {
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 1,
    VELOCITY_DISSIPATION: 0.2,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 30,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 10,
    BLOOM: true,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
    ...userOptions,
  }

  let gl =
    canvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    }) ||
    canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    })

  if (!gl) {
    return { start: () => {}, stop: () => {}, destroy: () => {}, resize: () => {}, splatAt: () => {} }
  }

  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext

  let halfFloatExt
  let supportLinearFiltering
  if (isWebGL2) {
    gl.getExtension('EXT_color_buffer_float')
    supportLinearFiltering = gl.getExtension('OES_texture_float_linear')
  } else {
    halfFloatExt = gl.getExtension('OES_texture_half_float')
    supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear')
  }

  const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloatExt?.HALF_FLOAT_OES

  function supportRenderTextureFormat(internalFormat, format, type) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.deleteFramebuffer(fbo)
    gl.deleteTexture(texture)
    return status === gl.FRAMEBUFFER_COMPLETE
  }

  function getSupportedFormat(internalFormat, format, type) {
    if (!supportRenderTextureFormat(internalFormat, format, type)) {
      if (isWebGL2) {
        if (internalFormat === gl.R16F) return getSupportedFormat(gl.RG16F, gl.RG, type)
        if (internalFormat === gl.RG16F) return getSupportedFormat(gl.RGBA16F, gl.RGBA, type)
      }
      return null
    }
    return { internalFormat, format }
  }

  let formatRGBA
  let formatRG
  let formatR
  if (isWebGL2) {
    formatRGBA = getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatTexType)
    formatRG = getSupportedFormat(gl.RG16F, gl.RG, halfFloatTexType)
    formatR = getSupportedFormat(gl.R16F, gl.RED, halfFloatTexType)
  } else {
    formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType)
    formatRG = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType)
    formatR = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType)
  }

  if (!formatRGBA || !formatRG || !formatR) {
    return { start: () => {}, stop: () => {}, destroy: () => {}, resize: () => {}, splatAt: () => {} }
  }

  const ext = {
    formatRGBA,
    formatRG,
    formatR,
    halfFloatTexType,
    supportLinearFiltering,
  }

  if (/Mobi|Android/i.test(navigator.userAgent)) {
    config.DYE_RESOLUTION = Math.min(config.DYE_RESOLUTION, 512)
  }
  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = Math.min(config.DYE_RESOLUTION, 512)
    config.SHADING = false
    config.BLOOM = false
    config.SUNRAYS = false
  }

  function addKeywords(source, keywords) {
    if (!keywords?.length) return source
    return `${keywords.map((k) => `#define ${k}\n`).join('')}${source}`
  }

  function compileShader(type, source, keywords) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, addKeywords(source, keywords))
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
    }
    return shader
  }

  function createProgram(vs, fs) {
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
    }
    return program
  }

  function getUniforms(program) {
    const uniforms = {}
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < count; i += 1) {
      const info = gl.getActiveUniform(program, i)
      uniforms[info.name] = gl.getUniformLocation(program, info.name)
    }
    return uniforms
  }

  class Program {
    constructor(vertexSource, fragmentSource, keywords) {
      this.uniforms = getUniforms(
        createProgram(
          compileShader(gl.VERTEX_SHADER, vertexSource),
          compileShader(gl.FRAGMENT_SHADER, fragmentSource, keywords),
        ),
      )
      this.program = null
      this.vertexSource = vertexSource
      this.fragmentSource = fragmentSource
      this.keywords = keywords
      this._build()
    }

    _build() {
      this.program = createProgram(
        compileShader(gl.VERTEX_SHADER, this.vertexSource),
        compileShader(gl.FRAGMENT_SHADER, this.fragmentSource, this.keywords),
      )
      this.uniforms = getUniforms(this.program)
    }

    bind() {
      gl.useProgram(this.program)
    }
  }

  class Material {
    constructor(vertexSource, fragmentSource) {
      this.vertexSource = vertexSource
      this.fragmentSource = fragmentSource
      this.programs = {}
      this.activeProgram = null
      this.uniforms = {}
    }

    setKeywords(keywords) {
      const key = hashCode(keywords.join(','))
      if (!this.programs[key]) {
        this.programs[key] = createProgram(
          compileShader(gl.VERTEX_SHADER, this.vertexSource),
          compileShader(gl.FRAGMENT_SHADER, this.fragmentSource, keywords),
        )
      }
      if (this.activeProgram !== this.programs[key]) {
        this.activeProgram = this.programs[key]
        this.uniforms = getUniforms(this.activeProgram)
      }
    }

    bind() {
      gl.useProgram(this.activeProgram)
    }
  }

  const baseVertexShader = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `

  const blurVertexShader = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      float offset = 1.33333333;
      vL = vUv - texelSize * offset;
      vR = vUv + texelSize * offset;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `

  const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;
    vec3 linearToGamma (vec3 color) {
      color = max(color, vec3(0.0));
      return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0.0));
    }
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif
      #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
      #endif
      #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
        #ifdef BLOOM
          bloom *= sunrays;
        #endif
      #endif
      #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
      #endif
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `

  const advectionKeywords = ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']

  const programs = {
    blur: new Program(blurVertexShader, `
      precision mediump float;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR;
      uniform sampler2D uTexture;
      void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
      }`),
    copy: new Program(baseVertexShader, `
      precision mediump float; varying vec2 vUv; uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }`),
    clear: new Program(baseVertexShader, `
      precision mediump float; varying vec2 vUv;
      uniform sampler2D uTexture; uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`),
    bloomPrefilter: new Program(baseVertexShader, `
      precision mediump float; varying vec2 vUv; uniform sampler2D uTexture;
      uniform vec3 curve; uniform float threshold;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
      }`),
    bloomBlur: new Program(baseVertexShader, `
      precision mediump float;
      varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture;
      void main () {
        vec4 sum = texture2D(uTexture, vL) + texture2D(uTexture, vR)
                 + texture2D(uTexture, vT) + texture2D(uTexture, vB);
        gl_FragColor = sum * 0.25;
      }`),
    bloomFinal: new Program(baseVertexShader, `
      precision mediump float;
      varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture; uniform float intensity;
      void main () {
        vec4 sum = texture2D(uTexture, vL) + texture2D(uTexture, vR)
                 + texture2D(uTexture, vT) + texture2D(uTexture, vB);
        gl_FragColor = sum * 0.25 * intensity;
      }`),
    sunraysMask: new Program(baseVertexShader, `
      precision highp float; varying vec2 vUv; uniform sampler2D uTexture;
      void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
      }`),
    sunrays: new Program(baseVertexShader, `
      precision highp float; varying vec2 vUv; uniform sampler2D uTexture; uniform float weight;
      #define ITERATIONS 16
      void main () {
        float Density = 0.3; float Decay = 0.95; float Exposure = 0.7;
        vec2 coord = vUv; vec2 dir = vUv - 0.5;
        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0; float color = texture2D(uTexture, vUv).a;
        for (int i = 0; i < ITERATIONS; i++) {
          coord -= dir;
          color += texture2D(uTexture, coord).a * illuminationDecay * weight;
          illuminationDecay *= Decay;
        }
        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
      }`),
    splat: new Program(baseVertexShader, `
      precision highp float; varying vec2 vUv;
      uniform sampler2D uTarget; uniform float aspectRatio;
      uniform vec3 color; uniform vec2 point; uniform float radius;
      void main () {
        vec2 p = vUv - point.xy; p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
      }`),
    advection: new Program(baseVertexShader, `
      precision highp float; varying vec2 vUv;
      uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 texelSize; uniform vec2 dyeTexelSize;
      uniform float dt; uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st); vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        #ifdef MANUAL_FILTERING
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
        #endif
        gl_FragColor = result / (1.0 + dissipation * dt);
        gl_FragColor.a = 1.0;
      }`, advectionKeywords),
    divergence: new Program(baseVertexShader, `
      precision mediump float;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`),
    curl: new Program(baseVertexShader, `
      precision mediump float;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`),
    vorticity: new Program(baseVertexShader, `
      precision highp float;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - L);
        force /= length(force) + 0.0001;
        force *= curl * C; force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`),
    pressure: new Program(baseVertexShader, `
      precision mediump float;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }`),
    gradientSubtract: new Program(baseVertexShader, `
      precision mediump float;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`),
  }

  // Fix vorticity shader typo - should use abs(R)-abs(L) for y component
  programs.vorticity = new Program(baseVertexShader, `
    precision highp float;
    varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C; force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      velocity = min(max(velocity, -1000.0), 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`)

  const displayMaterial = new Material(baseVertexShader, displayShaderSource)

  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
    return (target, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      } else {
        gl.viewport(0, 0, target.width, target.height)
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }
  })()

  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.viewport(0, 0, w, h)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        return id
      },
    }
  }

  function createDoubleFBO(w, h, internalFormat, format, type, param) {
    let read = createFBO(w, h, internalFormat, format, type, param)
    let write = createFBO(w, h, internalFormat, format, type, param)
    return {
      width: w,
      height: h,
      texelSizeX: read.texelSizeX,
      texelSizeY: read.texelSizeY,
      get read() { return read },
      set read(v) { read = v },
      get write() { return write },
      set write(v) { write = v },
      swap() {
        const t = read
        read = write
        write = t
      },
    }
  }

  function resizeFBO(target, w, h, internalFormat, format, type, param) {
    const newFBO = createFBO(w, h, internalFormat, format, type, param)
    programs.copy.bind()
    gl.uniform1i(programs.copy.uniforms.uTexture, target.attach(0))
    blit(newFBO)
    return newFBO
  }

  function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
    if (target.width === w && target.height === h) return target
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param)
    target.write = createFBO(w, h, internalFormat, format, type, param)
    target.width = w
    target.height = h
    target.texelSizeX = 1 / w
    target.texelSizeY = 1 / h
    return target
  }

  function createDitheringTexture() {
    const size = 128
    const data = new Uint8Array(size * size * 3)
    for (let i = 0; i < size * size; i += 1) {
      const v = Math.floor(Math.random() * 255)
      data[i * 3] = v
      data[i * 3 + 1] = v
      data[i * 3 + 2] = v
    }
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, data)
    return { texture, width: size, height: size, attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      return id
    } }
  }

  let dye
  let velocity
  let divergence
  let curl
  let pressure
  let bloom
  let bloomFramebuffers = []
  let sunrays
  let sunraysTemp
  const ditheringTexture = createDitheringTexture()

  function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
    if (aspectRatio < 1) aspectRatio = 1 / aspectRatio
    const min = Math.round(resolution)
    const max = Math.round(resolution * aspectRatio)
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max }
  }

  function initBloomFramebuffers() {
    const res = getResolution(config.BLOOM_RESOLUTION)
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    bloom = createFBO(
      res.width, res.height,
      ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, filtering,
    )
    bloomFramebuffers = []
    for (let i = 0; i < config.BLOOM_ITERATIONS; i += 1) {
      const width = res.width >> (i + 1)
      const height = res.height >> (i + 1)
      if (width < 2 || height < 2) break
      bloomFramebuffers.push(
        createFBO(width, height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, filtering),
      )
    }
  }

  function initSunraysFramebuffers() {
    const res = getResolution(config.SUNRAYS_RESOLUTION)
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    sunrays = createFBO(res.width, res.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, filtering)
    sunraysTemp = createFBO(res.width, res.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, filtering)
  }

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION)
    const dyeRes = getResolution(config.DYE_RESOLUTION)
    const texType = ext.halfFloatTexType
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST

    if (!dye) dye = createDoubleFBO(dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, texType, filtering)
    else dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, texType, filtering)

    if (!velocity) velocity = createDoubleFBO(simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, texType, filtering)
    else velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, texType, filtering)

    divergence = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, texType, gl.NEAREST)
    curl = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, texType, gl.NEAREST)
    pressure = createDoubleFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, texType, gl.NEAREST)

    initBloomFramebuffers()
    initSunraysFramebuffers()
  }

  function updateDisplayKeywords() {
    const keywords = []
    if (config.SHADING) keywords.push('SHADING')
    if (config.BLOOM) keywords.push('BLOOM')
    if (config.SUNRAYS) keywords.push('SUNRAYS')
    displayMaterial.setKeywords(keywords)
  }

  function scaleByPixelRatio(input) {
    return Math.floor(input * (window.devicePixelRatio || 1))
  }

  function resizeCanvas() {
    const width = scaleByPixelRatio(canvas.clientWidth)
    const height = scaleByPixelRatio(canvas.clientHeight)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      return true
    }
    return false
  }

  function correctRadius(radius) {
    const aspectRatio = canvas.width / canvas.height
    return aspectRatio > 1 ? radius * aspectRatio : radius
  }

  function correctDeltaX(delta) {
    const aspectRatio = canvas.width / canvas.height
    return aspectRatio < 1 ? delta * aspectRatio : delta
  }

  function correctDeltaY(delta) {
    const aspectRatio = canvas.width / canvas.height
    return aspectRatio > 1 ? delta / aspectRatio : delta
  }

  function generateColor() {
    const c = hsvToRgb(Math.random(), 1, 1)
    return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 }
  }

  function splat(x, y, dx, dy, color) {
    programs.splat.bind()
    gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0))
    gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height)
    gl.uniform2f(programs.splat.uniforms.point, x, y)
    gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0)
    gl.uniform1f(programs.splat.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100))
    blit(velocity.write)
    velocity.swap()

    programs.splat.bind()
    gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0))
    gl.uniform3f(programs.splat.uniforms.color, color.r, color.g, color.b)
    blit(dye.write)
    dye.swap()
  }

  function multipleSplats(amount) {
    for (let i = 0; i < amount; i += 1) {
      const color = generateColor()
      color.r *= 10
      color.g *= 10
      color.b *= 10
      splat(
        Math.random(),
        Math.random(),
        1000 * (Math.random() - 0.5),
        1000 * (Math.random() - 0.5),
        color,
      )
    }
  }

  function applyBloom(source, destination) {
    if (bloomFramebuffers.length < 2) return
    let last = destination
    gl.disable(gl.BLEND)

    programs.bloomPrefilter.bind()
    const knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001
    gl.uniform3f(programs.bloomPrefilter.uniforms.curve, config.BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee)
    gl.uniform1f(programs.bloomPrefilter.uniforms.threshold, config.BLOOM_THRESHOLD)
    gl.uniform1i(programs.bloomPrefilter.uniforms.uTexture, source.attach(0))
    blit(last)

    programs.bloomBlur.bind()
    for (let i = 0; i < bloomFramebuffers.length; i += 1) {
      const dest = bloomFramebuffers[i]
      gl.uniform2f(programs.bloomBlur.uniforms.texelSize, last.texelSizeX, last.texelSizeY)
      gl.uniform1i(programs.bloomBlur.uniforms.uTexture, last.attach(0))
      blit(dest)
      last = dest
    }

    gl.blendFunc(gl.ONE, gl.ONE)
    gl.enable(gl.BLEND)
    for (let i = bloomFramebuffers.length - 2; i >= 0; i -= 1) {
      const baseTex = bloomFramebuffers[i]
      gl.uniform2f(programs.bloomBlur.uniforms.texelSize, last.texelSizeX, last.texelSizeY)
      gl.uniform1i(programs.bloomBlur.uniforms.uTexture, last.attach(0))
      gl.viewport(0, 0, baseTex.width, baseTex.height)
      blit(baseTex)
      last = baseTex
    }

    gl.disable(gl.BLEND)
    programs.bloomFinal.bind()
    gl.uniform2f(programs.bloomFinal.uniforms.texelSize, last.texelSizeX, last.texelSizeY)
    gl.uniform1i(programs.bloomFinal.uniforms.uTexture, last.attach(0))
    gl.uniform1f(programs.bloomFinal.uniforms.intensity, config.BLOOM_INTENSITY)
    blit(destination)
  }

  function blur(target, temp, iterations) {
    programs.blur.bind()
    for (let i = 0; i < iterations; i += 1) {
      gl.uniform2f(programs.blur.uniforms.texelSize, target.texelSizeX, 0)
      gl.uniform1i(programs.blur.uniforms.uTexture, target.attach(0))
      blit(temp)
      gl.uniform2f(programs.blur.uniforms.texelSize, 0, target.texelSizeY)
      gl.uniform1i(programs.blur.uniforms.uTexture, temp.attach(0))
      blit(target)
    }
  }

  function applySunrays(source, mask, destination) {
    gl.disable(gl.BLEND)
    programs.sunraysMask.bind()
    gl.uniform1i(programs.sunraysMask.uniforms.uTexture, source.attach(0))
    blit(mask)
    programs.sunrays.bind()
    gl.uniform1f(programs.sunrays.uniforms.weight, config.SUNRAYS_WEIGHT)
    gl.uniform1i(programs.sunrays.uniforms.uTexture, mask.attach(0))
    blit(destination)
  }

  function step(dt) {
    gl.disable(gl.BLEND)

    programs.curl.bind()
    gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0))
    blit(curl)

    programs.vorticity.bind()
    gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1))
    gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL)
    gl.uniform1f(programs.vorticity.uniforms.dt, dt)
    blit(velocity.write)
    velocity.swap()

    programs.divergence.bind()
    gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0))
    blit(divergence)

    programs.clear.bind()
    gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0))
    gl.uniform1f(programs.clear.uniforms.value, config.PRESSURE)
    blit(pressure.write)
    pressure.swap()

    programs.pressure.bind()
    gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0))
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i += 1) {
      gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1))
      blit(pressure.write)
      pressure.swap()
    }

    programs.gradientSubtract.bind()
    gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0))
    gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1))
    blit(velocity.write)
    velocity.swap()

    programs.advection.bind()
    gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    if (!ext.supportLinearFiltering) {
      gl.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
    }
    const velocityId = velocity.read.attach(0)
    gl.uniform1i(programs.advection.uniforms.uVelocity, velocityId)
    gl.uniform1i(programs.advection.uniforms.uSource, velocityId)
    gl.uniform1f(programs.advection.uniforms.dt, dt)
    gl.uniform1f(programs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION)
    blit(velocity.write)
    velocity.swap()

    if (!ext.supportLinearFiltering) {
      gl.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
    }
    gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1))
    gl.uniform1f(programs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION)
    blit(dye.write)
    dye.swap()
  }

  function render() {
    if (config.BLOOM) applyBloom(dye.read, bloom)
    if (config.SUNRAYS) {
      applySunrays(dye.read, dye.write, sunrays)
      blur(sunrays, sunraysTemp, 1)
    }

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)

    const width = gl.drawingBufferWidth
    const height = gl.drawingBufferHeight
    displayMaterial.bind()
    if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / width, 1 / height)
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
    if (config.BLOOM) {
      gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1))
      gl.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2))
      gl.uniform2f(displayMaterial.uniforms.ditherScale, width / ditheringTexture.width, height / ditheringTexture.height)
    }
    if (config.SUNRAYS) gl.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3))
    blit(null)
  }

  let rafId = 0
  let lastUpdateTime = Date.now()
  let colorUpdateTimer = 0
  const pointer = {
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    color: generateColor(),
  }
  let pointerReady = false

  function updateColors(dt) {
    if (!config.COLORFUL) return
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1)
      pointer.color = generateColor()
    }
  }

  function splatPointer() {
    const dx = pointer.deltaX * config.SPLAT_FORCE
    const dy = pointer.deltaY * config.SPLAT_FORCE
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color)
  }

  function updateFrame() {
    if (resizeCanvas()) initFramebuffers()

    const now = Date.now()
    let dt = (now - lastUpdateTime) / 1000
    dt = Math.min(dt, 0.016666)
    lastUpdateTime = now

    updateColors(dt)

    if (pointer.moved) {
      pointer.moved = false
      splatPointer()
    }

    step(dt)
    render()
  }

  function animate() {
    updateFrame()
    rafId = requestAnimationFrame(animate)
  }

  updateDisplayKeywords()
  resizeCanvas()
  initFramebuffers()
  multipleSplats(Math.floor(Math.random() * 20) + 5)

  return {
    start() {
      lastUpdateTime = Date.now()
      if (!rafId) rafId = requestAnimationFrame(animate)
    },
    stop() {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
    },
    resize() {
      if (resizeCanvas()) initFramebuffers()
    },
    destroy() {
      this.stop()
    },
    splatAt(clientX, clientY, rect) {
      const dpr = canvas.width / Math.max(rect.width, 1)
      const posX = (clientX - rect.left) * dpr
      const posY = (clientY - rect.top) * dpr

      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / canvas.width
      pointer.texcoordY = 1 - posY / canvas.height

      if (!pointerReady) {
        pointer.prevTexcoordX = pointer.texcoordX
        pointer.prevTexcoordY = pointer.texcoordY
        pointer.color = generateColor()
        pointerReady = true
        return
      }

      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = pointer.deltaX !== 0 || pointer.deltaY !== 0
    },
  }
}
