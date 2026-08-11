/** Shared mutable scroll state for the immersive art scene (wheel / touch driven). */
export const artScrollState = {
  /** Accumulated scroll position (page units) */
  position: 0,
  /** Smoothed display scroll (lerped toward position) */
  display: 0,
  /** Current velocity (page units / sec amp) */
  velocity: 0,
  /** 0–1 interaction strength for shader punch */
  energy: 0,
  /** Effect running */
  enabled: true,
}

/**
 * Apply a wheel / drag / flick impulse.
 * Fast user scrolls get high velocity; inertia carries the rest smoothly.
 */
export function impulseScroll(deltaY, { deltaMode = 0 } = {}) {
  if (!artScrollState.enabled) return

  let dy = deltaY
  if (deltaMode === 1) dy *= 18 // DOM_DELTA_LINE
  if (deltaMode === 2) dy *= 420 // DOM_DELTA_PAGE

  const sign = Math.sign(dy) || 1
  const mag = Math.abs(dy)
  if (mag < 0.15) return

  // Stronger gain so trackpad / wheel bursts flip pages quickly
  const raw = mag * 0.028 + mag * mag * 0.000055
  const boost = sign * Math.min(raw, 12)

  artScrollState.velocity += boost
  artScrollState.velocity = Math.max(-22, Math.min(22, artScrollState.velocity))
  artScrollState.energy = Math.min(1, artScrollState.energy + Math.min(0.75, Math.abs(boost) * 0.14))
}

/** Apply a release flick (px/ms → scroll velocity). */
export function impulseFlick(velocityPxPerMs) {
  if (!artScrollState.enabled) return
  if (!Number.isFinite(velocityPxPerMs)) return
  const boost = Math.max(-18, Math.min(18, velocityPxPerMs * 4.2))
  artScrollState.velocity += boost
  artScrollState.energy = Math.min(1, artScrollState.energy + Math.min(0.75, Math.abs(boost) * 0.1))
}
