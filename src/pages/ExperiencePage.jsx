import ExperienceTimeline from '../components/sections/ExperienceTimeline'
import Achievements from '../components/Achievements'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function ExperiencePage() {
  useDocumentTitle('Experience & Research')

  return (
    <div className="pt-24 sm:pt-28 bg-black">
      <ExperienceTimeline />
      <Achievements />
    </div>
  )
}

export default ExperiencePage
