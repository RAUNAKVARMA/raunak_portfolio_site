import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import AboutStoryStage from './AboutStoryStage'
import AboutManifestoStage from './AboutManifestoStage'
import Stats from '../Stats'
import AboutSkillsStage from './AboutSkillsStage'
import { refreshAboutScroll } from './aboutScrollMount'
import '../../styles/about-body.css'

const AboutNetworkCanvas = lazy(() => import('./AboutNetworkCanvas'))

function AboutBodyNetwork() {
  const networkRef = useRef(null)

  useLayoutEffect(() => {
    refreshAboutScroll()
    const t = window.setTimeout(refreshAboutScroll, 180)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div ref={networkRef} className="about-body-network">
      <Suspense fallback={null}>
        <AboutNetworkCanvas rootRef={networkRef} />
      </Suspense>
      <AboutStoryStage />
      <AboutManifestoStage />
      <Stats />
      <AboutSkillsStage />
    </div>
  )
}

export default AboutBodyNetwork
