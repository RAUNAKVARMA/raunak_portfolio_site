import Hero from '../components/Hero'
import MissionBand from '../components/MissionBand'
import FeaturedProject from '../components/FeaturedProject'
import Publications from '../components/Publications'
import Achievements from '../components/Achievements'
import HomeExplore from '../components/HomeExplore'
import BeyondTeaser from '../components/beyond/BeyondTeaser'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function HomePage() {
  useDocumentTitle('')

  return (
    <>
      <Hero />
      <div className="content-surface">
        <MissionBand />
        <FeaturedProject />
        <Publications />
        <Achievements />
        <HomeExplore />
        <BeyondTeaser />
      </div>
    </>
  )
}

export default HomePage
