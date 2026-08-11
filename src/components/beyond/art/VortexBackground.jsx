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

function VortexBackground({ active, intensity = 1.55, mobileLite = false }) {
  const materialRef = useRef(null)
  const atlasRef = useRef(null)
  const pageCountRef = useRef(1)
  const smoothAspectRef = useRef(1.45)
  const { viewport, gl } = useThree()

  const material = useMemo(() => createVortexMaterial(intensity), [intensity])

  useEffect(() => {
    materialRef.current = material
    material.uniforms.uIntensity.value = intensity
    if (material.uniforms.uZoomOut) {
      // Phone: pull framing out so both vortices + sketches stay readable
      material.uniforms.uZoomOut.value = mobileLite ? 1.34 : 1
    }
    applyVortexAtlas(material, atlasRef.current)
  }, [material, intensity, mobileLite])

  useEffect(() => {
    let cancelled = false
    // Help atlas cap strip height to this GPU
    try {
      window.__MAX_TEX_SIZE__ = gl.capabilities?.getMaxTextureSize?.() || 8192
    } catch {
      /* */
    }
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy?.() ?? 4)

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
      // Shared session cache — do not dispose
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

    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uScroll.value = artScrollState.display
    mat.uniforms.uPageCount.value = pages
    // Floor aspect on portrait phones so page fit doesn’t collapse into a center crop
    const rawAspect = viewport.width / Math.max(viewport.height, 0.001)
    mat.uniforms.uAspect.value = mobileLite
      ? Math.max(rawAspect, 0.72)
      : Math.max(rawAspect, 0.2)
    mat.uniforms.uPageAspect.value = smoothAspectRef.current
    if (mat.uniforms.uEnergy) mat.uniforms.uEnergy.value = artScrollState.energy
    if (mat.uniforms.uZoomOut) mat.uniforms.uZoomOut.value = mobileLite ? 1.34 : 1
  })

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
