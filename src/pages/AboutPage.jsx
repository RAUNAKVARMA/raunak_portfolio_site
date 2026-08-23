import About from '../components/About'
import AboutBodyNetwork from '../components/about/AboutBodyNetwork'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useLenis } from '../providers/SmoothScrollProvider'
import { useLayoutEffect } from 'react'
import { releaseAboutScrollLock } from '../components/about/aboutHeroScrollLock'
import { setScrolling } from '../components/about/aboutWebStore'
import { registerGsap } from '../lib/gsap.client'
import { prefetchAboutRoute } from '../components/about/aboutPrefetch'
import { refreshAboutScroll } from '../components/about/aboutScrollMount'

function AboutPage() {
  useDocumentTitle('About')
  const lenisRef = useLenis()

  useLayoutEffect(() => {
    prefetchAboutRoute()
    registerGsap()
    refreshAboutScroll()
    return () => {
      releaseAboutScrollLock(lenisRef)
      setScrolling(false)
    }
  }, [lenisRef])

  return (
    <div className="about-doc-page">
      <About />
      <AboutBodyNetwork />
    </div>
  )
}

export default AboutPage
