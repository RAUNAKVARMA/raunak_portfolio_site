/** Shared state for the About web engine — single source for mouse + layout. */
export const aboutWebStore = {
  mouse: { x: 0.5, y: 0.5, active: false },
  smoothMouse: { x: 0.5, y: 0.5 },
  hoverId: null,
  rootRect: null,
  nodes: new Map(),
  hub: { x: 0, y: 0 },
  layoutTick: 0,
  /** story-card-* → 0..1 drop progress */
  hang: new Map(),
  scrolling: false,
  storyPinActive: false,
  /** Landing impact bursts for canvas — { id, life } */
  landingPulses: [],
}

export function setScrolling(active) {
  aboutWebStore.scrolling = active
}

export function setStoryPinActive(active) {
  aboutWebStore.storyPinActive = active
}

export function setWebMouse(x, y, active, rootRect) {
  aboutWebStore.mouse.x = x
  aboutWebStore.mouse.y = y
  aboutWebStore.mouse.active = active
  if (rootRect) aboutWebStore.rootRect = rootRect
}

export function setRootRect(rect) {
  aboutWebStore.rootRect = rect
}

export function setWebHover(id) {
  aboutWebStore.hoverId = id
}

export function setHangProgress(id, progress) {
  aboutWebStore.hang.set(id, Math.max(0, Math.min(1, progress)))
}

export function triggerLandingPulse(id) {
  aboutWebStore.landingPulses.push({ id, life: 1 })
  if (aboutWebStore.landingPulses.length > 6) {
    aboutWebStore.landingPulses.shift()
  }
}

export function tickLandingPulses(step = 0.032) {
  aboutWebStore.landingPulses = aboutWebStore.landingPulses.filter((pulse) => {
    pulse.life -= step * 2.4
    return pulse.life > 0
  })
}

const STORY_CARD_IDS = ['story-card-0', 'story-card-1', 'story-card-2']

export function isStoryDropping(threshold = 0.97) {
  return STORY_CARD_IDS.some((id) => {
    const p = aboutWebStore.hang.get(id)
    return p !== undefined && p > 0.02 && p < threshold
  })
}

export function maxStoryHang() {
  return Math.max(...STORY_CARD_IDS.map((id) => aboutWebStore.hang.get(id) ?? 0))
}

export function tickSmoothMouse(t = 0.06) {
  aboutWebStore.smoothMouse.x += (aboutWebStore.mouse.x - aboutWebStore.smoothMouse.x) * t
  aboutWebStore.smoothMouse.y += (aboutWebStore.mouse.y - aboutWebStore.smoothMouse.y) * t
}
