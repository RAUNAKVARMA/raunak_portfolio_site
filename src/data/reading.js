/** Books + curiosity topics for Beyond / Reading. */
export const readingShelf = [
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    by: 'Goodfellow, Bengio, Courville',
    tag: 'Foundations',
    accent: '#5b8def',
    note: 'The textbook that made neural nets feel inevitable.',
    cover: '/images/books/deep-learning.jpg',
  },
  {
    id: 'pragmatic-programmer',
    title: 'The Pragmatic Programmer',
    by: 'Hunt & Thomas',
    tag: 'Craft',
    accent: '#e8e4dc',
    note: 'Ship small. Refactor early. Leave the campsite cleaner.',
    cover: '/images/books/pragmatic-programmer.jpg',
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    by: 'Yuval Noah Harari',
    tag: 'Perspective',
    accent: '#f0a868',
    note: 'Stories as the operating system of civilization.',
    cover: '/images/books/sapiens.jpg',
  },
  {
    id: 'zero-to-one',
    title: 'Zero to One',
    by: 'Peter Thiel',
    tag: 'Startups',
    accent: '#4ade80',
    note: 'Contrarian bets and monopoly math.',
    cover: '/images/books/zero-to-one.jpg',
  },
  {
    id: 'brief-history',
    title: 'A Brief History of Time',
    by: 'Stephen Hawking',
    tag: 'Space',
    accent: '#7dd3fc',
    note: 'Black holes, beginnings, and why scale humbles you.',
    cover: '/images/books/brief-history-of-time.jpg',
  },
  {
    id: 'cant-hurt-me',
    title: "Can't Hurt Me",
    by: 'David Goggins',
    tag: 'Mindset',
    accent: '#f87171',
    note: 'Calloused mind. Accountability mirror.',
    cover: '/images/books/cant-hurt-me.jpg',
  },
  {
    id: 'theory-of-everything',
    title: 'The Theory of Everything',
    by: 'Stephen Hawking',
    tag: 'Physics',
    accent: '#67e8f9',
    note: 'One theory, many questions still open.',
    cover: '/images/books/theory-of-everything.jpg',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    by: 'James Clear',
    tag: 'Productivity',
    accent: '#fbbf24',
    note: '1% compounds. Systems beat goals.',
    cover: '/images/books/atomic-habits.jpg',
  },
]

export const readingCoverUrls = readingShelf.map((book) => book.cover).filter(Boolean)

export const readingTopics = [
  { label: 'Agentic systems', signal: 'Hot', accent: '#5b8def' },
  { label: 'RL from human feedback', signal: 'Deep', accent: '#67e8f9' },
  { label: 'Systems design', signal: 'Core', accent: '#e8e4dc' },
  { label: 'Space exploration', signal: 'Wonder', accent: '#7dd3fc' },
  { label: 'Automotive design', signal: 'Love', accent: '#f87171' },
  { label: 'Chess theory', signal: 'Quiet', accent: '#fbbf24' },
]

/** Browser-cache all covers as early as possible. */
export function preloadReadingCovers() {
  readingCoverUrls.forEach((src) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
  })
}
