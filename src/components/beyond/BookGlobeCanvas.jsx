import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { readingCoverUrls, readingShelf } from '../../data/reading'
import WebGLErrorBoundary from '../ui/WebGLErrorBoundary'

/**
 * Spine-hinged fan (matches the recording):
 * rotateY(i * 360/n) with meshes offset by width/2 onto a shared axis.
 */
const COVER_W = 1.2
const COVER_H = 1.85
const CRUISE = 0.55

// Warm R3F texture cache as soon as this module loads
readingCoverUrls.forEach((url) => {
  try {
    useLoader.preload(THREE.TextureLoader, url)
  } catch {
    /* */
  }
})

function FanCovers({ books }) {
  const urls = useMemo(
    () => books.map((book) => book.cover).filter(Boolean),
    [books],
  )
  const textures = useLoader(THREE.TextureLoader, urls)

  useEffect(() => {
    const list = Array.isArray(textures) ? textures : [textures]
    list.forEach((tex) => {
      if (!tex) return
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 4
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.needsUpdate = true
    })
  }, [textures])

  const items = useMemo(() => {
    const count = books.length
    const list = Array.isArray(textures) ? textures : [textures]
    return books.map((book, i) => ({
      key: book.id,
      book,
      texture: list[i],
      rotationY: (i / count) * Math.PI * 2,
    }))
  }, [books, textures])

  return (
    <group>
      {items.map((item) => (
        <group key={item.key} rotation={[0, item.rotationY, 0]}>
          <mesh position={[COVER_W * 0.5, 0, 0]} frustumCulled={false}>
            <planeGeometry args={[COVER_W, COVER_H]} />
            <meshBasicMaterial
              map={item.texture}
              toneMapped={false}
              side={THREE.DoubleSide}
              depthWrite
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FanScene({ books, reducedMotion, active }) {
  const root = useRef(null)
  const spin = useRef({
    y: 0.35,
    vy: CRUISE,
    dragging: false,
    lastX: 0,
  })
  const { gl, camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0.55, 4.8)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'none'
    el.style.cursor = 'grab'

    const onDown = (event) => {
      if (event.pointerType === 'touch' && event.isPrimary === false) return
      const s = spin.current
      s.dragging = true
      s.vy = 0
      s.lastX = event.clientX
      el.style.cursor = 'grabbing'
      try {
        el.setPointerCapture(event.pointerId)
      } catch {
        /* */
      }
    }

    const onMove = (event) => {
      const s = spin.current
      if (!s.dragging) return
      const dx = event.clientX - s.lastX
      s.lastX = event.clientX
      s.y += dx * 0.007
      s.vy = dx * 0.015
    }

    const onUp = () => {
      spin.current.dragging = false
      el.style.cursor = 'grab'
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('lostpointercapture', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', onUp)
    }
  }, [gl])

  useFrame((_, delta) => {
    if (!root.current || !active) return
    const s = spin.current
    const dt = Math.min(0.05, delta)

    if (!s.dragging && !reducedMotion) {
      s.y += s.vy * dt
      s.vy += (CRUISE - s.vy) * (1 - Math.exp(-1.6 * dt))
    }

    root.current.rotation.set(-0.2, s.y, 0)
  })

  return (
    <group ref={root}>
      <FanCovers books={books} />
    </group>
  )
}

function BookGlobeCanvas({
  books = readingShelf,
  active = true,
  reducedMotion = false,
  className = '',
}) {
  return (
    <div className={`book-globe ${className}`.trim()} aria-hidden={!active}>
      <WebGLErrorBoundary fallback={<div className="book-globe__fallback" aria-hidden />}>
        <Canvas
          className="book-globe__canvas"
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          camera={{ position: [0, 0.55, 4.8], fov: 42, near: 0.1, far: 40 }}
          style={{ width: '100%', height: '100%', touchAction: 'none', background: '#000' }}
          frameloop={active ? 'always' : 'demand'}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 1)
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.toneMapping = THREE.NoToneMapping
          }}
        >
          <Suspense fallback={null}>
            <FanScene books={books} reducedMotion={reducedMotion} active={active} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  )
}

export default BookGlobeCanvas
