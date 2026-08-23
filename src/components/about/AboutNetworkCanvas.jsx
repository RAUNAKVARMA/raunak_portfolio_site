import { useEffect, useRef } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { ABOUT_NETWORK_EDGES, CROSS_SECTION_EDGES } from './aboutNetworkGraph'
import {
  aboutWebStore,
  setWebHover,
  setWebMouse,
  setRootRect,
  tickLandingPulses,
  isStoryDropping,
  maxStoryHang,
} from './aboutWebStore'
import { WEB_HUBS, spokesForHub } from './aboutWebTopology'
import {
  HUB_ORB_CONFIG,
  STORY_ORB_CONFIG,
  buildCardDrapeWeb,
  buildOrbWeb,
} from './aboutSpiderWeb'
import {
  catenaryPoint,
  drawAnchorPin,
  drawFilmGrain,
  drawLandingBurst,
  drawOrganicHub,
  drawSilkPulsePoint,
  drawTexturedBundle,
  drawTexturedDew,
  drawTexturedStrand,
  drawVignetteSilk,
  drawWebAtmosphere,
  strandSeed,
} from './aboutSilkTexture'
import { bucketStrandsByKind, createWebGeometryCache, hubCacheKey } from './aboutWebGeometryCache'

function lerp(a, b, t) {
  return a + (b - a) * t
}

const ULTRA_KINDS = new Set(['tether', 'spoke', 'card-radial', 'radial'])
const RICH_KINDS = new Set(['spiral', 'card-drape', 'card-ring', 'card-weave', 'spine'])
const STORY_CARDS = ['story-card-0', 'story-card-1', 'story-card-2']
const LAYER_ORDER = [
  'aux',
  'weave',
  'card-weave',
  'card-ring',
  'ring',
  'spiral',
  'card-drape',
  'card-radial',
  'spine',
  'radial',
  'spoke',
]

function tierFor(kind, fg, quality) {
  if (quality === 'drop' || quality === 'idle') {
    if (fg && ULTRA_KINDS.has(kind)) return 'ultra'
    if (RICH_KINDS.has(kind) || kind.startsWith('card-')) return 'rich'
    return 'fine'
  }
  if (fg && (kind === 'tether' || kind === 'spoke')) return 'rich'
  if (RICH_KINDS.has(kind) || kind.startsWith('card-')) return 'rich'
  return 'scroll'
}

function drawStrandBuckets(ctx, buckets, time, fg, quality) {
  for (let i = 0; i < LAYER_ORDER.length; i += 1) {
    const list = buckets[LAYER_ORDER[i]]
    if (!list) continue
    for (let j = 0; j < list.length; j += 1) {
      const st = list[j]
      const seed = strandSeed(st.ax, st.ay, st.bx, st.by, st.kind)
      const tier = tierFor(st.kind, fg, quality)
      const sag = st.sag ?? 0
      if (st.bundle && st.bundle > 1) {
        drawTexturedBundle(ctx, st.ax, st.ay, st.bx, st.by, st.alpha, st.width, sag, seed, time, st.bundle)
      } else {
        drawTexturedStrand(ctx, st.ax, st.ay, st.bx, st.by, st.alpha, st.width, sag, seed, time, tier)
      }
    }
  }
}

function AboutNetworkCanvas({ rootRef }) {
  const bgRef = useRef(null)
  const fgRef = useRef(null)
  const tetherRef = useRef(null)
  const stateRef = useRef({
    nodes: new Map(),
    mouse: { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false },
    hoverId: null,
    frame: 0,
    time: 0,
    pulses: [],
  })
  const { prefersReducedMotion } = useReducedMotionProfile()

  useEffect(() => {
    const bgCanvas = bgRef.current
    const fgCanvas = fgRef.current
    const tetherCanvas = tetherRef.current
    const root = rootRef?.current
    if (!bgCanvas || !fgCanvas || !tetherCanvas || !root || prefersReducedMotion) return undefined

    const bgCtx = bgCanvas.getContext('2d', { alpha: true })
    const fgCtx = fgCanvas.getContext('2d', { alpha: true })
    const tetherCtx = tetherCanvas.getContext('2d', { alpha: true })
    if (!bgCtx || !fgCtx || !tetherCtx) return undefined

    let running = true
    let w = 0
    let h = 0
    let layoutFrame = 0
    let targetDpr = 1.5
    const geomCache = createWebGeometryCache()

    registerGsap()

    const applyDpr = (dpr) => {
      targetDpr = dpr
      const rect = root.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      ;[bgCanvas, fgCanvas, tetherCanvas].forEach((c) => {
        c.width = Math.max(1, Math.floor(w * dpr))
        c.height = Math.max(1, Math.floor(h * dpr))
        c.style.width = `${w}px`
        c.style.height = `${h}px`
      })
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      tetherCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bgCtx.imageSmoothingEnabled = true
      fgCtx.imageSmoothingEnabled = true
      tetherCtx.imageSmoothingEnabled = true
      geomCache.clear()
    }

    const pickDpr = (storyZone, dropping, scrolling) => {
      const cap = window.devicePixelRatio || 1
      if (storyZone || dropping) return Math.min(2, cap)
      if (scrolling) return Math.min(1.7, cap)
      return Math.min(1.85, cap)
    }

    const isStoryZone = () => {
      if (aboutWebStore.storyPinActive || isStoryDropping()) return true
      const el = root.querySelector('#about-story')
      if (!el) return false
      const r = el.getBoundingClientRect()
      return r.bottom > -80 && r.top < window.innerHeight + 80
    }

    const resize = () => {
      applyDpr(pickDpr(false, false, false))
    }

    const syncNodes = () => {
      const rootRect = root.getBoundingClientRect()
      if (rootRect.width < 1 || rootRect.height < 1) return false

      const map = stateRef.current.nodes
      const pinLocked = aboutWebStore.storyPinActive
      const storyOnly = pinLocked || isStoryDropping()
      const seen = new Set()

      const syncOne = (el) => {
        const id = el.dataset.aboutNode
        if (!id) return
        seen.add(id)

        const r = el.getBoundingClientRect()
        const fx = Number(el.dataset.aboutNodeX ?? 0.5)
        const fy = Number(el.dataset.aboutNodeY ?? 0.5)
        let tx = r.left + r.width * fx - rootRect.left
        let ty = r.top + r.height * fy - rootRect.top

        if (el.dataset.aboutTether === 'true') {
          ty = r.top - rootRect.top
          tx = r.left + r.width * 0.5 - rootRect.left
        }

        const prev = map.get(id)
        const hangP = aboutWebStore.hang.get(id) ?? 1
        const snap = pinLocked ? 1 : hangP < 0.98 ? 0.88 : 0.42
        const node = {
          id,
          x: tx,
          y: ty,
          sx: prev && snap < 1 ? lerp(prev.sx, tx, snap) : tx,
          sy: prev && snap < 1 ? lerp(prev.sy, ty, snap) : ty,
          cardRect: null,
        }

        if (el.dataset.aboutTether === 'true') {
          const card = el.querySelector('.about-net-card')
          if (card) {
            const cr = card.getBoundingClientRect()
            node.cardRect = {
              left: cr.left - rootRect.left,
              top: cr.top - rootRect.top,
              right: cr.right - rootRect.left,
              bottom: cr.bottom - rootRect.top,
              width: cr.width,
              height: cr.height,
            }
          }
        }

        map.set(id, node)
      }

      // Always keep story hub + cards fresh for tether tracking; full scan less often.
      if (storyOnly) {
        ;['story-hub', ...STORY_CARDS].forEach((id) => {
          const el = root.querySelector(`[data-about-node="${id}"]`)
          if (el) syncOne(el)
        })
      } else {
        root.querySelectorAll('[data-about-node]').forEach((el) => syncOne(el))
        map.forEach((_, id) => {
          if (!seen.has(id)) map.delete(id)
        })
      }

      setRootRect(rootRect)
      return map.size > 0
    }

    const onMove = (e) => {
      if (w < 1) return
      const rect = root.getBoundingClientRect()
      const s = stateRef.current
      s.mouse.tx = (e.clientX - rect.left) / w
      s.mouse.ty = (e.clientY - rect.top) / h
      s.mouse.active = true
      setWebMouse(s.mouse.tx, s.mouse.ty, true, rect)

      let nearest = null
      let nearestDist = Infinity
      s.nodes.forEach((node) => {
        const d = Math.hypot(e.clientX - rect.left - node.sx, e.clientY - rect.top - node.sy)
        if (d < nearestDist && d < 170) {
          nearestDist = d
          nearest = node.id
        }
      })
      s.hoverId = nearest
      setWebHover(nearest)
    }

    const onLeave = () => {
      stateRef.current.mouse.active = false
      stateRef.current.hoverId = null
      setWebMouse(0.5, 0.5, false, null)
      setWebHover(null)
    }

    const collectHubWeb = (hubId, nodes, mx, my, hoverId, config, quality) => {
      const hubNode = nodes.get(hubId)
      if (!hubNode) return { strands: [], dew: [], hub: null }

      const key = hubCacheKey(hubId, hubNode.sx, hubNode.sy, quality, hoverId, mx, my)
      return geomCache.get(key, () => {
        const smooth = new Map()
        nodes.forEach((n, k) => smooth.set(k, { ...n, x: n.sx, y: n.sy }))
        const { hub, spokes: rawSpokes } = spokesForHub(hubId, ABOUT_NETWORK_EDGES, smooth)
        if (!hub) return { strands: [], dew: [], hub: null }

        const web = buildOrbWeb(hub, rawSpokes, config, {
          mx,
          my,
          hoverId,
          hubId,
          hangMap: aboutWebStore.hang,
          mouseActive: stateRef.current.mouse.active,
        })

        return {
          strands: web.strands,
          dew: web.dew,
          hub: { x: hub.x, y: hub.y, spokes: web.spokes, active: web.hubActive },
        }
      })
    }

    const drawStoryTethers = (ctx, hubPt, time, quality) => {
      if (!hubPt) return
      const ultra = quality === 'drop' || quality === 'idle'

      STORY_CARDS.forEach((cardId, i) => {
        const hangP = aboutWebStore.hang.get(cardId) ?? 0
        const node = stateRef.current.nodes.get(cardId)
        if (!node) return

        const pinActive = aboutWebStore.storyPinActive
        const effectiveHang = hangP > 0.005 ? hangP : pinActive ? 0.06 : 0
        if (effectiveHang < 0.005) return

        const alpha = 0.38 + effectiveHang * 0.62
        const sag = 0.06 + (1 - effectiveHang) * 0.14
        const seed = strandSeed(hubPt.x, hubPt.y, node.sx, node.sy, `tether-${i}`)

        if (ultra) {
          drawTexturedBundle(ctx, hubPt.x, hubPt.y, node.sx, node.sy, alpha, 1.08, sag, seed, time, 4)
        } else {
          drawTexturedStrand(ctx, hubPt.x, hubPt.y, node.sx, node.sy, alpha, 1.05, sag, seed, time, 'rich')
        }

        if (hangP > 0.03 && hangP < 0.98 && quality !== 'scroll') {
          const pt = catenaryPoint(hubPt.x, hubPt.y, node.sx, node.sy, hangP, sag)
          drawSilkPulsePoint(ctx, pt, ultra ? 1.15 : 0.85)
          if (ultra) drawSilkPulsePoint(ctx, { x: pt.x, y: pt.y - 4 }, 0.55)
        }

        drawAnchorPin(ctx, node.sx, node.sy, 0.65 + hangP * 0.35, time, i * 31)
      })
    }

    const spawnPulse = (strands) => {
      const s = stateRef.current
      if (s.pulses.length >= 6) return
      const tethers = strands.filter((st) => (st.kind === 'tether' || st.kind === 'spoke') && st.alpha > 0.35)
      if (!tethers.length || Math.random() > 0.014) return
      const pick = tethers[Math.floor(Math.random() * tethers.length)]
      s.pulses.push({
        ax: pick.ax,
        ay: pick.ay,
        bx: pick.bx,
        by: pick.by,
        sag: pick.sag ?? 0.1,
        t: 0,
        speed: 0.004 + Math.random() * 0.005,
      })
    }

    const draw = () => {
      if (!running || w < 1 || h < 1) return

      const rootRect = root.getBoundingClientRect()
      if (rootRect.bottom < -320 || rootRect.top > window.innerHeight + 320) return

      const s = stateRef.current
      const storyPin = aboutWebStore.storyPinActive
      const dropping = isStoryDropping()
      const scrolling = aboutWebStore.scrolling
      const storyZone = storyPin || dropping || isStoryZone()
      const quality = storyZone ? (dropping ? 'drop' : 'idle') : scrolling ? 'scroll' : 'idle'

      const desiredDpr = pickDpr(storyZone, dropping, scrolling)
      if (Math.abs(desiredDpr - targetDpr) > 0.08) applyDpr(desiredDpr)

      s.time = performance.now() * 0.001
      s.frame += 1
      layoutFrame += 1

      const syncEveryFrame = storyPin || dropping
      if (syncEveryFrame || layoutFrame % 3 === 0) syncNodes()

      if (!storyPin) {
        const follow = scrolling ? 0.42 : 0.28
        s.nodes.forEach((node) => {
          node.sx = lerp(node.sx, node.x, follow)
          node.sy = lerp(node.sy, node.y, follow)
        })
      }

      const mouseLerp = storyPin ? 0.2 : scrolling ? 0.16 : 0.12
      s.mouse.x = lerp(s.mouse.x, s.mouse.tx, mouseLerp)
      s.mouse.y = lerp(s.mouse.y, s.mouse.ty, mouseLerp)

      const mx = s.mouse.x * w
      const my = s.mouse.y * h
      const hoverId = s.hoverId

      bgCtx.clearRect(0, 0, w, h)
      fgCtx.clearRect(0, 0, w, h)
      tetherCtx.clearRect(0, 0, w, h)

      const storyHubNode = s.nodes.get('story-hub')
      const hubPt = storyHubNode ? { x: storyHubNode.sx, y: storyHubNode.sy } : null

      const bgStrands = []
      const bgDew = []
      const fgStrands = []
      const fgDew = []
      const storyHubs = []
      const hubCaustics = []

      WEB_HUBS.forEach(({ id }) => {
        if (storyZone && id !== 'story-hub') return

        const isStory = id === 'story-hub'
        const config = isStory ? STORY_ORB_CONFIG : HUB_ORB_CONFIG

        const web = collectHubWeb(id, s.nodes, mx, my, hoverId, config, quality)

        const hubNode = s.nodes.get(id)
        if (hubNode) hubCaustics.push({ x: hubNode.sx, y: hubNode.sy })

        if (isStory) {
          fgStrands.push(...web.strands)
          if (quality !== 'scroll') fgDew.push(...web.dew)
          if (web.hub) storyHubs.push(web.hub)
        } else {
          bgStrands.push(...web.strands)
          if (quality === 'idle') bgDew.push(...web.dew)
        }
      })

      if (quality !== 'scroll' && !storyZone) {
        CROSS_SECTION_EDGES.forEach((key) => {
          const [fromId, toId] = key.split('|')
          const a = s.nodes.get(fromId)
          const b = s.nodes.get(toId)
          if (!a || !b) return
          bgStrands.push({
            kind: 'spine',
            ax: a.sx,
            ay: a.sy,
            bx: b.sx,
            by: b.sy,
            sag: 0.075,
            alpha: hoverId === fromId || hoverId === toId ? 0.72 : 0.28,
            width: 0.75,
          })
        })
      }

      STORY_CARDS.forEach((cardId) => {
        const node = s.nodes.get(cardId)
        if (!node?.cardRect) return
        const hangP = aboutWebStore.hang.get(cardId) ?? 0
        if (hangP < 0.04) return
        const drape = buildCardDrapeWeb({ x: node.sx, y: node.sy }, node.cardRect, hubPt, hangP, hoverId, cardId)
        fgStrands.push(...drape.strands)
        if (quality !== 'scroll') fgDew.push(...drape.dew)
      })

      const bgBuckets = bucketStrandsByKind(bgStrands)
      const fgBuckets = bucketStrandsByKind(fgStrands)

      drawStrandBuckets(bgCtx, bgBuckets, s.time, false, quality)

      const atmosScale = quality === 'idle' ? 0.55 : quality === 'drop' ? 0.72 : 0.32
      if (quality !== 'scroll') {
        drawWebAtmosphere(bgCtx, w, h, s.time, hubCaustics, atmosScale * 0.85)
        if (storyHubNode) {
          drawWebAtmosphere(fgCtx, w, h, s.time, [{ x: storyHubNode.sx, y: storyHubNode.sy }], atmosScale)
        }
      }

      drawStrandBuckets(fgCtx, fgBuckets, s.time, true, quality)

      if (quality === 'idle') {
        bgDew.forEach((d) => drawTexturedDew(bgCtx, d.x, d.y, d.alpha, s.time, d.i))
      }
      if (quality !== 'scroll') {
        fgDew.forEach((d) => drawTexturedDew(fgCtx, d.x, d.y, d.alpha, s.time, d.i))
      }

      const showTethers = storyPin || dropping || maxStoryHang() > 0.02
      if (showTethers) drawStoryTethers(tetherCtx, hubPt, s.time, quality)

      if (quality === 'idle' && !storyPin) {
        spawnPulse(fgStrands)
        s.pulses = s.pulses.filter((p) => {
          p.t += p.speed
          if (p.t > 1) return false
          const pt = catenaryPoint(p.ax, p.ay, p.bx, p.by, p.t, p.sag)
          const fade = 1 - Math.abs(p.t - 0.5) * 1.7
          drawSilkPulsePoint(fgCtx, pt, fade * 0.95)
          return true
        })
      } else {
        s.pulses = []
      }

      tickLandingPulses(quality === 'drop' ? 0.038 : 0.028)
      aboutWebStore.landingPulses.forEach((pulse, pi) => {
        const node = s.nodes.get(pulse.id)
        if (!node) return
        drawLandingBurst(tetherCtx, node.sx, node.sy, pulse.life, strandSeed(node.sx, node.sy, pi, pulse.life, 'land'))
        if (hubPt && pulse.life > 0.15 && quality !== 'scroll') {
          const travel = 1 - pulse.life * 0.85
          const pt = catenaryPoint(hubPt.x, hubPt.y, node.sx, node.sy, travel, 0.11)
          drawSilkPulsePoint(tetherCtx, pt, pulse.life * 1.15)
        }
      })

      storyHubs.forEach(({ x, y, spokes, active }) => {
        const hubBoost = quality === 'drop' ? 1 : active ? 1 : 0.82
        drawOrganicHub(fgCtx, x, y, hubBoost, s.time, strandSeed(x, y, 0, 0, 'hub'), spokes.length)
      })

      if (quality === 'idle' && !storyPin) {
        drawVignetteSilk(fgCtx, w, h)
        drawFilmGrain(fgCtx, w, h, 0.09, s.time)
        drawFilmGrain(bgCtx, w, h, 0.045, s.time)
      } else if (quality === 'drop' || (storyZone && quality === 'idle')) {
        drawVignetteSilk(fgCtx, w, h)
        drawFilmGrain(fgCtx, w, h, quality === 'drop' ? 0.04 : 0.06, s.time)
      }
    }

    registerGsap()
    gsap.ticker.add(draw)

    resize()
    syncNodes()

    const ro = new ResizeObserver(() => {
      resize()
      syncNodes()
    })
    ro.observe(root)

    window.addEventListener('resize', resize, { passive: true })
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      running = false
      gsap.ticker.remove(draw)
      ro.disconnect()
      geomCache.clear()
      window.removeEventListener('resize', resize)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [rootRef, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <>
      <canvas ref={bgRef} className="about-network-canvas about-network-canvas--bg" aria-hidden="true" />
      <canvas ref={fgRef} className="about-network-canvas about-network-canvas--fg" aria-hidden="true" />
      <canvas ref={tetherRef} className="about-network-canvas about-network-canvas--tether" aria-hidden="true" />
    </>
  )
}

export default AboutNetworkCanvas
