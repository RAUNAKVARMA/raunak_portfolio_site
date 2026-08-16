import { useEffect, useRef } from 'react'
import { musicClips } from '../../../data/music'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'

const SIDE_FACES = ['front', 'right', 'back', 'left']
const FACES = [...SIDE_FACES, 'top']

function clipIndexForFace(face) {
  const i = SIDE_FACES.indexOf(face)
  return i < 0 ? 0 : i % musicClips.length
}

function facingSide(ry) {
  const a = ((-ry % 360) + 360) % 360
  return SIDE_FACES[Math.round(a / 90) % 4]
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

  useEffect(() => {
    const cube = cubeRef.current
    const scene = sceneRef.current
    if (!cube || !scene) return undefined

    const videos = () => FACES.map((face) => videosRef.current[face]).filter(Boolean)

    const applySound = () => {
      const front = facingSide(pose.current.ry)
      videos().forEach((video) => {
        const mute = !(soundOn.current && video.dataset.face === front)
        if (video.muted !== mute) {
          video.muted = mute
          video.defaultMuted = mute
        }
      })
    }

    videos().forEach((video) => {
      video.muted = true
      video.playsInline = true
      video.loop = true
      video.play()?.catch(() => {})
    })

    const unmute = () => {
      soundOn.current = true
      applySound()
    }

    const applyPose = () => {
      const p = pose.current
      p.rx = Math.max(-38, Math.min(28, p.rx))
      cube.style.transform = `rotateX(${p.rx}deg) rotateY(${p.ry}deg)`
      applySound()
    }

    applyPose()

    let raf = 0
    let last = performance.now()

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const p = pose.current
      if (!p.dragging && !prefersReducedMotion) {
        p.ry += p.vy * dt
        p.rx += p.vx * dt
        p.vy *= Math.pow(0.12, dt)
        p.vx *= Math.pow(0.12, dt)
        if (Math.abs(p.vy) < 0.4) p.vy = 0
        if (Math.abs(p.vx) < 0.4) p.vx = 0
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
      const dt = Math.max(8, now - p.lastT) / 1000
      p.lastX = event.clientX
      p.lastY = event.clientY
      p.lastT = now
      p.ry += dx * 0.42
      p.rx -= dy * 0.28
      p.vy = (dx / dt) * 0.42
      p.vx = (-dy / dt) * 0.28
      applyPose()
    }

    const onUp = () => {
      const p = pose.current
      p.dragging = false
      p.vy = Math.max(-220, Math.min(220, p.vy))
      p.vx = Math.max(-120, Math.min(120, p.vx))
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
          <div className="music-cube__face music-cube__face--bottom" aria-hidden />
        </div>
        <div className="music-cube__shadow" aria-hidden />
      </div>
    </section>
  )
}

export default MusicVideoStage
