import About from '../components/About'
import Stats from '../components/Stats'
import Skills from '../components/Skills'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function AboutPage() {
  useDocumentTitle('About')

  return (
    <div className="pt-24 sm:pt-28 bg-black">
      <About />
      <Stats />
      <Skills />
    </div>
  )
}

export default AboutPage
