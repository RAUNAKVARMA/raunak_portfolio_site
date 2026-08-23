import { aboutWebStore } from './aboutWebStore'

const cards = new Map()

/** Story cards are driven by GSAP scroll — no JS physics loop. */
export function registerWebCard() {}

export function unregisterWebCard(id) {
  cards.delete(id)
}

export function startWebEngine() {}

export function stopWebEngine() {}

export function syncWebLayout() {}
