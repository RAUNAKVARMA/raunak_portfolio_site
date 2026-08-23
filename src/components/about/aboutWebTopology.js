/** Spider-web topology helpers for About network canvas. */

export function sortSpokes(hub, nodes) {
  return nodes
    .map((n) => {
      const dx = n.x - hub.x
      const dy = n.y - hub.y
      return { ...n, angle: Math.atan2(dy, dx), dist: Math.hypot(dx, dy) }
    })
    .filter((s) => s.dist > 8)
    .sort((a, b) => a.angle - b.angle)
}

/** Point on a spoke at fraction t (0 = hub, 1 = node). */
export function spokePoint(hub, spoke, t) {
  return {
    x: hub.x + Math.cos(spoke.angle) * spoke.dist * t,
    y: hub.y + Math.sin(spoke.angle) * spoke.dist * t,
  }
}

/** Build ring vertices at radius fraction across sorted spokes. */
export function ringVertices(hub, spokes, fraction) {
  return spokes.map((s) => spokePoint(hub, s, fraction))
}

/** Nearest point on segment ab to point p. */
export function nearestOnSegment(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = dx * dx + dy * dy || 1
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len
  t = Math.max(0, Math.min(1, t))
  return { x: a.x + dx * t, y: a.y + dy * t, t }
}

/** Distance from point to segment. */
export function distToSegment(p, a, b) {
  const n = nearestOnSegment(p, a, b)
  return Math.hypot(p.x - n.x, p.y - n.y)
}

/** Group edges by hub id prefix for web rendering. */
export const WEB_HUBS = [
  { id: 'story-hub' },
  { id: 'manifesto-core' },
  { id: 'stats-hub' },
  { id: 'skills-orbit' },
]

/** Map node id → hub id for spoke grouping. */
export function spokesForHub(hubId, edges, nodes) {
  const connected = []
  edges.forEach(([from, to]) => {
    if (from === hubId && nodes.has(to)) connected.push(nodes.get(to))
    if (to === hubId && nodes.has(from)) connected.push(nodes.get(from))
  })
  const hub = nodes.get(hubId)
  if (!hub) return { hub: null, spokes: [] }
  return { hub, spokes: sortSpokes(hub, connected) }
}
