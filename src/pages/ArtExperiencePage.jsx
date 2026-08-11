import { useEffect } from 'react'
import ArtExperience from '../components/beyond/art/ArtExperience'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { prefetchVortexAtlas } from '../lib/vortexAtlas'

function ArtExperiencePage() {
  useDocumentTitle('Art — Drawing')

  useEffect(() => {
    prefetchVortexAtlas(8).catch(() => {})
  }, [])

  return <ArtExperience />
}

export default ArtExperiencePage
