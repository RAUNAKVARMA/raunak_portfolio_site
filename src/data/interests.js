export const interestEntries = [
  {
    id: 'cars',
    tag: '01',
    title: 'Cars',
    path: '/beyond/cars',
    blurb: 'Obsessed with cars since two — Hot Wheels, F1, and Overdrive.',
    story: [
      'Obsessed with cars since I was two — I learned their names before almost anything else. The Hot Wheels collection still sits on my shelf.',
      'I am an F1 fan, and I still pick up Overdrive, Automobile, and Turbo every month.',
      'Favorites stay fixed: Ferrari Stradale for form and presence, Toyota Supra for the culture and the drive.',
    ],
    facts: [
      { label: 'Since', value: 'Age 2' },
      { label: 'Collection', value: 'Hot Wheels' },
      { label: 'Icons', value: 'Stradale · Supra' },
      { label: 'Reading', value: 'Overdrive · Automobile · Turbo' },
    ],
    tags: ['Hot Wheels', 'Ferrari Stradale', 'Toyota Supra', 'Formula 1', 'Overdrive'],
  },
  {
    id: 'space',
    tag: '02',
    title: 'Space',
    blurb: 'Orbits, launches, and the frontier — the same wonder that pulls me toward research.',
  },
  {
    id: 'drawing',
    tag: '03',
    title: 'Drawing',
    blurb: 'Sketching ideas before they become code — visual thinking on paper.',
  },
  {
    id: 'cricket',
    tag: '04',
    title: 'Cricket',
    blurb: 'Weekend matches, batting order debates, and following every series.',
  },
  {
    id: 'chess',
    tag: '05',
    title: 'Chess',
    blurb: 'Slow, deliberate strategy — pattern-hunting in 64 squares.',
  },
  {
    id: 'music',
    tag: '06',
    title: 'Music',
    blurb: 'A constant background track while building — always hunting for the next song.',
  },
]

export function getInterestById(id) {
  return interestEntries.find((entry) => entry.id === id)
}
