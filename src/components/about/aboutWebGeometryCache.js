/** Cache orb-web geometry keyed by hub position + quality tier. */

export function createWebGeometryCache() {
  const store = new Map()

  return {
    get(key, build) {
      const hit = store.get(key)
      if (hit) return hit
      const built = build()
      store.set(key, built)
      if (store.size > 24) {
        const first = store.keys().next().value
        store.delete(first)
      }
      return built
    },
    clear() {
      store.clear()
    },
  }
}

export function hubCacheKey(hubId, x, y, quality, hoverId, mx, my) {
  const qx = Math.round(x / 8) * 8
  const qy = Math.round(y / 8) * 8
  const qmx = Math.round(mx / 64) * 64
  const qmy = Math.round(my / 64) * 64
  return `${hubId}|${qx}|${qy}|${quality}|${hoverId ?? ''}|${qmx}|${qmy}`
}

export function bucketStrandsByKind(strands) {
  const buckets = Object.create(null)
  for (let i = 0; i < strands.length; i += 1) {
    const st = strands[i]
    const kind = st.kind
    if (!buckets[kind]) buckets[kind] = []
    buckets[kind].push(st)
  }
  return buckets
}
