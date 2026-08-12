/** Personal film shelf — Ciao-style vertical cards on /beyond/movies */
import interstellarPoster from '../assets/movies/interstellar.png'
import drivePoster from '../assets/movies/drive.png'
import bladeRunnerPoster from '../assets/movies/blade-runner.png'
import whiplashPoster from '../assets/movies/whiplash.png'
import amazingSpidermanPoster from '../assets/movies/amazing-spiderman.png'
import fightClubPoster from '../assets/movies/fight-club.png'
import inceptionPoster from '../assets/movies/inception.png'
import darkKnightPoster from '../assets/movies/dark-knight.png'
import matrixPoster from '../assets/movies/matrix.png'
import transformersPoster from '../assets/movies/transformers.png'

export const movies = [
  {
    id: 'interstellar',
    line1: 'Inter',
    line2: 'stellar',
    title: 'Interstellar',
    year: 2014,
    director: 'Christopher Nolan',
    note:
      'I keep coming back for the father–daughter thread. The science is huge, but the heart stays small — love as something that can bend time, not just cross space.',
    accent: '#5b9fd4',
    poster: interstellarPoster,
  },
  {
    id: 'drive',
    line1: 'Drive',
    line2: '',
    title: 'Drive',
    year: 2011,
    director: 'Nicolas Winding Refn',
    note:
      'Neon, silence, and a synth pulse that never apologizes. It feels like a midnight drive where every glance says more than a whole speech ever could.',
    accent: '#ec4899',
    poster: drivePoster,
  },
  {
    id: 'blade-runner',
    line1: 'Blade',
    line2: 'Runner',
    title: 'Blade Runner 2049',
    year: 2017,
    director: 'Denis Villeneuve',
    note:
      'Fog, scale, and that quiet ache of wondering whether a memory still counts when it was never really yours to begin with.',
    accent: '#f97316',
    poster: bladeRunnerPoster,
  },
  {
    id: 'whiplash',
    line1: 'Whip',
    line2: 'lash',
    title: 'Whiplash',
    year: 2014,
    director: 'Damien Chazelle',
    note:
      'Obsession as rhythm. Every scene lands like a stick on a snare — I put this on when I need to remember what pushing yourself actually costs.',
    accent: '#ef4444',
    poster: whiplashPoster,
  },
  {
    id: 'amazing-spiderman',
    line1: 'Amazing',
    line2: 'Spider-Man',
    title: 'The Amazing Spider-Man',
    year: 2012,
    director: 'Marc Webb',
    note:
      'The suit, the swing, the ache of being young and responsible at the same time. I still put this on when I want that moonlit city feeling — webs, risk, and a little heart under the mask.',
    accent: '#dc2626',
    poster: amazingSpidermanPoster,
  },
  {
    id: 'fight-club',
    line1: 'Fight',
    line2: 'Club',
    title: 'Fight Club',
    year: 1999,
    director: 'David Fincher',
    note:
      'Soap, fists, and that quiet panic of realizing the life you built might not be yours. I rewatch when I need something raw — chaos with a point, and a punchline that still hits.',
    accent: '#b91c1c',
    poster: fightClubPoster,
  },
  {
    id: 'inception',
    line1: 'Incep',
    line2: 'tion',
    title: 'Inception',
    year: 2010,
    director: 'Christopher Nolan',
    note:
      'Dreams inside dreams, and the idea that a feeling can be planted like a seed. I rewatch whenever I want my brain to stay awake after the credits roll.',
    accent: '#dc2626',
    poster: inceptionPoster,
  },
  {
    id: 'dark-knight',
    line1: 'Dark Knight',
    line2: 'Trilogy',
    title: 'The Dark Knight Trilogy',
    year: 2012,
    director: 'Christopher Nolan',
    note:
      'Begins, rises, burns. Chaos as philosophy, Gotham as a mirror — I still put this on when I want proof that a superhero story can say something real about the world we live in.',
    accent: '#64748b',
    poster: darkKnightPoster,
  },
  {
    id: 'matrix',
    line1: 'The',
    line2: 'Matrix',
    title: 'The Matrix',
    year: 1999,
    director: 'The Wachowskis',
    note:
      'Green code, black coats, and the question that never gets old — what if the world you trust is just a render? I put this on when I want my brain to wake up with the credits.',
    accent: '#22c55e',
    poster: matrixPoster,
  },
  {
    id: 'transformers',
    line1: 'Age of',
    line2: 'Extinction',
    title: 'Transformers: Age of Extinction',
    year: 2014,
    director: 'Michael Bay',
    note:
      'The rules have changed — robots, dinosaurs, and chaos at full volume. I put this on when I want pure spectacle and zero apologies.',
    accent: '#f97316',
    poster: transformersPoster,
  },
]

export function getMovieById(id) {
  return movies.find((m) => m.id === id)
}
