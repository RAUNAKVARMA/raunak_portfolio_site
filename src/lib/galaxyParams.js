/**
 * Galaxy topology (Astrarise / Bruno Simon) + color presets.
 * Default palette = first portfolio galaxy look (pink → violet → cyan).
 */
export const spaceGalaxyDefaults = {
  count: 200000,
  branches: 4,
  radius: 6,
  randomness: 0.6,
  randomnessPower: 4,
  spin: 1,
  insideColor: '#ff66cc',
  midColor: '#7c5cff',
  outsideColor: '#4cc9f0',
}

export const GALAXY_COLOR_PRESETS = [
  {
    id: 'ideal',
    label: 'Ideal',
    insideColor: '#ff66cc',
    midColor: '#7c5cff',
    outsideColor: '#4cc9f0',
  },
  {
    id: 'nebula',
    label: 'Nebula',
    insideColor: '#ff4ec8',
    midColor: '#b44bff',
    outsideColor: '#4fd2ff',
  },
  {
    id: 'ember',
    label: 'Ember',
    insideColor: '#ff6030',
    midColor: '#ff8f5a',
    outsideColor: '#1b3984',
  },
  {
    id: 'ice',
    label: 'Ice',
    insideColor: '#e0f7ff',
    midColor: '#38bdf8',
    outsideColor: '#1d4ed8',
  },
  {
    id: 'violet',
    label: 'Violet',
    insideColor: '#f5d0fe',
    midColor: '#c084fc',
    outsideColor: '#4c1d95',
  },
]

export function getPresetById(id) {
  return GALAXY_COLOR_PRESETS.find((p) => p.id === id) || GALAXY_COLOR_PRESETS[0]
}
