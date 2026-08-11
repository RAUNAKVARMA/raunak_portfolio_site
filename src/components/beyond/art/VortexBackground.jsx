import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { createVortexMaterial } from '../../../lib/vortexDistortionShader'
import {
  applyVortexAtlas,
  getVortexAtlas,
  subscribeVortexAtlas,
} from '../../../lib/vortexAtlas'
import { artScrollState } from './artScrollState'

const AUTO_PAGE_SPEED = 0.038

function easeOutExp(dt, rate) {
  return 1 - Math.exp(-dt * rate)
}

function VortexBackground({ active, intensity = 1.6 }) {
  const materialRef = useRef(null)
  const atlasRef = useRef(null)
  const pageCountRef = useRef(1)
  const smoothAspectRef = useRef(1.45)
  const { viewport, gl, camera } = useThree()

  const material = useMemo(() => createVortexMaterial(intensity), [intensity])

  useEffect(() => {
    materialRef.current = material
    material.uniforms.uIntensity.value = intensity
    applyVortexAtlas(material, atlasRef.current)
  }, [material, intensity])

  useEffect(() => {
    let cancelled = false
    try {
      window.__MAX_TEX_SIZE__ = gl.capabilities?.getMaxTextureSize?.() || 8192
    } catch {
      /* */
    }
    const maxAniso = Math.min(16, gl.capabilities.getMaxAnisotropy?.() ?? 8)

    const apply = (atlas) => {
      if (cancelled || !atlas) return
      atlasRef.current = atlas
      pageCountRef.current = atlas.pageCount
      smoothAspectRef.current = atlas.pageAspect ?? 1.45
      applyVortexAtlas(materialRef.current, atlas)
    }

    getVortexAtlas(maxAniso)
      .then(apply)
      .catch((err) => {
        console.warn('[Art vortex] atlas failed', err)
      })

    const unsub = subscribeVortexAtlas(apply)

    return () => {
      cancelled = true
      unsub()
      atlasRef.current = null
    }
  }, [gl])

  useFrame((state, delta) => {
    const mat = materialRef.current
    if (!active || !mat?.uniforms) return

    const dt = Math.min(Math.max(delta, 0), 1 / 24)

    if (artScrollState.enabled) {
      const speedAbs = Math.abs(artScrollState.velocity)
      const damp = speedAbs > 6 ? 0.985 : speedAbs > 2.5 ? 0.97 : speedAbs > 1 ? 0.93 : 0.88
      artScrollState.velocity *= Math.pow(damp, dt * 60)
      if (Math.abs(artScrollState.velocity) < 0.0005) artScrollState.velocity = 0
      artScrollState.energy *= Math.pow(0.9, dt * 60)

      const speed =
        AUTO_PAGE_SPEED * (1 + artScrollState.energy * 0.35) + artScrollState.velocity * 0.42
      artScrollState.position += speed * dt
    }

    const lag = artScrollState.position - artScrollState.display
    const lagAbs = Math.abs(lag)
    const catchRate = Math.min(72, 22 + lagAbs * 36)
    artScrollState.display += lag * easeOutExp(dt, catchRate)

    const pages = pageCountRef.current
    const atlas = atlasRef.current
    const pageIdx = Math.floor(((artScrollState.display % pages) + pages) % pages)
    const targetAspect = atlas?.aspects?.[pageIdx] ?? smoothAspectRef.current
    smoothAspectRef.current += (targetAspect - smoothAspectRef.current) * easeOutExp(dt, 4.5)

    const viewAspect = Math.max(viewport.width / Math.max(viewport.height, 0.001), 0.2)
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uScroll.value = artScrollState.display
    mat.uniforms.uPageCount.value = pages
    mat.uniforms.uAspect.value = viewAspect
    mat.uniforms.uPageAspect.value = smoothAspectRef.current
    if (mat.uniforms.uEnergy) mat.uniforms.uEnergy.value = artScrollState.energy
  })

  // Frustum-matched full-bleed plane — slight overscan stops phone letterbox/crop
  const meshZ = -3.2
  const camZ = camera.position.z
  const depthScale = Math.abs(camZ - meshZ) / Math.max(Math.abs(camZ), 0.001)
  const portrait = viewport.width < viewport.height
  const cover = portrait ? 1.06 : 1.02
  const w = Math.max(viewport.width * depthScale * cover, 0.01)
  const h = Math.max(viewport.height * depthScale * cover, 0.01)

  return (
    <mesh position={[0, 0, meshZ]} renderOrder={0} scale={[w / 16, h / 9, 1]}>
      <planeGeometry args={[16, 9]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

export default VortexBackground
