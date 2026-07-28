import InterestsHero from '../components/beyond/InterestsHero'
import HobbyGrid from '../components/beyond/HobbyGrid'
import ArtSection from '../components/beyond/art/ArtSection'
import Reading from '../components/beyond/Reading'
import Values from '../components/beyond/Values'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function BeyondPage() {
  useDocumentTitle('Beyond Work')

  return (
    <div className="beyond-studio min-h-screen pb-16">
      <InterestsHero />
      <HobbyGrid />
      <ArtSection />
      <Reading />
      <Values />
    </div>
  )
}

export default BeyondPage
