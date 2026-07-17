import Projects from '../components/Projects'
import Certifications from '../components/Certifications'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function WorkPage() {
  useDocumentTitle('Work')

  return (
    <div className="pt-24 sm:pt-28 bg-black">
      <Projects />
      <Certifications />
    </div>
  )
}

export default WorkPage
