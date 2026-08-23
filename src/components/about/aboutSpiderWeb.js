/** Movie-accurate orb-web geometry — radial spokes, ring polygons, spiral fill, cross-weave. */

import { distToSegment, ringVertices, sortSpokes, spokePoint } from './aboutWebTopology'

export const STORY_ORB_CONFIG = {
  minSpokes: 18,
  ringFractions: [0.1, 0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82],
  crossWeaveRingIndices: [0, 1, 2, 3, 4, 5],
  spiralFraction: 0.52,
  spiralAngleOffset: 0.095,
  secondarySpiralFraction: 0.66,
  secondarySpiralOffset: -0.06,
  stabilizerFractions: [0.36, 0.62],
  auxiliaryFill: true,
  dewRingIndices: [3, 5, 7, 9],
}

/** Lighter orb for scroll / drop — keeps frame rate stable. */
export const STORY_ORB_LITE = {
  minSpokes: 10,
  ringFractions: [0.22, 0.44, 0.66, 0.86],
  crossWeaveRingIndices: [0, 1],
  spiralFraction: 0.48,
  spiralAngleOffset: 0.08,
  secondarySpiralFraction: 0,
  secondarySpiralOffset: 0,
  stabilizerFractions: [0.5],
  auxiliaryFill: false,
  dewRingIndices: [],
}

export const HUB_ORB_CONFIG = {
  minSpokes: 14,
  ringFractions: [0.18, 0.32, 0.46, 0.6, 0.74],
  crossWeaveRingIndices: [0, 1, 2],
  spiralFraction: 0.52,
  spiralAngleOffset: 0.08,
  secondarySpiralFraction: 0.68,
  secondarySpiralOffset: -0.05,
  stabilizerFractions: [0.4],
  auxiliaryFill: true,
  dewRingIndices: [1, 2, 3, 4],
}

export const CARD_DRAPE_CONFIG = {
  radials: 11,
  rings: [0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.94],
  crossWeave: true,
  borderStrands: 9,
  cornerRadials: true,
}

/** Insert virtual spokes in largest angular gaps for a full orb web. */
export function enrichSpokes(hub, spokes, minCount = 12) {
  const sorted = sortSpokes(hub, spokes.filter((s) => s.dist > 6))
  if (sorted.length < 2) return sorted

  const avgDist = sorted.reduce((sum, s) => sum + s.dist, 0) / sorted.length
  const out = []

  for (let i = 0; i < sorted.length; i += 1) {
    out.push({ ...sorted[i], real: true })
    const next = sorted[(i + 1) % sorted.length]
    let gap = next.angle - sorted[i].angle
    if (gap <= 0) gap += Math.PI * 2
    const inserts = Math.max(1, Math.ceil((gap / (Math.PI * 2)) * minCount) - 1)

    for (let j = 1; j <= inserts; j += 1) {
      const t = j / (inserts + 1)
      const angle = sorted[i].angle + gap * t
      out.push({
        id: `v-${i}-${j}`,
        x: hub.x + Math.cos(angle) * avgDist,
        y: hub.y + Math.sin(angle) * avgDist,
        angle,
        dist: avgDist,
        virtual: true,
        real: false,
      })
    }
  }

  return out.sort((a, b) => a.angle - b.angle)
}

function pushStrand(list, strand) {
  list.push(strand)
}

/** Classic orb-web spiral fill — inner ring vertex to next spoke outer ring. */
function buildAuxiliaryFill(hub, spokes, ringFracs, hubActive) {
  const strands = []
  const rings = ringFracs.map((f) => ringVertices(hub, spokes, f))

  for (let ri = 1; ri < rings.length; ri += 1) {
    const inner = rings[ri - 1]
    const outer = rings[ri]
    for (let i = 0; i < spokes.length; i += 1) {
      const j = (i + 1) % spokes.length
      const a = inner[i]
      const b = outer[j]
      strands.push({
        kind: 'aux',
        ax: a.x,
        ay: a.y,
        bx: b.x,
        by: b.y,
        alpha: hubActive ? 0.2 : 0.1,
        width: 0.42,
        sag: 0.022,
      })
    }
  }
  return strands
}

function buildStabilizers(hub, spokes, fractions, hubActive) {
  const strands = []
  fractions.forEach((frac) => {
    const verts = ringVertices(hub, spokes, frac)
    for (let i = 0; i < verts.length; i += 3) {
      const a = verts[i]
      const b = verts[(i + 2) % verts.length]
      strands.push({
        kind: 'weave',
        ax: a.x,
        ay: a.y,
        bx: b.x,
        by: b.y,
        alpha: hubActive ? 0.14 : 0.07,
        width: 0.34,
        sag: 0.008,
      })
    }
  })
  return strands
}

function buildSpiralRing(hub, spokes, fraction, angleOffset, hubActive, kind = 'spiral') {
  const { x: hx, y: hy } = hub
  const spiralVerts = ringVertices(hub, spokes, fraction).map((v, i) => {
    const angle = spokes[i]?.angle ?? 0
    const dist = Math.hypot(v.x - hx, v.y - hy)
    return {
      x: hx + Math.cos(angle + angleOffset) * dist * 1.032,
      y: hy + Math.sin(angle + angleOffset) * dist * 1.032,
    }
  })
  const strands = []
  for (let i = 0; i < spiralVerts.length; i += 1) {
    const a = spiralVerts[i]
    const b = spiralVerts[(i + 1) % spiralVerts.length]
    strands.push({
      kind,
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      alpha: hubActive ? (kind === 'spiral' ? 0.32 : 0.22) : kind === 'spiral' ? 0.14 : 0.09,
      width: kind === 'spiral' ? 0.48 : 0.38,
      sag: 0.014,
    })
  }
  return strands
}

export function buildOrbWeb(hub, rawSpokes, config, opts = {}) {
  const {
    mx = 0,
    my = 0,
    hoverId = null,
    hubId = '',
    hangMap = new Map(),
    mouseActive = false,
  } = opts

  const hx = hub.x
  const hy = hub.y
  const hubActive = hoverId === hubId
  const spokes = enrichSpokes({ x: hx, y: hy }, rawSpokes, config.minSpokes)
  const strands = []
  const dew = []

  spokes.forEach((sp) => {
    const isTether = sp.real && sp.id?.startsWith('story-card-')
    const hangP = isTether ? (hangMap.get(sp.id) ?? 1) : 1
    const active = hubActive || sp.id === hoverId
    const prox = Math.max(0, 1 - distToSegment({ x: mx, y: my }, { x: hx, y: hy }, sp) / 170)

    let bx = sp.x
    let by = sp.y
    if (mouseActive && !isTether) {
      const pull = prox * 0.014
      bx += (mx - bx) * pull
      by += (my - by) * pull
    }

    pushStrand(strands, {
      kind: isTether ? 'tether' : sp.virtual ? 'radial' : 'spoke',
      ax: hx,
      ay: hy,
      bx,
      by,
      sag: isTether ? 0.05 + (1 - hangP) * 0.18 : sp.virtual ? 0.065 : 0.088 + (active ? 0.028 : 0),
      alpha: isTether
        ? 0.7 + hangP * 0.3 + (active ? 0.12 : 0) + (hangP < 0.95 ? (1 - hangP) * 0.15 : 0)
        : sp.virtual
          ? 0.16 + prox * 0.12
          : active
            ? 0.96
            : 0.36 + prox * 0.28,
      width: isTether ? 1.3 + hangP * 0.55 : sp.virtual ? 0.44 : active ? 1.08 : 0.68 + prox * 0.2,
      bundle: isTether ? 4 : 1,
    })
  })

  config.ringFractions.forEach((frac, ri) => {
    const verts = ringVertices({ x: hx, y: hy }, spokes, frac)
    const ringAlpha = hubActive ? 0.48 - ri * 0.04 : 0.18 - ri * 0.015

    if (config.dewRingIndices.includes(ri)) {
      verts.forEach((v, i) => dew.push({ x: v.x, y: v.y, alpha: ringAlpha + 0.22, i: ri * 12 + i }))
    }

    for (let i = 0; i < verts.length; i += 1) {
      const a = verts[i]
      const b = verts[(i + 1) % verts.length]
      const prox = Math.max(0, 1 - distToSegment({ x: mx, y: my }, a, b) / 100)
      pushStrand(strands, {
        kind: 'ring',
        ax: a.x,
        ay: a.y,
        bx: b.x,
        by: b.y,
        alpha: Math.max(0.08, ringAlpha + prox * 0.2),
        width: 0.48 + prox * 0.12,
        sag: 0,
      })
    }

    if (config.crossWeaveRingIndices.includes(ri) && verts.length >= 4) {
      for (let i = 0; i < verts.length; i += 1) {
        const j = (i + 2) % verts.length
        pushStrand(strands, {
          kind: 'weave',
          ax: verts[i].x,
          ay: verts[i].y,
          bx: verts[j].x,
          by: verts[j].y,
          alpha: hubActive ? 0.2 : 0.09,
          width: 0.42,
          sag: 0,
        })
        const k = (i + Math.ceil(verts.length / 3)) % verts.length
        pushStrand(strands, {
          kind: 'weave',
          ax: verts[i].x,
          ay: verts[i].y,
          bx: verts[k].x,
          by: verts[k].y,
          alpha: hubActive ? 0.12 : 0.06,
          width: 0.32,
          sag: 0,
        })
      }
    }
  })

  if (config.auxiliaryFill) {
    strands.push(...buildAuxiliaryFill({ x: hx, y: hy }, spokes, config.ringFractions, hubActive))
  }

  if (config.stabilizerFractions?.length) {
    strands.push(...buildStabilizers({ x: hx, y: hy }, spokes, config.stabilizerFractions, hubActive))
  }

  if (config.spiralFraction) {
    strands.push(
      ...buildSpiralRing(
        { x: hx, y: hy },
        spokes,
        config.spiralFraction,
        config.spiralAngleOffset,
        hubActive,
        'spiral',
      ),
    )
  }

  if (config.secondarySpiralFraction) {
    strands.push(
      ...buildSpiralRing(
        { x: hx, y: hy },
        spokes,
        config.secondarySpiralFraction,
        config.secondarySpiralOffset ?? -config.spiralAngleOffset,
        hubActive,
        'spiral',
      ),
    )
  }

  return { strands, dew, spokes, hubActive }
}

/** Mini orb web draped over a hanging card — pin at top center. */
export function buildCardDrapeWeb(pin, cardRect, hub, hangP, hoverId, nodeId) {
  const strands = []
  const dew = []
  if (!cardRect || hangP < 0.04) return { strands, dew }

  const px = pin.x
  const py = pin.y
  const { left, top, right, bottom, width, height } = cardRect
  const active = hoverId === nodeId
  const alphaBase = (0.22 + hangP * 0.68) * (active ? 1.15 : 1)

  const targets = []
  for (let i = 0; i < CARD_DRAPE_CONFIG.radials; i += 1) {
    const t = i / (CARD_DRAPE_CONFIG.radials - 1)
    targets.push({
      x: left + width * t,
      y: top + height * (0.08 + Math.sin(t * Math.PI) * 0.12),
    })
  }
  if (CARD_DRAPE_CONFIG.cornerRadials) {
    targets.push({ x: left + width * 0.04, y: top + height * 0.18 })
    targets.push({ x: right - width * 0.04, y: top + height * 0.18 })
  }
  targets.push({ x: left + width * 0.12, y: bottom - height * 0.08 })
  targets.push({ x: right - width * 0.12, y: bottom - height * 0.08 })
  if (hub) {
    targets.push({
      x: px + (hub.x - px) * 0.15,
      y: py + (hub.y - py) * 0.12,
    })
  }

  const radialEnds = targets.map((t) => ({
    x: px + (t.x - px) * 0.92,
    y: py + (t.y - py) * 0.92,
    angle: Math.atan2(t.y - py, t.x - px),
    dist: Math.hypot(t.x - px, t.y - py) * 0.92,
  }))

  radialEnds.forEach((end, i) => {
    pushStrand(strands, {
      kind: 'card-radial',
      ax: px,
      ay: py,
      bx: end.x,
      by: end.y,
      sag: 0.045 + (1 - hangP) * 0.025,
      alpha: alphaBase * (0.58 + (i % 2) * 0.1),
      width: 0.56,
    })
  })

  CARD_DRAPE_CONFIG.rings.forEach((frac, ri) => {
    const verts = radialEnds.map((r) => ({
      x: px + Math.cos(r.angle) * r.dist * frac,
      y: py + Math.sin(r.angle) * r.dist * frac,
    }))
    const ringA = alphaBase * (0.35 - ri * 0.04)

    for (let i = 0; i < verts.length; i += 1) {
      const a = verts[i]
      const b = verts[(i + 1) % verts.length]
      pushStrand(strands, {
        kind: 'card-ring',
        ax: a.x,
        ay: a.y,
        bx: b.x,
        by: b.y,
        alpha: Math.max(0.06, ringA),
        width: 0.38,
        sag: 0.01,
      })
      if (ri >= CARD_DRAPE_CONFIG.rings.length - 2) {
        dew.push({ x: a.x, y: a.y, alpha: ringA + 0.15, i: ri * 9 + i })
      }
    }

    if (CARD_DRAPE_CONFIG.crossWeave && ri === 1 && verts.length >= 4) {
      for (let i = 0; i < verts.length; i += 2) {
        const j = (i + 3) % verts.length
        pushStrand(strands, {
          kind: 'card-weave',
          ax: verts[i].x,
          ay: verts[i].y,
          bx: verts[j].x,
          by: verts[j].y,
          alpha: ringA * 0.85,
          width: 0.32,
          sag: 0.012,
        })
      }
    }
  })

  for (let i = 0; i < CARD_DRAPE_CONFIG.borderStrands; i += 1) {
    const t = i / (CARD_DRAPE_CONFIG.borderStrands - 1)
    const bx = left + width * t
    const by = bottom - height * 0.04
    pushStrand(strands, {
      kind: 'card-drape',
      ax: px + (bx - px) * 0.35,
      ay: py + (by - py) * 0.2,
      bx,
      by,
      sag: 0.055,
      alpha: alphaBase * 0.42,
      width: 0.45,
    })
  }

  return { strands, dew }
}

/** Triple-bundle tether like bundled silk in film webs. */
export function bundleOffsets(ax, ay, bx, by, count = 3, spread = 2.5) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const lines = []
  for (let i = 0; i < count; i += 1) {
    const off = (i - (count - 1) / 2) * spread
    lines.push({
      ax: ax + nx * off,
      ay: ay + ny * off,
      bx: bx + nx * off * 0.35,
      by: by + ny * off * 0.35,
    })
  }
  return lines
}

export { spokePoint, distToSegment }
