import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSceneProgress } from '../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../hooks/useReducedMotionProfile'
import AboutHero from './about/AboutHero'

const heroLines = [
  "HI, I'M RAUNAK — AN AI ENGINEER AND RESEARCHER.",
  'MY FOCUS IS ON BUILDING PRODUCTION ML SYSTEMS, PUBLISHED RESEARCH,',
  'AND PRODUCTS THAT HAVE TO HOLD UP OUTSIDE THE NOTEBOOK.',
]

function About() {
  const rootRef = useRef(null)
  const { registerSection } = useSceneProgress()
  const { prefersReducedMotion } = useReducedMotionProfile()

  useEffect(() => {
    const el = document.getElementById('about')
    if (el) registerSection('about', el)
    return () => registerSection('about', null)
  }, [registerSection])

  return (
    <article id="about" className="about-doc" ref={rootRef}>
      <Link to="/" className="about-doc__back" data-cursor-hover="true">
        <span aria-hidden="true">←</span>
        Back
      </Link>
      <AboutHero lines={heroLines} reducedMotion={prefersReducedMotion} />
    </article>
  )
}

export default About
