/** Shared mutable scroll state for the immersive art scene (wheel / touch driven). */
export const artScrollState = {
  /** Accumulated scroll position (world units) */
  position: 0,
  /** Current velocity */
  velocity: 0,
  /** 0–1 interaction strength for shader punch */
  energy: 0,
  /** Effect running */
  enabled: true,
}
