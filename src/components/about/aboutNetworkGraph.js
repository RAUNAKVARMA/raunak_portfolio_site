/** Topology graph for the About page network canvas. */
export const ABOUT_NETWORK_EDGES = [
  // Story — hub mesh
  ['story-hub', 'story-card-0'],
  ['story-hub', 'story-card-1'],
  ['story-hub', 'story-card-2'],
  ['story-card-0', 'story-card-1'],
  ['story-card-1', 'story-card-2'],
  ['story-head', 'story-hub'],
  // Manifesto — radial
  ['manifesto-core', 'manifesto-mark'],
  ['manifesto-core', 'manifesto-quote'],
  ['manifesto-core', 'manifesto-body'],
  // Stats — ledger spokes
  ['stats-hub', 'stats-row-0'],
  ['stats-hub', 'stats-row-1'],
  ['stats-hub', 'stats-row-2'],
  ['stats-hub', 'stats-row-3'],
  ['stats-title', 'stats-hub'],
  // Skills — orbit spokes
  ['skills-orbit', 'skills-cluster-0'],
  ['skills-orbit', 'skills-cluster-1'],
  ['skills-orbit', 'skills-cluster-2'],
  ['skills-orbit', 'skills-cluster-3'],
  ['skills-orbit', 'skills-cluster-4'],
  ['skills-head', 'skills-orbit'],
  // Cross-section spine
  ['story-hub', 'manifesto-core'],
  ['manifesto-core', 'stats-hub'],
  ['stats-hub', 'skills-orbit'],
]

export const ABOUT_NETWORK_HUBS = new Set([
  'story-hub',
  'manifesto-core',
  'stats-hub',
  'skills-orbit',
])

export const CROSS_SECTION_EDGES = new Set([
  'story-hub|manifesto-core',
  'manifesto-core|stats-hub',
  'stats-hub|skills-orbit',
])
