import * as THREE from 'three'

export const HERO_FONT =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-300-normal.woff'

const DECOY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const PHI = 2.399963229728653
const STRIPS = 5
const ROWS = 14

function pickDecoy(seed) {
  return DECOY[Math.abs(Math.floor(Math.sin(seed * 12.9898) * 43758.5453)) % DECOY.length]
}

export function smoothstep(t) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

export function easeInOutCubic(t) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

export function buildLetterPlan(lines) {
  const bio = []
  lines.forEach((line, lineIndex) => {
    ;[...line].forEach((ch, charIndex) => {
      if (ch === ' ') return
      bio.push({ ch, lineIndex, charIndex, kind: 'bio' })
    })
  })

  const orbitCount = Math.max(6, Math.floor(bio.length * 0.05))
  const columnBio = bio.slice(0, bio.length - orbitCount)
  const orbitBio = bio.slice(bio.length - orbitCount)
  const leftSplit = Math.ceil(columnBio.length / 2)

  const slots = []
  for (const side of ['left', 'right']) {
    for (let strip = 0; strip < STRIPS; strip += 1) {
      for (let row = 0; row < ROWS; row += 1) {
        slots.push({ side, strip, row })
      }
    }
  }

  const used = new Set()
  const columnLetters = columnBio.map((item, index) => {
    const side = index < leftSplit ? 'left' : 'right'
    const local = side === 'left' ? index : index - leftSplit
    const strip = local % STRIPS
    const row = Math.floor(local / STRIPS) % ROWS
    used.add(`${side}-${strip}-${row}`)
    return { ...item, side, strip, row, kind: 'column' }
  })

  const decoys = slots
    .filter((slot) => !used.has(`${slot.side}-${slot.strip}-${slot.row}`))
    .slice(0, 18)
    .map((slot, index) => ({
      ch: pickDecoy(index + slot.row * 5 + slot.strip * 11),
      side: slot.side,
      strip: slot.strip,
      row: slot.row,
      kind: 'decoy',
      lineIndex: -1,
      charIndex: index,
    }))

  const orbitLetters = orbitBio.map((item, index) => ({
    ...item,
    kind: 'orbit',
    orbitIndex: index,
  }))

  return [...columnLetters, ...decoys, ...orbitLetters]
}

export function wallPosition(side, strip, row) {
  const stripSpread = (strip - (STRIPS - 1) / 2) * 0.075
  const radius = 4.35
  const y = -0.88 - row * 0.248

  if (side === 'left') {
    const angle = Math.PI * 0.54 + stripSpread
    return new THREE.Vector3(
      -Math.abs(Math.cos(angle)) * radius,
      y,
      Math.sin(angle) * radius * 0.44 - 0.72,
    )
  }

  const angle = Math.PI * 0.46 - stripSpread
  return new THREE.Vector3(
    Math.abs(Math.cos(angle)) * radius,
    y,
    Math.sin(angle) * radius * 0.44 - 0.72,
  )
}

export function orbitPosition(index, portraitY = -0.92) {
  const angle = (PHI * index) % (Math.PI * 2)
  const radius = 1.35 + (index % 3) * 0.14
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    portraitY + Math.sin(angle * 0.5) * 0.18,
    Math.sin(angle) * radius * 0.22 + 0.08,
  )
}

export function scatterPosition(seed) {
  const angle = seed * 2.17
  const radius = 3.2 + (seed % 5) * 0.4
  return new THREE.Vector3(
    Math.cos(angle) * radius * 0.6,
    (seed % 9) * 0.28 - 1.4,
    Math.sin(angle) * radius - 4.8,
  )
}

export function targetPositions(lines) {
  const positions = new Map()
  const fontSize = 0.145
  const charW = fontSize * 0.62
  const lineH = 0.34
  const baseY = -2.05

  lines.forEach((line, lineIndex) => {
    const chars = [...line]
    const width = chars.length * charW
    let x = -width / 2 + charW / 2
    chars.forEach((ch, charIndex) => {
      if (ch === ' ') {
        x += charW
        return
      }
      positions.set(`${lineIndex}-${charIndex}`, new THREE.Vector3(x, baseY - lineIndex * lineH, 0.92))
      x += charW
    })
  })

  return positions
}

export function curvePoint(a, b, c, t) {
  const e = easeInOutCubic(t)
  const one = 1 - e
  return new THREE.Vector3(
    one * one * a.x + 2 * one * e * b.x + e * e * c.x,
    one * one * a.y + 2 * one * e * b.y + e * e * c.y,
    one * one * a.z + 2 * one * e * b.z + e * e * c.z,
  )
}

/** Iconic swooping arc from column into headline slot */
export function assemblyArcPoint(origin, target, t, lineIndex = 0) {
  const e = easeInOutCubic(t)
  const sideBias = origin.x < 0 ? -1 : 1
  const lift = 1.05 + lineIndex * 0.12
  const mid = new THREE.Vector3(
    THREE.MathUtils.lerp(origin.x, target.x, 0.18) + sideBias * 0.55 * (1 - e),
    THREE.MathUtils.lerp(origin.y, target.y, 0.12) + lift * Math.sin(e * Math.PI),
    THREE.MathUtils.lerp(origin.z, target.z, 0.25) + 1.85 * Math.sin(e * Math.PI),
  )
  return curvePoint(origin, mid, target, t)
}

const LINE_WINDOWS = [
  [0, 0.36],
  [0.3, 0.68],
  [0.62, 1],
]

export function letterProgress(scroll, lineIndex, charIndex) {
  const phase = smoothstep((scroll - 0.05) / 0.9)
  if (phase <= 0) return 0

  const [start, end] = LINE_WINDOWS[lineIndex] ?? LINE_WINDOWS[2]
  const linePhase = smoothstep((phase - start) / Math.max(0.001, end - start))
  if (linePhase <= 0) return 0

  const charGate = charIndex * 0.0034
  return smoothstep((linePhase - charGate) / 0.68)
}

export function lineAssemblyPhase(scroll, lineIndex) {
  const phase = smoothstep((scroll - 0.05) / 0.9)
  const [start, end] = LINE_WINDOWS[lineIndex] ?? LINE_WINDOWS[2]
  return smoothstep((phase - start) / Math.max(0.001, end - start))
}

/** Map a DOM headline character to world space on the hero canvas plane */
export function domCharToWorld(el, camera, canvasEl, planeZ = 0.92) {
  const charRect = el.getBoundingClientRect()
  const canvasRect = canvasEl.getBoundingClientRect()
  const ndcX = ((charRect.left + charRect.width / 2 - canvasRect.left) / canvasRect.width) * 2 - 1
  const ndcY = -(((charRect.top + charRect.height / 2 - canvasRect.top) / canvasRect.height) * 2 - 1)

  const ndc = new THREE.Vector3(ndcX, ndcY, 0.5)
  ndc.unproject(camera)

  const dir = ndc.sub(camera.position).normalize()
  if (Math.abs(dir.z) < 0.0001) return null

  const dist = (planeZ - camera.position.z) / dir.z
  return camera.position.clone().add(dir.multiplyScalar(dist))
}

/** Keep the portrait zone clean while columns are visible */
export function repelFromPortrait(pos, scroll, radius = 1.28, strength = 0.82) {
  if (scroll > 0.5) return pos
  const portraitY = THREE.MathUtils.lerp(-1.02, 0.12, smoothstep(scroll / 0.58))
  const dx = pos.x
  const dy = pos.y - portraitY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist >= radius || dist < 0.001) return pos
  const push = ((radius - dist) / radius) * strength * (1 - scroll * 0.35)
  return new THREE.Vector3(
    pos.x + (dx / dist) * push,
    pos.y + (dy / dist) * push,
    pos.z + push * 0.2,
  )
}

export function letterIntroProgress(intro, item, index = 0) {
  let delay = 0

  if (item.kind === 'column' || item.kind === 'decoy') {
    const sideDelay = item.side === 'right' ? 0.12 : 0
    delay = sideDelay + item.strip * 0.04 + item.row * 0.032
  } else if (item.kind === 'orbit') {
    delay = 0.35 + item.orbitIndex * 0.025
  } else {
    delay = index * 0.007
  }

  return smoothstep((intro - delay) / 0.42)
}

export function createRigState() {
  return {
    scroll: 0,
    scrollTarget: 0,
    intro: 0,
    introTarget: 0,
    watermark: 0,
    watermarkTarget: 0,
    mouse: { x: 0, y: 0 },
    mouseTarget: { x: 0, y: 0 },
    time: 0,
  }
}

export function dampRig(rig, delta) {
  const dt = Math.min(delta, 0.032)
  const scrollK = 1 - Math.exp(-16 * dt)
  const introK = 1 - Math.exp(-4.2 * dt)
  const mouseK = 1 - Math.exp(-14 * dt)
  const wmK = 1 - Math.exp(-6 * dt)

  rig.scroll += (rig.scrollTarget - rig.scroll) * scrollK
  rig.intro += (rig.introTarget - rig.intro) * introK
  rig.watermark += (rig.watermarkTarget - rig.watermark) * wmK
  rig.mouse.x += (rig.mouseTarget.x - rig.mouse.x) * mouseK
  rig.mouse.y += (rig.mouseTarget.y - rig.mouse.y) * mouseK
}
