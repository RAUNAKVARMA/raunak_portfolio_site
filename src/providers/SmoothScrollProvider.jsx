import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, registerGsap, ScrollTrigger } from '../lib/gsap.client'
import { useReducedMotionProfile } from '../hooks/useReducedMotionProfile'
import { setScrolling } from '../components/about/aboutWebStore'

const LenisContext = createContext(null)

let scrollStopTimer = 0

function markAboutScrolling() {
  setScrolling(true)
  window.clearTimeout(scrollStopTimer)
  scrollStopTimer = window.setTimeout(() => setScrolling(false), 120)
}

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)
  const { enableSmoothScroll } = useReducedMotionProfile()

  useEffect(() => {
    if (!enableSmoothScroll) return undefined

    registerGsap()
    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.68,
      touchMultiplier: 1,
      syncTouch: true,
      syncTouchLerp: 0.08,
    })
    lenisRef.current = lenis
    document.documentElement.classList.add('lenis')

    lenis.on('scroll', () => {
      ScrollTrigger.update()
      if (window.location.pathname === '/about') markAboutScrolling()
    })

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    })

    ScrollTrigger.addEventListener('refresh', () => lenis.resize())
    ScrollTrigger.refresh()

    const tick = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      window.clearTimeout(scrollStopTimer)
      setScrolling(false)
      document.documentElement.classList.remove('lenis')
      ScrollTrigger.scrollerProxy(document.documentElement, {})
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enableSmoothScroll])

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
}

export function useLenis() {
  return useContext(LenisContext)
}
