import { useEffect, useRef } from 'react'
import { musicClips } from '../../../data/music'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'

const SIDE_FACES = ['front', 'right', 'back', 'left']
const FACES = [...SIDE_FACES, 'top', 'bottom']
/** How long the front face stays before the cube turns to the next side. */
const FACE_DWELL_MS = 8500
const TURN_MS = 1200

function clipIndexForFace(face) {
  if (face === 'top') return musicClips.length > 4 ? 4 : 0
  if (face === 'bottom') return musicClips.length > 5 ? 5 : 0
  const i = SIDE_FACES.indexOf(face)
  return i < 0 ? 0 : i % Math.min(4, musicClips.length)
}

function facingFace(rx, ry) {
  if (rx <= -48) return 'top'
  if (rx >= 48) return 'bottom'
  const a = ((-ry % 360) + 360) % 360
  return SIDE_FACES[Math.round(a / 90) % 4]
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function MusicVideoStage() {
  const { prefersReducedMotion } = useReducedMotionProfile()
  const sceneRef = useRef(null)
  const cubeRef = useRef(null)
  const videosRef = useRef({})
  const soundOn = useRef(false)
  const pose = useRef({
    rx: -10,
    ry: -26,
    vx: 0,
    vy: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
  })
  const auto = useRef({
    dwellUntil: 0,
    turning: false,
    turnFrom: 0,
    turnTo: 0,
    turnStart: 0,
  })

  useEffect(() => {
    const cube = cubeRef.current
    const scene = sceneRef.current
    if (!cube || !scene) return undefined

    const videos = () => FACES.map((face) => videosRef.current[face]).filter(Boolean)

    const applySound = () => {
      const front = facingFace(pose.current.rx, pose.current.ry)
      videos().forEach((video) => {
        const mute = !(soundOn.current && video.dataset.face === front)
        if (video.muted !== mute) {
          video.muted = mute
          video.defaultMuted = mute
        }
        if (!mute && video.paused) video.play()?.catch(() => {})
      })
    }

    const applyPose = () => {
      const p = pose.current
      cube.style.transform = `rotateX(${p.rx}deg) rotateY(${p.ry}deg)`
      applySound()
    }

    const beginTurn = () => {
      if (prefersReducedMotion) {
        pose.current.ry -= 90
        auto.current.dwellUntil = performance.now() + FACE_DWELL_MS
        applyPose()
        return
      }
      const a = auto.current
      if (a.turning) return
      a.turning = true
      a.turnFrom = pose.current.ry
      a.turnTo = pose.current.ry - 90
      a.turnStart = performance.now()
      pose.current.vx = 0
      pose.current.vy = 0
    }

    videos().forEach((video) => {
      video.muted = true
      video.playsInline = true
      video.loop = true
      video.play()?.catch(() => {})
    })
    auto.current.dwellUntil = performance.now() + FACE_DWELL_MS
    applyPose()

    const unmute = () => {
      soundOn.current = true
      applySound()
    }

    let raf = 0
    let last = performance.now()

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const p = pose.current
      const a = auto.current

      if (a.turning) {
        const t = Math.min(1, (now - a.turnStart) / TURN_MS)
        p.ry = a.turnFrom + (a.turnTo - a.turnFrom) * easeInOutCubic(t)
        if (t >= 1) {
          a.turning = false
          p.ry = a.turnTo
          a.dwellUntil = now + FACE_DWELL_MS
        }
      } else if (!p.dragging && !prefersReducedMotion) {
        p.ry += p.vy * dt
        p.rx += p.vx * dt
        p.vy *= Math.pow(0.12, dt)
        p.vx *= Math.pow(0.12, dt)
        if (Math.abs(p.vy) < 0.4) p.vy = 0
        if (Math.abs(p.vx) < 0.4) p.vx = 0

        if (now >= a.dwellUntil) beginTurn()
      }

      applyPose()
    }

    raf = requestAnimationFrame(tick)

    const onDown = (event) => {
      const p = pose.current
      p.dragging = true
      p.vx = 0
      p.vy = 0
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = performance.now()
      auto.current.turning = false
      auto.current.dwellUntil = performance.now() + FACE_DWELL_MS * 1.5
      try {
        scene.setPointerCapture(event.pointerId)
      } catch {
        /* */
      }
    }

    const onMove = (event) => {
      const p = pose.current
      if (!p.dragging) return
      event.preventDefault()
      const now = performance.now()
      const dx = event.clientX - p.lastX
      const dy = event.clientY - p.lastY
      const step = Math.max(8, now - p.lastT) / 1000
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = now
      p.ry += dx * 0.42
      p.rx -= dy * 0.42
      p.vy = (dx / step) * 0.42
      p.vx = (-dy / step) * 0.42
      applyPose()
    }

    const onUp = () => {
      const p = pose.current
      p.dragging = false
      p.vy = Math.max(-260, Math.min(260, p.vy))
      p.vx = Math.max(-260, Math.min(260, p.vx))
      auto.current.dwellUntil = performance.now() + FACE_DWELL_MS
    }

    scene.addEventListener('pointerdown', onDown)
    scene.addEventListener('pointermove', onMove, { passive: false })
    scene.addEventListener('pointerup', onUp)
    scene.addEventListener('pointercancel', onUp)
    scene.addEventListener('lostpointercapture', onUp)
    window.addEventListener('pointerdown', unmute, { once: true })

    return () => {
      cancelAnimationFrame(raf)
      scene.removeEventListener('pointerdown', onDown)
      scene.removeEventListener('pointermove', onMove)
      scene.removeEventListener('pointerup', onUp)
      scene.removeEventListener('pointercancel', onUp)
      scene.removeEventListener('lostpointercapture', onUp)
      window.removeEventListener('pointerdown', unmute)
    }
  }, [prefersReducedMotion])

  return (
    <section className="music-void" role="region" aria-label="Music cube">
      <div ref={sceneRef} className="music-scene" data-lenis-prevent>
        <div ref={cubeRef} className="music-cube">
          {FACES.map((face) => (
            <div key={face} className={`music-cube__face music-cube__face--${face}`}>
              <video
                ref={(node) => {
                  videosRef.current[face] = node
                }}
                className="music-media__video"
                data-face={face}
                src={musicClips[clipIndexForFace(face)].src}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                controls={false}
                disablePictureInPicture
              />
            </div>
          ))}
        </div>
        <div className="music-cube__shadow" aria-hidden />
      </div>
    </section>
  )
}

export default MusicVideoStage
