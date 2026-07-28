import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createVortexMaterial } from '../../../lib/vortexDistortionShader'
import { artScrollState } from './artScrollState'

/** Full-bleed panels — stacked into one continuous strip (VL Canyon scroll) */
const PANELS = [
  { src: '/images/art-vortex-concept.png', eyebrow: 'Beyond Work — Design', title: 'Concept Form' },
  { src: '/images/art-vortex-lambo.png', eyebrow: 'Beyond Work — Cars', title: 'Velocity' },
  { src: '/images/art-canyon-organic.png', eyebrow: 'Beyond Work — Texture', title: 'Organic Field' },
  { src: '/images/art-sketch-1.png', eyebrow: 'Beyond Work — Art', title: 'Graphite Study I' },
  { src: '/images/art-sketch-2.png', eyebrow: 'Beyond Work — Art', title: 'Graphite Study II' },
  { src: '/images/art-vortex-astro.png', eyebrow: 'Beyond Work — Space', title: 'Night Watch' },
]

const SIZE = 1600
/** Slow auto downward crawl through the strip */
const AUTO_PAGE_SPEED = 0.065

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawCaption(ctx, y, h, width, eyebrow, title) {
  const pillW = Math.min(width * 0.44, 500)
  const pillH = 62
  const px = (width - pillW) / 2
  const py = y + h - 140

  ctx.save()
  ctx.fillStyle = 'rgba(8, 10, 8, 0.55)'
  roundRect(ctx, px, py, pillW, pillH, 32)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  roundRect(ctx, px, py, pillW, pillH, 32)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '500 13px ui-monospace, Menlo, monospace'
  ctx.fillText(`${eyebrow.toUpperCase()} — ${title.toUpperCase()}`, width / 2, py + pillH / 2)
  ctx.restore()
}

function drawVerticalWord(ctx, y, h, width, word = 'DRAWING') {
  // Very soft — strong letters shred into streaks under any warp
  ctx.save()
  ctx.translate(width / 2, y + h / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.font = `900 ${Math.floor(width * 0.16)}px Arial Black, Impact, sans-serif`
  ctx.fillText(word, 0, 0)
  ctx.restore()
}

async function buildStripAtlas(maxAniso) {
  const loaded = await Promise.all(
    PANELS.map(async (p) => {
      try {
        return { ...p, img: await loadImage(p.src) }
      } catch {
        return null
      }
    }),
  )
  const panels = loaded.filter(Boolean)
  if (!panels.length) throw new Error('No panels')

  const width = SIZE
  const pageH = SIZE
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = pageH * panels.length
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('No 2d')

  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  panels.forEach((panel, i) => {
    const y = i * pageH
    const { img } = panel
    const scale = Math.max(width / img.width, pageH / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    // Lift dark photos so the canyon warp stays rich (VL recording is bright)
    ctx.filter = 'contrast(1.12) saturate(1.2) brightness(1.08)'
    ctx.drawImage(img, (width - dw) / 2, y + (pageH - dh) / 2, dw, dh)
    ctx.filter = 'none'
    drawVerticalWord(ctx, y, pageH, width, 'DRAWING')
    drawCaption(ctx, y, pageH, width, panel.eyebrow, panel.title)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  // Predictable V: page 0 at V=0..slice (bottom→top grows with page index)
  texture.flipY = false
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = maxAniso
  texture.needsUpdate = true

  return { texture, pageCount: panels.length }
}

function applyAtlas(material, atlas) {
  if (!material?.uniforms || !atlas) return
  const { texture, pageCount } = atlas
  material.uniforms.uTexture.value = texture
  material.uniforms.uPageCount.value = pageCount
}

function VortexBackground({ active, intensity = 1.35 }) {
  const materialRef = useRef(null)
  const atlasRef = useRef(null)
  const pageCountRef = useRef(1)
  const { viewport, gl } = useThree()

  const material = useMemo(() => createVortexMaterial(intensity), [intensity])

  useEffect(() => {
    materialRef.current = material
    material.uniforms.uIntensity.value = intensity
    applyAtlas(material, atlasRef.current)
  }, [material, intensity])

  useEffect(() => {
    let cancelled = false
    const maxAniso = Math.min(16, gl.capabilities.getMaxAnisotropy?.() ?? 8)

    buildStripAtlas(maxAniso)
      .then((atlas) => {
        if (cancelled) {
          atlas.texture.dispose()
          return
        }
        atlasRef.current = atlas
        pageCountRef.current = atlas.pageCount
        applyAtlas(materialRef.current, atlas)
      })
      .catch((err) => {
        console.warn('[Art vortex] atlas failed', err)
      })

    return () => {
      cancelled = true
      if (atlasRef.current?.texture) {
        atlasRef.current.texture.dispose()
        atlasRef.current = null
      }
    }
  }, [gl])

  useFrame((state, delta) => {
    const mat = materialRef.current
    if (!active || !mat?.uniforms) return

    if (artScrollState.enabled) {
      artScrollState.velocity *= Math.pow(0.93, delta * 60)
      const speed = AUTO_PAGE_SPEED + artScrollState.velocity * 0.07
      artScrollState.position += speed * delta
    }

    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uScroll.value = artScrollState.position
    mat.uniforms.uPageCount.value = pageCountRef.current
    mat.uniforms.uAspect.value = Math.max(viewport.width / Math.max(viewport.height, 0.001), 0.2)
  })

  // Cover viewport edge-to-edge
  const w = Math.max(viewport.width * 1.02, 14)
  const h = Math.max(viewport.height * 1.02, 9)

  return (
    <mesh position={[0, 0, -3.2]} renderOrder={0} scale={[w / 16, h / 9, 1]}>
      <planeGeometry args={[16, 9]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

export default VortexBackground
