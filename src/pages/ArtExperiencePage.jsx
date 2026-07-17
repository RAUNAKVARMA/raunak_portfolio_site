import ArtExperience from '../components/beyond/art/ArtExperience'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function ArtExperiencePage() {
  useDocumentTitle('Art — Drawing')

  return <ArtExperience />
}

export default ArtExperiencePage
