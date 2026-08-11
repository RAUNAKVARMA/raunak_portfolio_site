import InterestsHero from '../components/beyond/InterestsHero'
import HobbyGrid from '../components/beyond/HobbyGrid'
import Reading from '../components/beyond/Reading'
import Values from '../components/beyond/Values'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function BeyondPage() {
  useDocumentTitle('Beyond Work')

  return (
    <div className="beyond-studio min-h-screen pb-16">
      <InterestsHero />
      <HobbyGrid />
      <Reading />
      <Values />
    </div>
  )
}

export default BeyondPage
