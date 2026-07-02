import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { registerGsap, ScrollTrigger } from '../lib/gsap.client'
import { useReducedMotionProfile } from '../hooks/useReducedMotionProfile'

const LenisContext = createContext(null)

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)
  const { enableSmoothScroll } = useReducedMotionProfile()

  useEffect(() => {
    if (!enableSmoothScroll) return undefined

    registerGsap()
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })
    lenisRef.current = lenis
    document.documentElement.classList.add('lenis')

    lenis.on('scroll', ScrollTrigger.update)

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

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
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
