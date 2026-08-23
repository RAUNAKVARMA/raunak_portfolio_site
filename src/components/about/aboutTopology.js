/** Local coordinates of a point inside an element, relative to a shared root. */
export function localPoint(el, root, fx = 0.5, fy = 0.5) {
  if (!el || !root) return { x: 0, y: 0 }
  const rb = root.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return {
    x: r.left + r.width * fx - rb.left,
    y: r.top + r.height * fy - rb.top,
  }
}

/** Smooth cubic curve between two points. */
export function cubicPath(p1, p2, bend = 0.3) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dist = Math.hypot(dx, dy) || 1
  const nx = -dy / dist
  const ny = dx / dist
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * bend
  const c1 = {
    x: p1.x + dx * 0.38 + nx * offset * 0.35,
    y: p1.y + dy * 0.12 + ny * offset * 0.35,
  }
  const c2 = {
    x: p1.x + dx * 0.62 - nx * offset * 0.2,
    y: p2.y - dy * 0.12 + ny * offset * 0.2,
  }
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
}

/** Hub spoke to a target — connects center to card anchor. */
export function hubPath(root, hubEl, targetEl, bend = 0.26) {
  if (!root || !hubEl || !targetEl) return ''
  const p1 = localPoint(hubEl, root, 0.5, 0.5)
  const p2 = localPoint(targetEl, root, 0.5, 0.22)
  return cubicPath(p1, p2, bend)
}

/** Link between two peer nodes (card mesh). */
export function linkPath(root, fromEl, toEl, bend = 0.38) {
  if (!root || !fromEl || !toEl) return ''
  const p1 = localPoint(fromEl, root, 0.5, 0.5)
  const p2 = localPoint(toEl, root, 0.5, 0.5)
  return cubicPath(p1, p2, bend)
}

/** Radial spoke from center to a target. */
export function radialPath(root, centerEl, targetEl, bend = 0.18) {
  if (!root || !centerEl || !targetEl) return ''
  const p1 = localPoint(centerEl, root, 0.5, 0.5)
  const p2 = localPoint(targetEl, root, 0.5, 0.5)
  return cubicPath(p1, p2, bend)
}

/** Vertical spine segment between two Y positions at fixed X. */
export function spineSegment(x, y1, y2) {
  const mid = (y1 + y2) * 0.5
  return `M ${x.toFixed(2)} ${y1.toFixed(2)} C ${x.toFixed(2)} ${mid.toFixed(2)}, ${x.toFixed(2)} ${mid.toFixed(2)}, ${x.toFixed(2)} ${y2.toFixed(2)}`
}

/** Sync stroke-dasharray to actual path length for precise draw-on. */
export function applyPathLength(pathEl, offset = null) {
  if (!pathEl) return 0
  const len = pathEl.getTotalLength()
  const dash = offset ?? len
  pathEl.style.strokeDasharray = `${len}`
  pathEl.style.strokeDashoffset = `${dash}`
  pathEl.dataset.pathLen = String(len)
  return len
}

/** Reset path to fully drawn state. */
export function revealPath(pathEl) {
  if (!pathEl) return
  pathEl.style.strokeDashoffset = '0'
}
