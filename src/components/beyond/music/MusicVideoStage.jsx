import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { musicClips } from '../../../data/music'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'

const FACE_DWELL_MS = 9000
const TURN_MS = 1850
const DEG = Math.PI / 180
/** Box slots: +X −X +Y −Y +Z −Z. Front (+Z) plays Interstellar, then Night Changes, then Mirrors. */
const CLIP_BY_SLOT = [1, 3, 4, 5, 0, 2]
const SEQUENCE_SLOT = 4
const SEQUENCE_FOLLOW_UPS = [musicClips[6]?.src, musicClips[7]?.src].filter(Boolean)
const UV_INSET = 0.01
const OPPOSITE_SLOT = { 0: 1, 1: 0, 2: 3, 3: 2, 4: 5, 5: 4 }
/** Phone cuboid scale vs desktop (desktop stays 3.2). */
const TOUCH_CUBE_SCALE = 0.78

function facingMaterialSlot(rx, ry) {
  const rxDeg = rx / DEG
  const ryDeg = ry / DEG
  if (rxDeg <= -48) return 2
  if (rxDeg >= 48) return 3
  const a = ((-ryDeg % 360) + 360) % 360
  const side = Math.round(a / 90) % 4
  return [4, 0, 5, 1][side]
}

function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
}

function clipSrc(index) {
  const clip = musicClips[index % musicClips.length]
  return clip?.src || musicClips[0].src
}

function prepMutedVideo(video) {
  if (!video || typeof video.play !== 'function') return
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.autoplay = true
  video.controls = false
  video.preload = 'auto'
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('x5-playsinline', '')
  try {
    video.volume = 0
  } catch {
    /* */
  }
}

function kickPlay(video) {
  if (!video || typeof video.play !== 'function') return
  if (!video.paused) return
  const playPromise = video.play()
  if (playPromise?.catch) playPromise.catch(() => {})
}

function hearVideo(video) {
  if (!video || typeof video.play !== 'function') return
  video.muted = false
  video.defaultMuted = false
  video.removeAttribute('muted')
  try {
    video.volume = 1
  } catch {
    /* */
  }
  // Always call play after unmute — iOS often needs a fresh play() in the gesture.
  const playPromise = video.play()
  if (playPromise?.catch) playPromise.catch(() => {})
}

function queueNextOnFront(video) {
  if (!video) return
  const step = Number(video.dataset.sequenceStep || '0')
  const next = SEQUENCE_FOLLOW_UPS[step]
  if (!next) {
    video.loop = true
    kickPlay(video)
    return
  }
  video.dataset.sequenceStep = String(step + 1)
  video.loop = step + 1 >= SEQUENCE_FOLLOW_UPS.length
  video.src = next
  video.load()
  kickPlay(video)
}

/** Front face unmuted when sound is on; everyone else stays muted + playing (desktop behavior). */
function applyFrontAudio(videos, frontSlot, soundOn, hiddenSlot = -1) {
  videos.forEach((video, slot) => {
    if (!video) return
    if (slot === hiddenSlot) {
      if (!video.paused) video.pause()
      if (!video.muted) prepMutedVideo(video)
      return
    }
    if (soundOn && slot === frontSlot) {
      if (video.muted || video.paused || video.volume < 0.5) hearVideo(video)
    } else {
      if (!video.muted) prepMutedVideo(video)
      kickPlay(video)
    }
  })
}

function VideoCube({ reducedMotion, videosRef, touchLite, lenisRef, soundOnRef }) {
  const root = useRef(null)
  const matsRef = useRef([])
  const texturesRef = useRef(Array(6).fill(null))
  const pose = useRef({
    rx: -10 * DEG,
    ry: -26 * DEG,
    vx: 0,
    vy: 0,
    dragging: false,
    pending: false,
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
  const lastFrontRef = useRef(-1)
  const { gl } = useThree()

  const size = useMemo(() => {
    const w = touchLite ? 3.2 * TOUCH_CUBE_SCALE : 3.2
    const h = w * (9 / 16)
    const d = w * 0.46
    return [w, h, d]
  }, [touchLite])
  const maxAniso = gl.capabilities.getMaxAnisotropy()

  useEffect(() => {
    const textures = texturesRef.current
    return () => {
      textures.forEach((texture) => texture?.dispose())
    }
  }, [])

  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = touchLite ? 'none' : 'pan-y'
    el.style.cursor = 'grab'

    const unlockAudio = () => {
      soundOnRef.current = true
      applyFrontAudio(
        videosRef.current,
        facingMaterialSlot(pose.current.rx, pose.current.ry),
        true,
      )
    }

    const DRAG_THRESHOLD = touchLite ? 6 : 12
    const VERTICAL_SCROLL_RATIO = touchLite ? 3.2 : 2.5

    const stopLenis = () => {
      if (!touchLite) return
      try {
        lenisRef?.current?.stop?.()
      } catch {
        /* */
      }
    }

    const startLenis = () => {
      if (!touchLite) return
      try {
        lenisRef?.current?.start?.()
      } catch {
        /* */
      }
    }

    const onDown = (event) => {
      if (event.pointerType === 'touch' && event.isPrimary === false) return
      unlockAudio()
      const p = pose.current
      p.pending = true
      p.dragging = false
      p.vx = 0
      p.vy = 0
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = performance.now()
    }

    const onMove = (event) => {
      const p = pose.current
      if (!p.pending && !p.dragging) return
      const now = performance.now()
      const dx = event.clientX - p.lastX
      const dy = event.clientY - p.lastY

      if (p.pending && !p.dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        if (!touchLite && Math.abs(dy) >= Math.abs(dx) * VERTICAL_SCROLL_RATIO) {
          p.pending = false
          p.dragging = false
          return
        }
        p.dragging = true
        p.pending = false
        stopLenis()
        auto.current.turning = false
        auto.current.dwellUntil = now + FACE_DWELL_MS * 1.5
        el.style.cursor = 'grabbing'
        try {
          el.setPointerCapture(event.pointerId)
        } catch {
          /* */
        }
      }

      if (!p.dragging) return

      event.preventDefault()
      const step = Math.max(8, now - p.lastT) / 1000
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = now
      const sens = touchLite ? 0.0084 : 0.0068
      p.ry += dx * sens
      p.rx -= dy * sens
      p.vy = (dx / step) * sens
      p.vx = (-dy / step) * sens
    }

    const onUp = () => {
      const p = pose.current
      const wasDragging = p.dragging
      p.pending = false
      p.dragging = false
      p.vy = Math.max(-3.8, Math.min(3.8, p.vy))
      p.vx = Math.max(-3.8, Math.min(3.8, p.vx))
      auto.current.dwellUntil = performance.now() + FACE_DWELL_MS
      el.style.cursor = 'grab'
      if (wasDragging) startLenis()
      if (soundOnRef.current) {
        applyFrontAudio(
          videosRef.current,
          facingMaterialSlot(pose.current.rx, pose.current.ry),
          true,
        )
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove, { passive: false })
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('lostpointercapture', onUp)
    window.addEventListener('pointerdown', unlockAudio, { passive: true })
    window.addEventListener('touchstart', unlockAudio, { passive: true })

    return () => {
      startLenis()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', onUp)
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }
  }, [gl, videosRef, touchLite, lenisRef, soundOnRef])

  useFrame((_, delta) => {
    const cube = root.current
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
    cube.position.y = Math.sin(now * 0.00088) * 0.12

    const frontSlot = facingMaterialSlot(p.rx, p.ry)
    const frontChanged = lastFrontRef.current !== frontSlot
    lastFrontRef.current = frontSlot

    videosRef.current.forEach((video, slot) => {
      if (!video) return
      const hidden = !a.turning && slot === OPPOSITE_SLOT[frontSlot]
      if (hidden) {
        if (!video.paused) video.pause()
        return
      }
      kickPlay(video)
      const mat = matsRef.current[slot]
      if (!mat) return
      const hasFrame = video.readyState >= 2 && video.videoWidth > 0 && video.currentTime > 0
      if (hasFrame && !texturesRef.current[slot]) {
        const texture = new THREE.VideoTexture(video)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.generateMipmaps = false
        texture.anisotropy = Math.min(touchLite ? 2 : 4, maxAniso)
        texture.offset.set(UV_INSET, UV_INSET)
        texture.repeat.set(1 - UV_INSET * 2, 1 - UV_INSET * 2)
        texturesRef.current[slot] = texture
        mat.map = texture
        mat.color.set('#ffffff')
        mat.needsUpdate = true
      } else if (texturesRef.current[slot]) {
        texturesRef.current[slot].needsUpdate = true
      }
    })

    // Sync audio every frame when unlocked; force when the front face changes.
    if (soundOnRef.current || frontChanged) {
      applyFrontAudio(
        videosRef.current,
        frontSlot,
        soundOnRef.current,
        a.turning ? -1 : OPPOSITE_SLOT[frontSlot],
      )
    }
  })

  return (
    <group ref={root}>
      <mesh frustumCulled={false}>
        <boxGeometry args={size} />
        {CLIP_BY_SLOT.map((_, slot) => (
          <meshBasicMaterial
            key={slot}
            ref={(node) => {
              matsRef.current[slot] = node
            }}
            attach={`material-${slot}`}
            color="#0b0b0b"
            toneMapped={false}
          />
        ))}
      </mesh>
    </group>
  )
}

function MusicVideoStage() {
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const lenisRef = useLenis()
  const videosRef = useRef([])
  const soundOnRef = useRef(false)
  const voidRef = useRef(null)
  const sources = useMemo(() => CLIP_BY_SLOT.map((clipIndex) => clipSrc(clipIndex)), [])
  const touchLite = Boolean(isTouchLike)

  useEffect(() => {
    const kickMuted = () => {
      if (soundOnRef.current) return
      videosRef.current.forEach((video) => {
        if (!video) return
        prepMutedVideo(video)
        kickPlay(video)
      })
    }

    const unlockFromScreen = () => {
      soundOnRef.current = true
      // VideoCube applies the real front face from pose; this kickstarts play in the gesture.
      videosRef.current.forEach((video) => {
        if (!video) return
        kickPlay(video)
      })
      const front = videosRef.current[SEQUENCE_SLOT]
      if (front) hearVideo(front)
    }

    kickMuted()
    window.addEventListener('pointerdown', unlockFromScreen, { passive: true })
    window.addEventListener('touchstart', unlockFromScreen, { passive: true })
    window.addEventListener('pageshow', kickMuted)

    const voidEl = voidRef.current
    voidEl?.addEventListener('pointerdown', unlockFromScreen, { passive: true })
    voidEl?.addEventListener('touchstart', unlockFromScreen, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', unlockFromScreen)
      window.removeEventListener('touchstart', unlockFromScreen)
      window.removeEventListener('pageshow', kickMuted)
      voidEl?.removeEventListener('pointerdown', unlockFromScreen)
      voidEl?.removeEventListener('touchstart', unlockFromScreen)
    }
  }, [])

  return (
    <section ref={voidRef} className="music-void" role="region" aria-label="Music cube">
      <div className="music-video-bank" aria-hidden="true">
        {sources.map((src, slot) => (
          <video
            key={`cube-face-${slot}`}
            ref={(node) => {
              videosRef.current[slot] = node
              if (!node) return
              prepMutedVideo(node)
              node.loop = slot !== SEQUENCE_SLOT
              if (slot === SEQUENCE_SLOT && !node.dataset.sequenceBound) {
                node.dataset.sequenceBound = '1'
                node.addEventListener('ended', () => queueNextOnFront(node))
              }
              kickPlay(node)
            }}
            className="music-video-bank__clip"
            src={src}
            muted
            loop={slot !== SEQUENCE_SLOT}
            autoPlay
            playsInline
            preload="auto"
            width={320}
            height={180}
            disablePictureInPicture
            controls={false}
          />
        ))}
      </div>
      <div className="music-scene music-scene--webgl">
        <WebGLErrorBoundary fallback={<div className="music-cube-fallback" aria-hidden />}>
          <Canvas
            className="music-cube-canvas"
            dpr={touchLite ? [1, 1.25] : [1, 1.5]}
            events={() => ({ enabled: false })}
            gl={{
              antialias: true,
              alpha: true,
              premultipliedAlpha: false,
              powerPreference: touchLite ? 'default' : 'high-performance',
              stencil: false,
              depth: true,
            }}
            camera={{ position: [0, 0.12, 5.35], fov: 34, near: 0.1, far: 40 }}
            style={{ width: '100%', height: '100%', touchAction: touchLite ? 'none' : 'pan-y' }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0)
              gl.outputColorSpace = THREE.SRGBColorSpace
              gl.toneMapping = THREE.NoToneMapping
            }}
          >
            <VideoCube
              reducedMotion={Boolean(prefersReducedMotion)}
              videosRef={videosRef}
              touchLite={touchLite}
              lenisRef={lenisRef}
              soundOnRef={soundOnRef}
            />
          </Canvas>
        </WebGLErrorBoundary>
        <div className="music-cube__shadow" aria-hidden />
      </div>
    </section>
  )
}

export default MusicVideoStage
