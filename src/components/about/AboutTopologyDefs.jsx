/** Shared SVG defs — gradients and glow for topology lines. */
function AboutTopologyDefs({ id = 'about-topology' }) {
  const grad = `${id}-stroke`
  const glow = `${id}-glow`

  return (
    <defs aria-hidden="true">
      <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(184, 196, 168, 0.08)" />
        <stop offset="45%" stopColor="rgba(194, 202, 187, 0.55)" />
        <stop offset="100%" stopColor="rgba(212, 222, 202, 0.22)" />
      </linearGradient>
      <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

export const TOPOLOGY_GRADIENT = 'about-topology-stroke'
export const TOPOLOGY_GLOW = 'about-topology-glow'

export default AboutTopologyDefs
