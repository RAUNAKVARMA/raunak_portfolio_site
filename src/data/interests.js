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
    path: '/beyond/space',
    blurb: 'Orbits, launches, and the frontier — the same wonder that pulls me toward research.',
    story: [
      'I got curious about space in 8th standard. Not as a school topic — as something I could not stop opening. Night after night I disappeared into YouTube: launches, black holes, how gravity bends light, how a universe that looks quiet is still moving.',
      'By 11th, fondness had turned into study. I worked through special and general relativity as far as I could push them from textbooks and late-night explainers. Stephen Hawking’s The Theory of Everything stayed on my desk through that stretch. For a while the future felt obvious: I wanted to become an astrophysicist.',
      'I never really left that orbit. I still listen to Neil deGrasse Tyson’s podcasts a lot — StarTalk, with Chuck and the puns included. The jokes land. The wonder stays. Engineering took the career path, but space is still the first place my mind goes when I need to feel small in a good way.',
    ],
  },
  {
    id: 'drawing',
    tag: '03',
    title: 'Drawing',
    path: '/beyond/drawing',
    blurb: 'Self-taught since first grade — sketches made for the joy of making them.',
    story: [
      'I started drawing in first grade. No classes, no formal path — just a self-taught habit that never left.',
      'I love making sketches. In my free time I sit with graphite and color and dig into studies until the page feels alive.',
      'I really enjoy that quiet craft — shape, light, and rhythm — before ideas ever become code or scenes.',
    ],
  },
  {
    id: 'cricket',
    tag: '04',
    title: 'Cricket',
    blurb: 'Weekend matches, batting order debates, and following every series.',
  },
  {
    id: 'editing',
    tag: '05',
    title: 'Video Editing',
    path: '/beyond/editing',
    blurb: 'Cutting rhythm, pacing, and mood — short-form edits shaped frame by frame.',
    story: [
      'Video editing is where timing becomes the craft — finding the cut that makes a moment land.',
      'This reel is a living stack of pieces I’ve edited; open it fullscreen and step through Prev / Next like a cinema strip.',
    ],
  },
  {
    id: 'music',
    tag: '06',
    title: 'Music',
    path: '/beyond/music',
    blurb: 'A constant background track while building — always hunting for the next song.',
    story: [
      'Music is the background track while I build — always hunting for the next song.',
    ],
  },
  {
    id: 'movies',
    tag: '07',
    title: 'Movies',
    path: '/beyond/movies',
    blurb: 'Films I rewatch for rhythm, scale, and the way a frame can hold a whole mood.',
    story: [
      'Movies are where editing, sound, and scale collide — the same instincts I chase in reels and in code.',
      'This shelf is a scroll of favorites: tall cards you drag through, one title at a time.',
    ],
  },
]

export function getInterestById(id) {
  return interestEntries.find((entry) => entry.id === id)
}
