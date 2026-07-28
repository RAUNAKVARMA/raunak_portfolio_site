import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function fixMaterialMaps(material) {
  if (!material) return
  const maps = [
    'map',
    'emissiveMap',
    'aoMap',
    'metalnessMap',
    'roughnessMap',
    'normalMap',
    'bumpMap',
    'specularMap',
    'alphaMap',
  ]
  maps.forEach((key) => {
    const tex = material[key]
    if (!tex) return
    if (key === 'map' || key === 'emissiveMap' || key === 'specularMap') {
      tex.colorSpace = THREE.SRGBColorSpace
    } else {
      tex.colorSpace = THREE.NoColorSpace
    }
    tex.needsUpdate = true
  })
  if ('envMapIntensity' in material) material.envMapIntensity = 1.25
  material.needsUpdate = true
}

/** Copy all texture slots so rebuilt Physical materials keep badge / light / detail colors. */
function transferMaps(source, target) {
  if (!source || !target) return
  const colorMaps = new Set(['map', 'emissiveMap', 'specularMap'])
  const keys = [
    'map',
    'emissiveMap',
    'normalMap',
    'bumpMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'alphaMap',
    'clearcoatMap',
    'clearcoatNormalMap',
    'clearcoatRoughnessMap',
    'specularMap',
  ]
  keys.forEach((key) => {
    const tex = source[key]
    if (!tex) return
    target[key] = tex
    tex.colorSpace = colorMaps.has(key) ? THREE.SRGBColorSpace : THREE.NoColorSpace
    tex.needsUpdate = true
  })
  if (source.normalScale) target.normalScale.copy(source.normalScale)
  if (source.bumpScale != null) target.bumpScale = source.bumpScale
  if (source.aoMapIntensity != null) target.aoMapIntensity = source.aoMapIntensity
}

/** 918 Spyder — GT Silver product shot; hot tails, acid calipers, carbon yellow. */
function rebuildPorscheMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''
  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: source.metalness ?? 0.4,
    roughness: source.roughness ?? 0.4,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: !!source.transparent,
    opacity: source.opacity ?? 1,
    side: /Glass|Light|Detail|Display|Stich|Grid|INT_Seat/i.test(name)
      ? THREE.DoubleSide
      : THREE.FrontSide,
    envMapIntensity: 1.05,
  })
  transferMaps(source, mat)

  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.needsUpdate = true
    mat.color.setRGB(1, 1, 1)
  }
  if (mat.normalMap) {
    mat.normalMap.anisotropy = 16
    mat.normalScale?.set(1.2, 1.2)
    mat.normalMap.needsUpdate = true
  }
  if (mat.metalnessMap) mat.metalness = 1
  if (mat.roughnessMap) mat.roughness = 1

  // GT Silver Metallic — liquid metal clearcoat
  if (/Body_Paint/i.test(name)) {
    mat.color.setRGB(0.72, 0.73, 0.76)
    mat.metalness = 0.95
    mat.roughness = 0.22
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.03
    mat.envMapIntensity = 1.15
    mat.specularIntensity = 1
    if (mat.specularColor) mat.specularColor.setRGB(0.9, 0.92, 0.98)
  }

  if (/Chrome|Mirror/i.test(name)) {
    mat.color.setRGB(0.94, 0.94, 0.96)
    mat.metalness = 1
    mat.roughness = 0.06
    mat.envMapIntensity = 1.85
  }

  if (/Metal_-_Black|Plastic_-_Glossy_Black|Plastic_-_Matte_Black|Plastic_-_Glossy_BlackLights/i.test(name)) {
    mat.color.setRGB(0.02, 0.02, 0.025)
    mat.metalness = /Glossy/i.test(name) ? 0.45 : 0.15
    mat.roughness = /Matte/i.test(name) ? 0.55 : 0.22
    mat.clearcoat = /Glossy/i.test(name) ? 0.7 : 0.15
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 0.85
  }

  if (/Carbon_Fiber_Yellow/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.05, 1.02, 0.9)
    mat.metalness = mat.metalnessMap ? 1 : 0.6
    mat.roughness = mat.roughnessMap ? 1 : 0.25
    mat.clearcoat = 0.55
    mat.clearcoatRoughness = 0.08
    mat.envMapIntensity = 1.35
  }

  if (/Carbon_Fiber/i.test(name) && !/Yellow/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = mat.metalnessMap ? 1 : 0.55
    mat.roughness = mat.roughnessMap ? 1 : 0.32
    mat.clearcoat = 0.5
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 1.15
  }

  if (/^Window_Glass$/i.test(name)) {
    mat.color.setRGB(0.02, 0.025, 0.03)
    mat.transparent = true
    mat.opacity = 0.34
    mat.metalness = 0
    mat.roughness = 0.05
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.03
    mat.envMapIntensity = 1.45
    mat.depthWrite = false
  }

  if (/Window_Glass_Red/i.test(name)) {
    mat.color.setRGB(1, 0.02, 0.04)
    mat.transparent = true
    mat.opacity = 0.5
    mat.metalness = 0
    mat.roughness = 0.04
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(1, 0.03, 0.02)
    mat.emissiveIntensity = 4.8
    mat.toneMapped = false
    mat.depthWrite = false
    mat.envMapIntensity = 0.2
  }

  if (/Window_Glass_not_transparent/i.test(name)) {
    mat.color.setRGB(0.015, 0.015, 0.018)
    mat.metalness = 0.2
    mat.roughness = 0.2
    mat.envMapIntensity = 0.7
  }

  if (/Tail_Light/i.test(name)) {
    mat.color.setRGB(1, 0.02, 0.03)
    mat.metalness = 0.05
    mat.roughness = 0.12
    mat.emissive.setRGB(1, 0.02, 0.01)
    mat.emissiveIntensity = 5.5
    mat.toneMapped = false
    mat.envMapIntensity = 0.25
  }

  if (/Glass_Bumped/i.test(name)) {
    mat.color.setRGB(0.85, 0.88, 0.92)
    mat.metalness = 0.15
    mat.roughness = 0.05
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(0.55, 0.6, 0.7)
    mat.emissiveIntensity = 0.75
    mat.envMapIntensity = 1.3
    mat.toneMapped = false
  }

  if (/^Caliper$/i.test(name)) {
    mat.color.setRGB(0.78, 1, 0.08)
    mat.metalness = 0.22
    mat.roughness = 0.26
    mat.clearcoat = 0.7
    mat.clearcoatRoughness = 0.08
    mat.envMapIntensity = 1.3
  }

  if (/Steering_wheel_Trim/i.test(name)) {
    mat.color.setRGB(0.02, 0.18, 0.95)
    mat.metalness = 0.25
    mat.roughness = 0.18
    mat.clearcoat = 0.55
    mat.envMapIntensity = 1.1
  }

  if (/Glossy_Green/i.test(name)) {
    mat.color.setRGB(0.04, 0.95, 0.1)
    mat.metalness = 0.3
    mat.roughness = 0.22
    mat.clearcoat = 0.65
    mat.envMapIntensity = 1.2
  }

  if (/Emissive-Green/i.test(name)) {
    mat.emissive.setRGB(0.15, 1, 0.08)
    mat.emissiveIntensity = 2.4
    mat.toneMapped = false
  }

  if (/LCD_Emissive|Display/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.emissive.setRGB(0.9, 0.95, 1)
    mat.emissiveIntensity = Math.max(source.emissiveIntensity || 1, 1.6)
    mat.toneMapped = false
  }

  if (/Leather|Fabric|Belt|Stich|Interior|Tyre|Rubber|Disc|Rim|Grid|Structure|Detail|material/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    if (!mat.metalnessMap && /Disc|Rim/i.test(name)) {
      mat.metalness = Math.max(source.metalness ?? 0.6, 0.55)
    }
    if (!mat.roughnessMap && /Disc|Rim/i.test(name)) {
      mat.roughness = Math.min(source.roughness ?? 0.4, 0.4)
    }
    mat.envMapIntensity = /Disc|Rim|Grid/i.test(name) ? 1.35 : 0.85
  }

  if (/INT_Seat_Logo/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.transparent = false
    mat.opacity = 1
    mat.depthWrite = true
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

/** La Voiture Noire — deep black first, soft sheen second (heavy gloss was greying it out). */
function rebuildBugattiMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''

  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: 0.5,
    roughness: 0.35,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: !!source.transparent,
    opacity: source.opacity ?? 1,
    side: THREE.DoubleSide,
    envMapIntensity: 0.85,
  })
  transferMaps(source, mat)

  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.needsUpdate = true
  }

  // Iconic Noire body — velvet black with warm edge catch (not chrome grey)
  if (/coloured|textureda__env|Matte__FFFFFFFF__prim|Matte__FF151515/i.test(name)) {
    mat.color.setRGB(0.012, 0.011, 0.012)
    mat.metalness = 0.08
    mat.roughness = 0.36
    mat.clearcoat = 0.65
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 0.28
    mat.specularIntensity = 0.45
    if (mat.specularColor) mat.specularColor.setRGB(0.55, 0.42, 0.2)
    // Tiny warm lift so gold rims sculpt the form on black
    mat.emissive.setRGB(0.04, 0.028, 0.01)
    mat.emissiveIntensity = 0.12
  }

  // Secondary panels — deep charcoal
  if (/Matte__FF114182/i.test(name)) {
    mat.color.setRGB(0.035, 0.036, 0.04)
    mat.metalness = 0.12
    mat.roughness = 0.42
    mat.clearcoat = 0.4
    mat.clearcoatRoughness = 0.15
    mat.envMapIntensity = 0.35
  }

  // Interior leather — luxury cognac, soft sheen, no neon glow
  if (/textured2a/i.test(name)) {
    mat.color.setRGB(0.72, 0.48, 0.3)
    mat.metalness = 0
    mat.roughness = 0.62
    mat.clearcoat = 0.12
    mat.clearcoatRoughness = 0.5
    mat.envMapIntensity = 0.4
    mat.sheen = 0.85
    mat.sheenRoughness = 0.65
    if (mat.sheenColor) mat.sheenColor.setRGB(0.85, 0.62, 0.4)
    mat.emissive.setRGB(0, 0, 0)
    mat.emissiveIntensity = 0
    mat.toneMapped = true
    mat.side = THREE.DoubleSide
    mat.depthWrite = true
    mat.transparent = false
    mat.opacity = 1
  }

  // Windshield — lightly tinted so cabin reads without wash
  if (/Matte__80202020/i.test(name)) {
    mat.color.setRGB(0.045, 0.05, 0.055)
    mat.transparent = true
    mat.opacity = 0.22
    mat.metalness = 0
    mat.roughness = 0.1
    mat.clearcoat = 0.25
    mat.clearcoatRoughness = 0.18
    mat.envMapIntensity = 0.18
    mat.depthWrite = false
    mat.side = THREE.DoubleSide
  }

  // Red taillight glass
  if (/Matte__80800000/i.test(name)) {
    mat.color.setRGB(1, 0.015, 0.03)
    mat.transparent = true
    mat.opacity = 0.78
    mat.metalness = 0
    mat.roughness = 0.06
    mat.clearcoat = 0.5
    mat.clearcoatRoughness = 0.05
    mat.emissive.setRGB(1, 0.02, 0.02)
    mat.emissiveIntensity = 2.0
    mat.envMapIntensity = 0.2
    mat.toneMapped = false
  }

  // Front lamps — jewel bright
  if (/vehiclelights128.*(FL|FR)/i.test(name)) {
    mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.05
    mat.roughness = 0.18
    mat.emissive.setRGB(1, 0.98, 0.92)
    mat.emissiveIntensity = 2.2
    mat.envMapIntensity = 0.35
    mat.toneMapped = false
  }

  // Rear lamps — amber
  if (/vehiclelights128.*RR/i.test(name)) {
    mat.color.setRGB(1, 0.4, 0.05)
    mat.metalness = 0.05
    mat.roughness = 0.25
    mat.emissive.setRGB(1, 0.32, 0.02)
    mat.emissiveIntensity = 2.1
    mat.envMapIntensity = 0.3
    mat.toneMapped = false
  }

  // Light housings
  if (/lavoiturecsr2_light__/i.test(name)) {
    mat.color.setRGB(0.06, 0.055, 0.05)
    mat.metalness = 0.35
    mat.roughness = 0.45
    mat.envMapIntensity = 0.5
  }

  // Badge — red crest pops on Noire
  if (/badge/i.test(name) && mat.map) {
    mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.02
    mat.roughness = 0.38
    mat.clearcoat = 0.35
    mat.clearcoatRoughness = 0.15
    mat.envMapIntensity = 0.45
    mat.emissive.setRGB(0.15, 0.02, 0.01)
    mat.emissiveIntensity = 0.25
  }

  // Grilles — warm Bugatti gold accents
  if (/grille/i.test(name) && mat.map) {
    mat.color.setRGB(1.05, 0.92, 0.65)
    mat.metalness = 0.7
    mat.roughness = 0.32
    mat.clearcoat = 0.45
    mat.clearcoatRoughness = 0.12
    mat.envMapIntensity = 0.7
    mat.emissive.setRGB(0.2, 0.12, 0.03)
    mat.emissiveIntensity = 0.2
    if (/grille2/i.test(name)) {
      mat.transparent = true
      mat.alphaTest = 0.12
      mat.opacity = 1
      mat.depthWrite = true
      mat.color.setRGB(0.85, 0.62, 0.22)
      mat.metalness = 0.75
      mat.roughness = 0.28
      mat.emissive.setRGB(0.35, 0.2, 0.04)
      mat.emissiveIntensity = 0.35
    }
  }

  // Wheel face texture
  if (/wheel__env/i.test(name) && mat.map) {
    mat.color.setRGB(1, 0.95, 0.85)
    mat.metalness = 0.55
    mat.roughness = 0.38
    mat.envMapIntensity = 0.75
  }

  // Solid wheel / trim
  if (/lavoiturecsr2_wheel__spec$/i.test(name) || /wheeltextured/i.test(name)) {
    mat.color.setRGB(0.05, 0.045, 0.04)
    mat.metalness = 0.45
    mat.roughness = 0.48
    mat.envMapIntensity = 0.55
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

/** MKIV Supra — F&F product shot: vivid orange, punchy green tribal, hot LEDs. */
function rebuildSupraMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''
  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: source.metalness ?? 0.35,
    roughness: source.roughness ?? 0.4,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: !!source.transparent,
    opacity: source.opacity ?? 1,
    side: /glass|Window|Light|UnderLighting/i.test(name)
      ? THREE.DoubleSide
      : THREE.FrontSide,
    envMapIntensity: 1.05,
  })
  transferMaps(source, mat)

  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.needsUpdate = true
    mat.color.setRGB(1, 1, 1)
  }
  if (mat.normalMap) {
    mat.normalMap.anisotropy = 16
    mat.normalScale?.set(1.15, 1.15)
    mat.normalMap.needsUpdate = true
  }

  // Fast & Furious orange — color-first, low env wash
  if (/PaintA_Material/i.test(name)) {
    mat.color.setRGB(1, 0.55, 0.12)
    mat.metalness = 0.02
    mat.roughness = 0.26
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.045
    mat.envMapIntensity = 0.55
    mat.specularIntensity = 0.9
    if (mat.specularColor) mat.specularColor.setRGB(1, 0.55, 0.2)
    mat.emissive.setRGB(0.35, 0.08, 0.01)
    mat.emissiveIntensity = 0.2
  }

  if (/Coloured_Material|TexturedA_Material|Carbon2/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = Math.max(mat.metalness || 0.25, 0.2)
    mat.roughness = Math.max(mat.roughness || 0.3, 0.25)
    if (/Carbon/i.test(name)) {
      mat.metalness = 0.6
      mat.clearcoat = 0.55
      mat.clearcoatRoughness = 0.1
    }
    if (/Coloured/i.test(name) && mat.map) {
      // neon green tribal stays vivid
      mat.color.setRGB(0.92, 1.05, 0.55)
      mat.clearcoat = 0.7
      mat.clearcoatRoughness = 0.06
      mat.envMapIntensity = 0.95
    } else {
      mat.envMapIntensity = 1.15
    }
  }

  if (/Base_Material/i.test(name)) {
    mat.color.setRGB(0, 0, 0)
    mat.metalness = 0
    mat.roughness = 1
    mat.envMapIntensity = 0
    mat.emissive.setRGB(0, 0, 0)
    mat.map = null
    mat.visible = false
  }

  if (/Grille|ManufacturerPlate/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.6
    mat.roughness = Math.max(mat.roughness || 0.4, 0.32)
    mat.envMapIntensity = 1.35
  }

  if (/LightA_Material/i.test(name)) {
    if (mat.map) {
      mat.color.setRGB(1, 1, 1)
      mat.emissiveMap = mat.map
      mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
    } else {
      mat.color.setRGB(0.9, 0.92, 0.96)
    }
    mat.metalness = 0.45
    mat.roughness = 0.14
    mat.emissive.setRGB(0.7, 0.75, 0.85)
    mat.emissiveIntensity = 1.05
    mat.clearcoat = 0.8
    mat.clearcoatRoughness = 0.04
    mat.transparent = false
    mat.opacity = 1
    mat.toneMapped = false
    mat.envMapIntensity = 1.25
  }

  if (/UnderLighting/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 0.35, 0.08)
    mat.emissive.setRGB(1, 0.45, 0.05)
    mat.emissiveIntensity = Math.max(source.emissiveIntensity || 1, 3.2)
    mat.transparent = true
    mat.opacity = Math.min(Math.max(source.opacity ?? 0.55, 0.5), 0.92)
    mat.metalness = 0
    mat.roughness = 0.3
    mat.depthWrite = false
    mat.toneMapped = false
  }

  if (/Interior|Engine/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = Math.min(mat.metalness || 0.35, 0.4)
    mat.roughness = Math.max(mat.roughness || 0.4, 0.35)
    mat.envMapIntensity = 1.05
  }

  if (/Window_Material/i.test(name)) {
    mat.color.setRGB(0.015, 0.02, 0.025)
    mat.transparent = true
    mat.opacity = 0.32
    mat.metalness = 0
    mat.roughness = 0.04
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.envMapIntensity = 1.4
    mat.depthWrite = false
  }

  if (/orange_glass/i.test(name)) {
    mat.color.setRGB(1, 0.4, 0.02)
    mat.transparent = true
    mat.opacity = 0.48
    mat.metalness = 0
    mat.roughness = 0.04
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(1, 0.38, 0.02)
    mat.emissiveIntensity = 3.8
    mat.toneMapped = false
    mat.depthWrite = false
    mat.envMapIntensity = 0.25
  }

  if (/red_glass/i.test(name)) {
    mat.color.setRGB(1, 0.0, 0.02)
    mat.transparent = true
    mat.opacity = 0.45
    mat.metalness = 0
    mat.roughness = 0.03
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(1, 0.02, 0.0)
    mat.emissiveIntensity = 5.8
    mat.toneMapped = false
    mat.depthWrite = false
    mat.envMapIntensity = 0.2
  }

  if (/Wheel/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.05, 1.05, 1.05)
    mat.metalness = 0.82
    mat.roughness = 0.22
    mat.clearcoat = 0.45
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 1.5
  }

  if (/Calliper|Caliper/i.test(name)) {
    mat.color.setRGB(1, 0.38, 0.02)
    mat.metalness = 0.25
    mat.roughness = 0.26
    mat.clearcoat = 0.6
    mat.envMapIntensity = 1.3
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

function prepareMaterial(material) {
  fixMaterialMaps(material)
}

/** F82 Razor — NFS product shot: punchy livery, glowing angel eyes / L-tails, gold Enkeis. */
function rebuildBmwMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''
  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: source.metalness ?? 0.15,
    roughness: source.roughness ?? 0.35,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: false,
    opacity: 1,
    side: /glass|light|plate/i.test(name) ? THREE.DoubleSide : THREE.FrontSide,
    envMapIntensity: 0.9,
  })
  transferMaps(source, mat)

  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.needsUpdate = true
  }

  // Main blue/white MARVIN livery — saturated showroom paint
  if (/^chassis\.009$/i.test(name)) {
    mat.color.setRGB(1.15, 1.08, 1.2)
    mat.metalness = 0.02
    mat.roughness = 0.22
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.028
    mat.envMapIntensity = 0.85
    mat.specularIntensity = 1
    if (mat.specularColor) mat.specularColor.setRGB(0.65, 0.78, 1)
  }

  // Untinted body shells — pearl white to match kit
  if (/^chassis\.9$/i.test(name)) {
    mat.color.setRGB(0.92, 0.94, 0.97)
    mat.metalness = 0.06
    mat.roughness = 0.24
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.04
    mat.envMapIntensity = 0.9
  }

  // Badges / roundels / M4 script
  if (/chassis\.017/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.2, 1.15, 1.1)
    mat.metalness = 0.55
    mat.roughness = 0.28
    mat.clearcoat = 0.7
    mat.clearcoatRoughness = 0.06
    mat.envMapIntensity = 1.35
    mat.transparent = false
    mat.opacity = 1
    mat.depthWrite = true
  }

  // Angel-eye headlight housings — map drives the glow
  if (/chassis\.014/i.test(name)) {
    if (mat.map) {
      mat.color.setRGB(1.1, 1.15, 1.25)
      mat.emissiveMap = mat.map
      mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
    }
    mat.emissive.setRGB(0.85, 0.92, 1)
    mat.emissiveIntensity = 2.8
    mat.metalness = 0.45
    mat.roughness = 0.15
    mat.clearcoat = 0.85
    mat.clearcoatRoughness = 0.04
    mat.toneMapped = false
    mat.envMapIntensity = 1.1
  }

  // L-taillight lenses — map as emissive for lit bars
  if (/chassis\.016/i.test(name)) {
    if (mat.map) {
      mat.color.setRGB(1.25, 0.95, 0.95)
      mat.emissiveMap = mat.map
      mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
    }
    mat.emissive.setRGB(1, 0.08, 0.04)
    mat.emissiveIntensity = 3.4
    mat.metalness = 0.05
    mat.roughness = 0.22
    mat.clearcoat = 0.9
    mat.clearcoatRoughness = 0.05
    mat.toneMapped = false
    mat.envMapIntensity = 0.35
  }

  // Small trim / gauge atlas
  if (/chassis\.015/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.4
    mat.roughness = 0.35
    mat.envMapIntensity = 1
  }

  // Undercarriage / mech
  if (/chassis\.003/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.55
    mat.roughness = 0.45
    mat.envMapIntensity = 0.7
  }

  if (/chassis\.011/i.test(name)) {
    mat.color.setRGB(0.02, 0.02, 0.025)
    mat.metalness = 0.25
    mat.roughness = 0.42
    mat.envMapIntensity = 0.4
  }

  if (/chassis\.012|chassis\.013/i.test(name)) {
    mat.color.setRGB(0.75, 0.78, 0.82)
    mat.metalness = 0.85
    mat.roughness = 0.14
    mat.clearcoat = 0.4
    mat.envMapIntensity = 1.4
  }

  if (/interior/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.05, 1.05, 1.05)
    mat.metalness = 0.1
    mat.roughness = 0.55
    mat.envMapIntensity = 0.55
  }

  if (/glass/i.test(name)) {
    mat.color.setRGB(0.015, 0.02, 0.03)
    mat.transparent = true
    mat.opacity = 0.28
    mat.metalness = 0
    mat.roughness = 0.04
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.envMapIntensity = 1.6
    mat.depthWrite = false
  }

  // Fallback solid light materials (mesh accents)
  if (/rear.?light|left_rear|right_rear/i.test(name)) {
    mat.color.setRGB(1, 0.02, 0.04)
    mat.emissive.setRGB(1, 0.05, 0.02)
    mat.emissiveIntensity = 6
    mat.metalness = 0
    mat.roughness = 0.12
    mat.toneMapped = false
    mat.envMapIntensity = 0.1
  }

  if (/front.?light|left_front|right_front/i.test(name)) {
    mat.color.setRGB(0.95, 0.98, 1)
    mat.emissive.setRGB(0.8, 0.9, 1)
    mat.emissiveIntensity = 4.5
    mat.metalness = 0.05
    mat.roughness = 0.06
    mat.clearcoat = 1
    mat.toneMapped = false
    mat.envMapIntensity = 0.6
  }

  if (/plate/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.1, 1.1, 1.1)
    mat.metalness = 0.02
    mat.roughness = 0.45
    mat.transparent = false
    mat.opacity = 1
    mat.envMapIntensity = 0.4
  }

  // Gold Enkei rims — kill broken BLEND alpha from authoring
  if (/wheel\.007|wheel\.008/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.2, 1.05, 0.75)
    mat.metalness = 0.88
    mat.roughness = 0.16
    mat.clearcoat = 0.65
    mat.clearcoatRoughness = 0.06
    mat.envMapIntensity = 1.7
    mat.transparent = false
    mat.opacity = 1
    mat.depthWrite = true
    mat.alphaMap = null
  }

  if (/wheel\.010|wheel\.009/i.test(name)) {
    if (mat.map) mat.color.setRGB(1.05, 1.05, 1.05)
    mat.metalness = 0.35
    mat.roughness = 0.55
    mat.envMapIntensity = 0.9
    mat.transparent = false
    mat.opacity = 1
  }

  if (/spoon|bluepad|Misc|black_metallic|semi_chrome|Metal_-_Car|Glass_-_Glass/i.test(name)) {
    mat.visible = false
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

function applyBmwMaterials(root) {
  const junk =
    /shadow|colmesh|infernus|alpha\.dff|plane\.\d+|spoon|bluepad|black_metallic|semi_chrome/i

  root.traverse((obj) => {
    if (!obj.isMesh) return
    const label = `${obj.name || ''} ${obj.parent?.name || ''}`
    if (junk.test(label)) {
      obj.visible = false
      return
    }
  })

  applyRebuiltMaterials(root, rebuildBmwMaterial)
}

/** Valour — preserve every authored texture color; polish without tinting maps. */
function rebuildAstonMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''
  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: source.metalness ?? 0.35,
    roughness: source.roughness ?? 0.4,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: !!source.transparent,
    opacity: source.opacity ?? 1,
    side: THREE.DoubleSide,
    envMapIntensity: 0.95,
  })
  transferMaps(source, mat)

  // True color from atlases — never multiply maps with a tint
  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.needsUpdate = true
    mat.color.setRGB(1, 1, 1)
  }
  if (mat.normalMap) {
    mat.normalMap.anisotropy = 16
    mat.normalMap.needsUpdate = true
  }
  // Let packed metal/rough maps drive values fully
  if (mat.metalnessMap) mat.metalness = 1
  if (mat.roughnessMap) mat.roughness = 1

  // Solid BRG lacquer — rich dielectric green, not muddy near-black
  if (/Paint_Material/i.test(name)) {
    mat.color.setRGB(0.012, 0.22, 0.075)
    mat.metalness = 0.04
    mat.roughness = 0.26
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.035
    mat.envMapIntensity = 0.55
    mat.specularIntensity = 1
    if (mat.specularColor) mat.specularColor.setRGB(0.25, 0.85, 0.45)
    mat.emissive.setRGB(0.02, 0.14, 0.045)
    mat.emissiveIntensity = 0.35
  }

  if (/Coloured_Material|TexturedA_Material/i.test(name)) {
    mat.clearcoat = 0.7
    mat.clearcoatRoughness = 0.06
    mat.envMapIntensity = 1.05
    if (!mat.metalnessMap) mat.metalness = Math.min(source.metalness ?? 0.25, 0.3)
    if (!mat.roughnessMap) mat.roughness = Math.min(Math.max(source.roughness ?? 0.22, 0.18), 0.35)
  }

  if (/Carbon/i.test(name)) {
    mat.clearcoat = source.clearcoat ?? 0.55
    mat.clearcoatRoughness = source.clearcoatRoughness ?? 0.06
    mat.envMapIntensity = 1.15
    if (!mat.metalnessMap) mat.metalness = 0.5
    if (!mat.roughnessMap) mat.roughness = 0.35
  }

  if (/Base_Material/i.test(name)) {
    mat.color.setRGB(0, 0, 0)
    mat.metalness = 0
    mat.roughness = 1
    mat.envMapIntensity = 0
    mat.map = null
    mat.visible = false
  }

  if (/Grille|ManufacturerPlate/i.test(name)) {
    mat.envMapIntensity = 1.3
    if (!mat.metalnessMap) mat.metalness = Math.max(source.metalness ?? 0.6, 0.55)
    if (!mat.roughnessMap) mat.roughness = Math.max(source.roughness ?? 0.45, 0.35)
  }

  if (/Badge/i.test(name)) {
    // Keep wing green / red anniversary colors exact
    mat.envMapIntensity = 1.35
    mat.clearcoat = 0.45
    mat.clearcoatRoughness = 0.08
    mat.transparent = false
    mat.opacity = 1
    mat.depthWrite = true
    mat.alphaMap = null
    if (!mat.metalnessMap) mat.metalness = 0.7
    if (!mat.roughnessMap) mat.roughness = 0.35
  }

  if (/LightA_Material/i.test(name)) {
    // Map carries lens detail — keep white multiply so grayscale reads clean
    mat.metalness = mat.metalnessMap ? 1 : 0.35
    mat.roughness = mat.roughnessMap ? 1 : 0.12
    mat.emissive.setRGB(0.7, 0.74, 0.8)
    mat.emissiveIntensity = 1.15
    if (mat.map) {
      mat.emissiveMap = mat.map
      mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
    }
    mat.clearcoat = 0.85
    mat.clearcoatRoughness = 0.04
    mat.envMapIntensity = 1.25
    mat.toneMapped = false
  }

  if (/red_glass/i.test(name)) {
    mat.color.setRGB(1, 0.02, 0.025)
    mat.transparent = true
    mat.opacity = 0.5
    mat.metalness = 0
    mat.roughness = 0.03
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(1, 0.04, 0.015)
    mat.emissiveIntensity = 6.4
    mat.toneMapped = false
    mat.depthWrite = false
    mat.envMapIntensity = 0.25
  }

  if (/Window_Material/i.test(name)) {
    mat.color.setRGB(0.02, 0.028, 0.032)
    mat.transparent = true
    mat.opacity = 0.32
    mat.metalness = 0
    mat.roughness = 0.05
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.03
    mat.envMapIntensity = 1.45
    mat.depthWrite = false
  }

  if (/Interior/i.test(name)) {
    mat.envMapIntensity = 0.75
    if (!mat.metalnessMap) mat.metalness = Math.min(source.metalness ?? 0.4, 0.45)
    if (!mat.roughnessMap) mat.roughness = Math.max(source.roughness ?? 0.5, 0.4)
  }

  if (/Wheel/i.test(name)) {
    // Keep Michelin / Aston logo greens and silvers true
    mat.clearcoat = 0.4
    mat.clearcoatRoughness = 0.08
    mat.envMapIntensity = 1.4
    if (!mat.metalnessMap) mat.metalness = 0.75
    if (!mat.roughnessMap) mat.roughness = 0.22
  }

  if (/Calliper/i.test(name)) {
    // Zone map has red/orange/blue accents — preserve exactly
    mat.clearcoat = 0.4
    mat.envMapIntensity = 1.15
    if (!mat.map) {
      mat.color.setRGB(0.82, 0.08, 0.06)
      mat.metalness = 0.35
      mat.roughness = 0.3
    } else if (!mat.metalnessMap) {
      mat.metalness = 0.35
      if (!mat.roughnessMap) mat.roughness = 0.3
    }
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

function applyAstonMaterials(root) {
  const cache = new Map()

  let redGlassCenter = null
  root.traverse((obj) => {
    if (!obj.isMesh || redGlassCenter) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (!mats.some((m) => m && /red_glass/i.test(m.name || ''))) return
    redGlassCenter = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3())
  })

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    if (/Base_Geo|Base_Material|platform|podium|plinth/i.test(obj.name || '')) {
      obj.visible = false
      return
    }
    const list = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (list.some((m) => m && /Base_Material/i.test(m.name || ''))) {
      obj.visible = false
      return
    }

    const next = list.map((src) => {
      const mat = rebuildAstonMaterial(src, cache)
      if (!/LightA_Material/i.test(src?.name || mat.name || '')) return mat

      const geo = obj.geometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const bb = geo.boundingBox
      const localSize = bb.getSize(new THREE.Vector3())
      const axisIndex = localSize.z >= localSize.x ? 2 : 0
      const localMid =
        (bb.min.getComponent(axisIndex) + bb.max.getComponent(axisIndex)) * 0.5

      let localRearSign = -1
      if (redGlassCenter) {
        obj.updateWorldMatrix(true, false)
        const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert()
        const redLocal = redGlassCenter.clone().applyMatrix4(inv)
        const s = Math.sign(redLocal.getComponent(axisIndex) - localMid)
        if (s !== 0) localRearSign = s
      }

      const lightMat = mat.clone()
      lightMat.name = `${mat.name}_split`
      lightMat.toneMapped = false
      lightMat.onBeforeCompile = (shader) => {
        shader.uniforms.uLightMid = { value: localMid }
        shader.uniforms.uRearSign = { value: localRearSign }
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying float vLightAlong;`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vLightAlong = transformed[${axisIndex}];`,
          )
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying float vLightAlong;
             uniform float uLightMid;
             uniform float uRearSign;`,
          )
          .replace(
            '#include <map_fragment>',
            `#include <map_fragment>
             float rearMask = smoothstep(-0.1, 0.1, uRearSign * (vLightAlong - uLightMid));
             diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.015, 0.02), rearMask * 0.92);`,
          )
          .replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             float rearMaskE = smoothstep(-0.1, 0.1, uRearSign * (vLightAlong - uLightMid));
             totalEmissiveRadiance = mix(
               totalEmissiveRadiance,
               vec3(1.0, 0.035, 0.012) * 7.2,
               rearMaskE
             );`,
          )
      }
      lightMat.customProgramCacheKey = () =>
        `aston-light-split-${axisIndex}-${localRearSign}-v2`
      lightMat.needsUpdate = true
      return lightMat
    })
    obj.material = Array.isArray(obj.material) ? next : next[0]
  })
}

function applyRebuiltMaterials(root, rebuildFn) {
  const cache = new Map()
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map((m) => rebuildFn(m, cache))
    } else {
      obj.material = rebuildFn(obj.material, cache)
    }
  })
}

/** Un-mirror sponsor decals that sample the pre-flipped bottom strip of the paint atlas. */
function fixSupraPaintDecalUVs(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    const isPaint = mats.some((m) => m && /PaintA_Material/i.test(m.name || ''))
    if (!isPaint) return
    if (obj.userData.supraUvFixed) return

    const geo = obj.geometry
    const uv = geo?.attributes?.uv
    if (!uv) return

    // Bottom band of the F&F paint atlas holds skirt logos (often pre-mirrored).
    // Flip U there so text reads correctly on the car side.
    for (let i = 0; i < uv.count; i += 1) {
      const v = uv.getY(i)
      if (v < 0.42) {
        uv.setX(i, 1 - uv.getX(i))
      }
    }
    uv.needsUpdate = true
    obj.userData.supraUvFixed = true
  })
}

/** Supra lights share one LightA mesh — tint only the rear half red, keep front clear. */
function applySupraMaterials(root) {
  const cache = new Map()
  fixSupraPaintDecalUVs(root)

  let redGlassCenter = null
  root.traverse((obj) => {
    if (!obj.isMesh || redGlassCenter) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (!mats.some((m) => m && /red_glass/i.test(m.name || ''))) return
    redGlassCenter = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3())
  })

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    const list = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (list.some((m) => m && /Base_Material/i.test(m.name || ''))) {
      obj.visible = false
      return
    }

    const next = list.map((src) => {
      const mat = rebuildSupraMaterial(src, cache)
      const isLightA = /LightA_Material/i.test(src?.name || mat.name || '')
      const isLightMesh = /Light_Geo/i.test(obj.name || '')
      if (!isLightA || !isLightMesh) return mat

      const geo = obj.geometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const bb = geo.boundingBox
      const localSize = bb.getSize(new THREE.Vector3())
      const axisIndex = localSize.x >= localSize.z ? 0 : 2
      const localMid =
        (bb.min.getComponent(axisIndex) + bb.max.getComponent(axisIndex)) * 0.5

      let localRearSign = 1
      if (redGlassCenter) {
        obj.updateWorldMatrix(true, false)
        const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert()
        const redLocal = redGlassCenter.clone().applyMatrix4(inv)
        const s = Math.sign(redLocal.getComponent(axisIndex) - localMid)
        if (s !== 0) localRearSign = s
      }

      const lightMat = mat.clone()
      lightMat.name = `${mat.name}_split`
      lightMat.onBeforeCompile = (shader) => {
        shader.uniforms.uLightMid = { value: localMid }
        shader.uniforms.uRearSign = { value: localRearSign }
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying float vLightAlong;`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vLightAlong = transformed[${axisIndex}];`,
          )
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying float vLightAlong;
             uniform float uLightMid;
             uniform float uRearSign;`,
          )
          .replace(
            '#include <map_fragment>',
            `#include <map_fragment>
             float rearMask = smoothstep(-0.08, 0.08, uRearSign * (vLightAlong - uLightMid));
             diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.02, 0.03), rearMask * 0.92);`,
          )
          .replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             float rearMaskE = smoothstep(-0.08, 0.08, uRearSign * (vLightAlong - uLightMid));
             totalEmissiveRadiance = mix(totalEmissiveRadiance, vec3(1.0, 0.05, 0.01) * 5.5, rearMaskE);`,
          )
      }
      lightMat.customProgramCacheKey = () =>
        `supra-light-split-${axisIndex}-${localRearSign}`
      lightMat.needsUpdate = true
      return lightMat
    })
    obj.material = Array.isArray(obj.material) ? next : next[0]
  })
}

/** Aventador LightA is shared front+rear — paint rear Y-lamps red, keep front clear. */
function applyLamborghiniMaterials(root) {
  const cache = new Map()

  let redGlassCenter = null
  root.traverse((obj) => {
    if (!obj.isMesh || redGlassCenter) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (!mats.some((m) => m && /RED_GLASS/i.test(m.name || ''))) return
    redGlassCenter = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3())
  })

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    const list = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (list.some((m) => m && /Base_Material/i.test(m.name || ''))) {
      obj.visible = false
      return
    }

    const next = list.map((src) => {
      const mat = rebuildLamborghiniMaterial(src, cache)
      const isLightA = /LightA_Material/i.test(src?.name || mat.name || '')
      if (!isLightA) return mat

      const geo = obj.geometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const bb = geo.boundingBox
      const localSize = bb.getSize(new THREE.Vector3())
      const axisIndex = localSize.z >= localSize.x ? 2 : 0
      const localMid =
        (bb.min.getComponent(axisIndex) + bb.max.getComponent(axisIndex)) * 0.5

      let localRearSign = -1
      if (redGlassCenter) {
        obj.updateWorldMatrix(true, false)
        const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert()
        const redLocal = redGlassCenter.clone().applyMatrix4(inv)
        const s = Math.sign(redLocal.getComponent(axisIndex) - localMid)
        if (s !== 0) localRearSign = s
      }

      const lightMat = mat.clone()
      lightMat.name = `${mat.name}_rearSplit`
      lightMat.toneMapped = false
      lightMat.onBeforeCompile = (shader) => {
        shader.uniforms.uLightMid = { value: localMid }
        shader.uniforms.uRearSign = { value: localRearSign }
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying float vLightAlong;`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vLightAlong = transformed[${axisIndex}];`,
          )
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying float vLightAlong;
             uniform float uLightMid;
             uniform float uRearSign;`,
          )
          .replace(
            '#include <map_fragment>',
            `#include <map_fragment>
             float rearMask = smoothstep(-0.1, 0.1, uRearSign * (vLightAlong - uLightMid));
             vec3 rearLens = vec3(1.0, 0.01, 0.02) * (0.4 + diffuseColor.rgb * 0.95);
             diffuseColor.rgb = mix(diffuseColor.rgb, rearLens, rearMask);`,
          )
          .replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             float rearMaskE = smoothstep(-0.1, 0.1, uRearSign * (vLightAlong - uLightMid));
             totalEmissiveRadiance = mix(
               totalEmissiveRadiance,
               vec3(1.0, 0.03, 0.01) * 6.2,
               rearMaskE
             );`,
          )
      }
      lightMat.customProgramCacheKey = () =>
        `lambo-light-split-${axisIndex}-${localRearSign}`
      lightMat.needsUpdate = true
      return lightMat
    })
    obj.material = Array.isArray(obj.material) ? next : next[0]
  })
}

function applyBugattiMaterials(root) {
  applyRebuiltMaterials(root, rebuildBugattiMaterial)
  // Ensure cabin meshes draw and glass doesn't occlude them
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    const isInterior = mats.some((m) => m && /textured2a/i.test(m.name || ''))
    const isGlass = mats.some((m) => m && /Matte__80202020|Matte__80800000/i.test(m.name || ''))
    if (isInterior) {
      obj.visible = true
      obj.frustumCulled = false
      obj.renderOrder = 1
      obj.castShadow = true
      obj.receiveShadow = true
      // Slight scale nudge so leather doesn't z-fight under glass
      if (!obj.userData.bugattiInteriorLift) {
        obj.position.y += 0.002
        obj.userData.bugattiInteriorLift = true
      }
    }
    if (isGlass) {
      obj.renderOrder = 3
      obj.castShadow = false
    }
  })
}

/** SF90 — iconic Rosso Corsa first; gloss second (env was washing the red). */
function rebuildFerrariMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''

  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: source.metalness ?? 0.4,
    roughness: source.roughness ?? 0.35,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: !!source.transparent,
    opacity: source.opacity ?? 1,
    side: THREE.DoubleSide,
    envMapIntensity: 0.9,
  })
  transferMaps(source, mat)

  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.needsUpdate = true
    mat.color.setRGB(1, 1, 1)
  }
  if (mat.normalMap) {
    mat.normalMap.anisotropy = 16
    mat.normalScale?.set(1.25, 1.25)
    mat.normalMap.needsUpdate = true
  }

  // Iconic Rosso Corsa — blood-red lacquer, high clearcoat, color-first
  if (/Paint_Material/i.test(name)) {
    mat.color.setRGB(0.95, 0.018, 0.028)
    mat.metalness = 0
    mat.roughness = 0.28
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.04
    mat.envMapIntensity = 0.4
    mat.specularIntensity = 0.85
    if (mat.specularColor) mat.specularColor.setRGB(1, 0.22, 0.14)
    mat.emissive.setRGB(0.38, 0.02, 0.018)
    mat.emissiveIntensity = 0.48
    mat.toneMapped = false
  }

  // Near-black panels — soft contrast against Rosso
  if (/Coloured_Material|phong1/i.test(name)) {
    mat.color.setRGB(0.01, 0.01, 0.012)
    mat.metalness = 0.2
    mat.roughness = 0.38
    mat.clearcoat = 0.55
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 0.55
  }

  if (/Base_Material/i.test(name)) {
    mat.color.setRGB(0, 0, 0)
    mat.metalness = 0
    mat.roughness = 1
    mat.envMapIntensity = 0
    mat.emissive.setRGB(0, 0, 0)
    mat.map = null
    mat.visible = false
  }

  if (/Carbon/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.55
    mat.roughness = 0.3
    mat.clearcoat = 0.65
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 0.95
    if (mat.normalScale) mat.normalScale.set(1.4, 1.4)
  }

  // Yellow shield + cavallino — keep atlas colors true
  if (/Badge|ManufacturerPlate/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.05
    mat.roughness = 0.3
    mat.clearcoat = 0.55
    mat.clearcoatRoughness = 0.08
    mat.envMapIntensity = 0.65
    mat.emissive.setRGB(0.28, 0.16, 0.02)
    mat.emissiveIntensity = 0.45
  }

  if (/Grille/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = Math.min(Math.max(mat.metalness, 0.45), 0.7)
    mat.roughness = Math.max(0.28, Math.min(mat.roughness || 0.4, 0.45))
    mat.envMapIntensity = 0.95
  }

  // Light housings — warm lens glass (signature strip lives on LightEmissive)
  if (/LightA_Material/i.test(name) && !/Emissive/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 0.65, 0.55)
    else mat.color.setRGB(0.75, 0.12, 0.07)
    mat.metalness = 0.05
    mat.roughness = 0.14
    mat.emissive.setRGB(0.95, 0.18, 0.08)
    mat.emissiveIntensity = 1.55
    mat.clearcoat = 0.7
    mat.clearcoatRoughness = 0.05
    mat.envMapIntensity = 0.7
    mat.toneMapped = false
  }

  // Signature red LED strip / clusters — Ferrari hallmark
  if (/LightEmissive/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 0.08, 0.04)
    else mat.color.setRGB(0.45, 0.0, 0.0)
    mat.metalness = 0
    mat.roughness = 0.04
    mat.transparent = true
    mat.opacity = 0.98
    mat.emissive.setRGB(1, 0.025, 0.01)
    mat.emissiveIntensity = 7.5
    mat.depthWrite = false
    mat.toneMapped = false
    mat.envMapIntensity = 0.08
  }

  if (/Window_Material/i.test(name)) {
    mat.color.setRGB(0.015, 0.018, 0.022)
    mat.transparent = true
    mat.opacity = 0.3
    mat.metalness = 0
    mat.roughness = 0.06
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.03
    mat.envMapIntensity = 0.55
    mat.depthWrite = false
  }

  if (/Wheel/i.test(name)) {
    if (mat.map) {
      mat.color.setRGB(1, 1, 1)
    } else {
      mat.color.setRGB(0.14, 0.14, 0.16)
    }
    mat.metalness = 0.7
    mat.roughness = 0.32
    mat.clearcoat = 0.35
    mat.envMapIntensity = 1.05
  }

  // SF90 yellow calipers — hot signature accent
  if (/Calliper|Caliper/i.test(name)) {
    mat.color.setRGB(1, 0.9, 0.02)
    mat.map = null
    mat.metalness = 0.15
    mat.roughness = 0.22
    mat.clearcoat = 0.75
    mat.envMapIntensity = 0.85
    mat.emissive.setRGB(0.55, 0.35, 0)
    mat.emissiveIntensity = 0.55
    mat.toneMapped = false
  }

  if (/(Interior|Engine|SeatBelt)/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.envMapIntensity = 0.85
    mat.roughness = Math.max(mat.roughness || 0.4, 0.35)
    if (/Interior/i.test(name)) {
      mat.metalness = Math.min(mat.metalness || 0.3, 0.2)
    }
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

function applyFerrariMaterials(root) {
  const cache = new Map()
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return
    if (/Base_Geo|Base_Material|platform|podium|plinth/i.test(obj.name || '')) {
      obj.visible = false
      return
    }
    const list = Array.isArray(obj.material) ? obj.material : [obj.material]
    if (list.some((m) => m && /Base_Material/i.test(m.name || ''))) {
      obj.visible = false
      return
    }
    obj.material = Array.isArray(obj.material)
      ? list.map((m) => rebuildFerrariMaterial(m, cache))
      : rebuildFerrariMaterial(list[0], cache)
  })
}

/** Aventador — showroom navy lacquer, vivid accents, crisp carbon / glass. */
function rebuildLamborghiniMaterial(source, cache) {
  if (!source) return source
  if (cache.has(source.uuid)) return cache.get(source.uuid)

  const name = source.name || ''

  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color?.clone?.() ?? new THREE.Color(0xffffff),
    metalness: source.metalness ?? 0.45,
    roughness: source.roughness ?? 0.35,
    emissive: source.emissive?.clone?.() ?? new THREE.Color(0x000000),
    emissiveIntensity: source.emissiveIntensity ?? 1,
    transparent: !!source.transparent,
    opacity: source.opacity ?? 1,
    side: THREE.DoubleSide,
    envMapIntensity: 1.2,
  })
  transferMaps(source, mat)

  if (mat.map) {
    mat.map.anisotropy = 16
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.needsUpdate = true
  }
  if (mat.normalMap) {
    mat.normalMap.anisotropy = 16
    mat.normalScale?.set(1.2, 1.2)
    mat.normalMap.needsUpdate = true
  }

  // Textured slots: white factor so crest / flag / plate / UI hues stay true
  if (mat.map && !/RED_PAINT|PAINT_BLACK|Window_Material|RED_GLASS|ORANGE_GLASS/i.test(name)) {
    mat.color.setRGB(1, 1, 1)
  }

  // Iconic Blu Aventador — saturated dielectric, low env wash
  if (/RED_PAINT/i.test(name)) {
    mat.color.setRGB(0.08, 0.32, 1.0)
    mat.metalness = 0
    mat.roughness = 0.28
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.04
    mat.envMapIntensity = 0.22
    mat.reflectivity = 0.4
    mat.ior = 1.45
    mat.specularIntensity = 0.7
    if (mat.specularColor) mat.specularColor.setRGB(0.2, 0.45, 1)
    mat.emissive.setRGB(0.03, 0.1, 0.45)
    mat.emissiveIntensity = 0.55
    mat.toneMapped = false
  }

  if (/PAINT_BLACK/i.test(name)) {
    mat.color.setRGB(0.02, 0.02, 0.025)
    mat.metalness = 0.6
    mat.roughness = 0.28
    mat.clearcoat = 0.65
    mat.clearcoatRoughness = 0.08
    mat.envMapIntensity = 0.55
  }

  if (/PLASTIC/i.test(name)) {
    mat.color.setRGB(0.03, 0.03, 0.035)
    mat.metalness = 0.12
    mat.roughness = 0.52
    mat.clearcoat = 0.12
    mat.clearcoatRoughness = 0.28
    mat.envMapIntensity = 0.45
  }

  if (/Base_Material/i.test(name)) {
    mat.color.setRGB(0, 0, 0)
    mat.metalness = 0
    mat.roughness = 1
    mat.envMapIntensity = 0
    mat.emissive.setRGB(0, 0, 0)
    mat.map = null
    mat.visible = false
  }

  if (/Carbon/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.6
    mat.roughness = 0.28
    mat.clearcoat = 0.55
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 1.0
    if (mat.normalScale) mat.normalScale.set(1.35, 1.35)
  }

  if (/Badge|ManufacturerPlate/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.12
    mat.roughness = 0.28
    mat.clearcoat = 0.65
    mat.clearcoatRoughness = 0.08
    mat.envMapIntensity = 1.2
  }

  if (/Grille/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = Math.min(Math.max(source.metalness ?? 0.5, 0.55), 0.85)
    mat.roughness = Math.min(Math.max(source.roughness ?? 0.32, 0.2), 0.38)
    mat.envMapIntensity = 1.5
    if (mat.normalScale) mat.normalScale.set(1.3, 1.3)
  }

  if (/Window_Material/i.test(name)) {
    mat.color.setRGB(0.02, 0.025, 0.03)
    mat.transparent = true
    mat.opacity = 0.32
    mat.metalness = 0
    mat.roughness = 0.05
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.03
    mat.envMapIntensity = 1.35
    mat.ior = 1.45
    mat.depthWrite = false
  }

  if (/RED_GLASS/i.test(name)) {
    mat.color.setRGB(1, 0.0, 0.02)
    mat.transparent = true
    mat.opacity = 0.48
    mat.metalness = 0
    mat.roughness = 0.03
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(1, 0.02, 0.01)
    mat.emissiveIntensity = 5.5
    mat.envMapIntensity = 0.2
    mat.toneMapped = false
    mat.depthWrite = false
  }

  if (/ORANGE_GLASS/i.test(name)) {
    mat.color.setRGB(1, 0.42, 0.02)
    mat.transparent = true
    mat.opacity = 0.55
    mat.metalness = 0
    mat.roughness = 0.04
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.02
    mat.emissive.setRGB(1, 0.38, 0.02)
    mat.emissiveIntensity = 4.2
    mat.envMapIntensity = 0.25
    mat.toneMapped = false
    mat.depthWrite = false
  }

  // Shared front+rear housing — front stays clear; rear tint applied in applyLamborghiniMaterials
  if (/LightA_Material/i.test(name)) {
    if (mat.map) {
      mat.color.setRGB(1, 1, 1)
      mat.emissiveMap = mat.map
      mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
    }
    mat.metalness = 0.12
    mat.roughness = 0.08
    mat.clearcoat = 1
    mat.clearcoatRoughness = 0.025
    mat.emissive.setRGB(0.8, 0.88, 1)
    mat.emissiveIntensity = 1.15
    mat.envMapIntensity = 1.35
    mat.toneMapped = false
  }

  // Signature Lambo yellow calipers
  if (/Calliper|Caliper/i.test(name)) {
    mat.color.setRGB(1, 0.88, 0.02)
    mat.metalness = 0.2
    mat.roughness = 0.2
    mat.clearcoat = 0.85
    mat.clearcoatRoughness = 0.06
    mat.envMapIntensity = 1.35
  }

  if (/Wheel/i.test(name)) {
    mat.color.setRGB(0.025, 0.025, 0.03)
    mat.metalness = 0.88
    mat.roughness = 0.22
    mat.clearcoat = 0.5
    mat.clearcoatRoughness = 0.1
    mat.envMapIntensity = 1.6
    if (mat.normalScale) mat.normalScale.set(1.25, 1.25)
  }

  if (/Interior/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.1
    mat.roughness = 0.48
    mat.envMapIntensity = 0.8
  }

  if (/Engine/i.test(name)) {
    if (mat.map) mat.color.setRGB(1, 1, 1)
    mat.metalness = 0.6
    mat.roughness = 0.25
    mat.clearcoat = 0.4
    mat.envMapIntensity = 1.4
  }

  if (/SeatBelt/i.test(name)) {
    mat.color.setRGB(0.1, 0.1, 0.11)
    mat.metalness = 0.12
    mat.roughness = 0.55
    mat.envMapIntensity = 0.65
  }

  mat.needsUpdate = true
  cache.set(source.uuid, mat)
  return mat
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Loads a car GLB and plays a cinematic rise / rotate / settle entrance.
 */
function CarModel({
  url,
  targetSize = 3.4,
  playReveal = true,
  reducedMotion = false,
  active = true,
  onReady,
}) {
  const group = useRef(null)
  const reveal = useRef(1)
  const fitted = useRef(false)
  const readyFired = useRef(false)
  const baseY = useRef(0)
  const lastPlay = useRef(false)
  const { scene } = useGLTF(url)

  const applyRestPose = () => {
    if (!group.current) return
    const fit = group.current.userData.fitScale ?? 1
    reveal.current = 1
    group.current.scale.setScalar(fit)
    group.current.rotation.y = 0
    group.current.position.y = baseY.current
  }

  const applyStartPose = () => {
    if (!group.current) return
    const fit = group.current.userData.fitScale ?? 1
    reveal.current = 0
    group.current.scale.setScalar(fit * 0.78)
    group.current.rotation.y = -0.55
    group.current.position.y = baseY.current - 0.55
  }

  useLayoutEffect(() => {
    if (!group.current) return

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        const box = new THREE.Box3().setFromObject(obj)
        const size = box.getSize(new THREE.Vector3())
        const flatSpan = Math.max(size.x, size.z)
        const isFlatGround =
          (size.y < 0.08 && flatSpan > 3.5) || (size.y < 0.2 && flatSpan > 5)
        const platformName =
          /ground|floor|shadow|plane|platform|podium|stand|plinth|Base_Geo/i.test(
            obj.name || '',
          )
        if (isFlatGround || platformName) {
          obj.visible = false
          return
        }
        if (
          !/bugatti|ferrari|lamborghini|aventador|supra|toyota|bmw|m4|aston|valour|porsche|918|spyder/i.test(
            url,
          )
        ) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((mat) => prepareMaterial(mat))
        }
      }
    })

    if (/bugatti/i.test(url)) {
      applyBugattiMaterials(scene)
    } else if (/ferrari/i.test(url)) {
      applyFerrariMaterials(scene)
    } else if (/lamborghini|aventador/i.test(url)) {
      applyLamborghiniMaterials(scene)
    } else if (/supra|toyota/i.test(url)) {
      applySupraMaterials(scene)
    } else if (/bmw|m4/i.test(url)) {
      applyBmwMaterials(scene)
    } else if (/aston|valour/i.test(url)) {
      applyAstonMaterials(scene)
    } else if (/porsche|918|spyder/i.test(url)) {
      applyRebuiltMaterials(scene, rebuildPorscheMaterial)
    }

    group.current.position.set(0, 0, 0)
    group.current.rotation.set(0, 0, 0)
    group.current.scale.set(1, 1, 1)
    group.current.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(group.current)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    const scale = targetSize / maxDim
    group.current.userData.fitScale = scale
    group.current.scale.setScalar(scale)
    group.current.updateMatrixWorld(true)

    const bounds = new THREE.Box3().setFromObject(group.current)
    const center = bounds.getCenter(new THREE.Vector3())
    group.current.position.x -= center.x
    group.current.position.z -= center.z
    group.current.position.y -= bounds.min.y
    baseY.current = group.current.position.y
    fitted.current = true
    readyFired.current = false

    if (reducedMotion || !playReveal) {
      applyRestPose()
      lastPlay.current = false
    } else {
      applyStartPose()
      lastPlay.current = true
    }

    queueMicrotask(() => {
      if (!readyFired.current) {
        readyFired.current = true
        onReady?.()
      }
    })
  }, [scene, targetSize, url, onReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger entrance when playReveal turns on
  useLayoutEffect(() => {
    if (!fitted.current || !group.current) return
    if (reducedMotion) {
      applyRestPose()
      return
    }
    if (playReveal && !lastPlay.current) {
      applyStartPose()
      lastPlay.current = true
    }
    if (!playReveal) {
      lastPlay.current = false
    }
  }, [playReveal, reducedMotion])

  useFrame((_, delta) => {
    if (!group.current || !fitted.current) return
    const fit = group.current.userData.fitScale ?? 1

    if (reveal.current >= 1) {
      if (!reducedMotion && active) {
        const idle = Math.sin(performance.now() * 0.0011) * 0.01
        group.current.position.y = baseY.current + idle
      } else {
        group.current.position.y = baseY.current
      }
      return
    }

    reveal.current = Math.min(1, reveal.current + delta * 1.15)
    const t = reveal.current
    const rise = easeOutExpo(Math.min(1, t * 1.15))
    const spin = easeOutCubic(t)
    const grow = easeOutCubic(Math.min(1, t * 1.05))

    group.current.position.y = baseY.current - 0.55 * (1 - rise)
    group.current.rotation.y = -0.55 * (1 - spin)
    group.current.scale.setScalar(fit * (0.78 + 0.22 * grow))
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

export default CarModel
