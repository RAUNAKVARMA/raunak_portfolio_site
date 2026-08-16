import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useVideoTexture } from '@react-three/drei'
import * as THREE from 'three'
import { musicClips } from '../../../data/music'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'

/** How long the front face stays before the cube turns to the next side. */
const FACE_DWELL_MS = 9000
const TURN_MS = 1850
const DEG = Math.PI / 180
/** Inset video UVs so face-edge texels don’t flash as thin seams. */
const UV_INSET = 0.006

/** Box material slot order in three.js: +X −X +Y −Y +Z −Z */
const CLIP_BY_SLOT = [1, 3, 4, 5, 0, 2] // right, left, top, bottom, front, back

function facingMaterialSlot(rx, ry) {
  const rxDeg = rx / DEG
  const ryDeg = ry / DEG
  if (rxDeg <= -48) return 2 // top (+Y)
  if (rxDeg >= 48) return 3 // bottom (−Y)
  const a = ((-ryDeg % 360) + 360) % 360
  const side = Math.round(a / 90) % 4 // front, right, back, left
  return [4, 0, 5, 1][side]
}

function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
}

function clipSrc(index) {
  const clip = musicClips[index % musicClips.length]
  return clip?.src || musicClips[0].src
}

/** iOS/Android: force muted inline playback attributes on the HTMLVideoElement. */
function prepMutedVideo(video) {
  if (!video || typeof video.play !== 'function') return
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('x5-playsinline', '')
  video.loop = true
  video.controls = false
  try {
    video.volume = 0
  } catch {
    /* */
  }
}

function kickPlay(video) {
  if (!video || typeof video.play !== 'function') return
  if (!video.paused) return
  const p = video.play()
  if (p?.catch) p.catch(() => {})
}

/**
 * Unlock front-face audio inside a user gesture (required on iOS).
 * Returns true when a face was unmuted.
 */
function unlockFrontAudio(mats, frontSlot) {
  if (!Array.isArray(mats)) return false
  let unlocked = false
  mats.forEach((mat, slot) => {
    const video = mat?.map?.image
    if (!video || typeof video.play !== 'function') return
    if (slot === frontSlot) {
      video.muted = false
      video.defaultMuted = false
      video.removeAttribute('muted')
      try {
        video.volume = 1
      } catch {
        /* */
      }
      const p = video.play()
      if (p?.catch) p.catch(() => {})
      unlocked = true
    } else {
      video.muted = true
      video.defaultMuted = true
      video.setAttribute('muted', '')
      try {
        video.volume = 0
      } catch {
        /* */
      }
      kickPlay(video)
    }
  })
  return unlocked
}

function FaceMaterial({ src, slot }) {
  const texture = useVideoTexture(src, {
    unsuspend: 'canplay',
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
  })

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.anisotropy = 1
    texture.offset.set(UV_INSET, UV_INSET)
    texture.repeat.set(1 - UV_INSET * 2, 1 - UV_INSET * 2)
    texture.needsUpdate = true

    const video = texture.image
    prepMutedVideo(video)
    kickPlay(video)
  }, [texture])

  return (
    <meshBasicMaterial
      attach={`material-${slot}`}
      map={texture}
      toneMapped={false}
      side={THREE.FrontSide}
      depthWrite
      depthTest
      polygonOffset
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-1}
    />
  )
}

function applyFrontAudio(mats, frontSlot, soundOn) {
  if (!Array.isArray(mats)) return
  mats.forEach((mat, slot) => {
    const video = mat?.map?.image
    if (!video || typeof video.muted !== 'boolean') return

    const shouldHear = Boolean(soundOn && slot === frontSlot)
    if (shouldHear) {
      if (video.muted) {
        video.muted = false
        video.defaultMuted = false
        video.removeAttribute('muted')
        try {
          video.volume = 1
        } catch {
          /* */
        }
      }
    } else if (!video.muted) {
      video.muted = true
      video.defaultMuted = true
      video.setAttribute('muted', '')
      try {
        video.volume = 0
      } catch {
        /* */
      }
    }
    kickPlay(video)
  })
}

function VideoCube({ reducedMotion }) {
  const mesh = useRef(null)
  const soundOn = useRef(false)
  const pose = useRef({
    rx: -10 * DEG,
    ry: -26 * DEG,
    vx: 0,
    vy: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
  })
  const display = useRef({ rx: -10 * DEG, ry: -26 * DEG })
  const auto = useRef({
    dwellUntil: performance.now() + FACE_DWELL_MS,
    turning: false,
    turnFrom: 0,
    turnTo: 0,
    turnStart: 0,
  })
  const { gl } = useThree()

  const size = useMemo(() => {
    const w = 3.2
    const h = w * (9 / 16)
    const d = w * 0.46
    return [w, h, d]
  }, [])

  const sources = useMemo(
    () => CLIP_BY_SLOT.map((clipIndex) => clipSrc(clipIndex)),
    [],
  )

  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'pan-y'
    el.style.cursor = 'grab'

    /** Must unmute + play inside the same user gesture (iOS). */
    const unlockAudio = () => {
      soundOn.current = true
      const cube = mesh.current
      if (!cube) return
      const frontSlot = facingMaterialSlot(pose.current.rx, pose.current.ry)
      unlockFrontAudio(cube.material, frontSlot)
    }

    const kickAllMuted = () => {
      const cube = mesh.current
      const mats = cube?.material
      if (!Array.isArray(mats)) return
      mats.forEach((mat) => {
        const video = mat?.map?.image
        if (!video) return
        if (!soundOn.current) prepMutedVideo(video)
        kickPlay(video)
      })
    }

    const onDown = (event) => {
      if (event.pointerType === 'touch' && event.isPrimary === false) return
      unlockAudio()
      kickAllMuted()

      const p = pose.current
      p.dragging = true
      p.vx = 0
      p.vy = 0
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = performance.now()
      auto.current.turning = false
      auto.current.dwellUntil = performance.now() + FACE_DWELL_MS * 1.5
      el.style.cursor = 'grabbing'
      try {
        el.setPointerCapture(event.pointerId)
      } catch {
        /* */
      }
    }

    const onMove = (event) => {
      const p = pose.current
      if (!p.dragging) return
      const now = performance.now()
      const dx = event.clientX - p.lastX
      const dy = event.clientY - p.lastY
      if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) * 1.35) {
        p.dragging = false
        el.style.cursor = 'grab'
        try {
          el.releasePointerCapture(event.pointerId)
        } catch {
          /* */
        }
        return
      }
      event.preventDefault()
      const step = Math.max(8, now - p.lastT) / 1000
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = now
      p.ry += dx * 0.0068
      p.rx -= dy * 0.0068
      p.rx = Math.max(-68 * DEG, Math.min(68 * DEG, p.rx))
      p.vy = (dx / step) * 0.0068
      p.vx = (-dy / step) * 0.0068
    }

    const onUp = () => {
      const p = pose.current
      p.dragging = false
      p.vy = Math.max(-3.8, Math.min(3.8, p.vy))
      p.vx = Math.max(-3.8, Math.min(3.8, p.vx))
      auto.current.dwellUntil = performance.now() + FACE_DWELL_MS
      el.style.cursor = 'grab'
    }

    const onPageGesture = () => {
      unlockAudio()
      kickAllMuted()
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove, { passive: false })
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('lostpointercapture', onUp)
    window.addEventListener('pointerdown', onPageGesture, { passive: true })
    window.addEventListener('touchstart', onPageGesture, { passive: true })

    // Keep muted faces alive even before the first tap
    const keepAlive = window.setInterval(kickAllMuted, 1200)
    kickAllMuted()

    return () => {
      window.clearInterval(keepAlive)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', onUp)
      window.removeEventListener('pointerdown', onPageGesture)
      window.removeEventListener('touchstart', onPageGesture)
    }
  }, [gl])

  useFrame((_, delta) => {
    const cube = mesh.current
    if (!cube) return

    const now = performance.now()
    const p = pose.current
    const a = auto.current
    const d = display.current
    const dt = Math.min(0.05, delta)

    const beginTurn = () => {
      if (a.turning) return
      if (reducedMotion) {
        p.ry -= Math.PI / 2
        a.dwellUntil = now + FACE_DWELL_MS
        return
      }
      a.turning = true
      a.turnFrom = p.ry
      a.turnTo = p.ry - Math.PI / 2
      a.turnStart = now
      p.vx = 0
      p.vy = 0
    }

    if (a.turning) {
      const t = Math.min(1, (now - a.turnStart) / TURN_MS)
      p.ry = a.turnFrom + (a.turnTo - a.turnFrom) * easeInOutQuint(t)
      if (t >= 1) {
        a.turning = false
        p.ry = a.turnTo
        a.dwellUntil = now + FACE_DWELL_MS
      }
    } else if (!p.dragging && !reducedMotion) {
      p.ry += p.vy * dt
      p.rx += p.vx * dt
      p.rx = Math.max(-68 * DEG, Math.min(68 * DEG, p.rx))
      p.vy *= Math.pow(0.08, dt)
      p.vx *= Math.pow(0.08, dt)
      if (Math.abs(p.vy) < 0.008) p.vy = 0
      if (Math.abs(p.vx) < 0.008) p.vx = 0
      if (now >= a.dwellUntil) beginTurn()
    }

    const follow = 1 - Math.exp(-(p.dragging || a.turning ? 18 : 11) * dt)
    d.rx += (p.rx - d.rx) * follow
    d.ry += (p.ry - d.ry) * follow
    cube.rotation.x = d.rx
    cube.rotation.y = d.ry

    const frontSlot = facingMaterialSlot(p.rx, p.ry)
    applyFrontAudio(cube.material, frontSlot, soundOn.current)
  })

  return (
    <mesh ref={mesh} castShadow={false} receiveShadow={false} frustumCulled={false}>
      <boxGeometry args={size} />
      {sources.map((src, slot) => (
        <Suspense key={`${src}-${slot}`} fallback={<meshBasicMaterial attach={`material-${slot}`} color="#0a0a0a" />}>
          <FaceMaterial src={src} slot={slot} />
        </Suspense>
      ))}
    </mesh>
  )
}

function MusicVideoStage() {
  const { prefersReducedMotion } = useReducedMotionProfile()

  return (
    <section className="music-void" role="region" aria-label="Music cube">
      <div className="music-scene music-scene--webgl">
        <WebGLErrorBoundary
          fallback={<div className="music-cube-fallback" aria-hidden />}
        >
          <Canvas
            className="music-cube-canvas"
            dpr={[1, 1.75]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            camera={{ position: [0, 0.12, 5.35], fov: 34, near: 0.1, far: 40 }}
            style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0)
              gl.outputColorSpace = THREE.SRGBColorSpace
              gl.toneMapping = THREE.NoToneMapping
            }}
          >
            <Suspense fallback={null}>
              <VideoCube reducedMotion={Boolean(prefersReducedMotion)} />
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
        <div className="music-cube__shadow" aria-hidden />
      </div>
    </section>
  )
}

export default MusicVideoStage
