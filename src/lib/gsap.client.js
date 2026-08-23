import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

let registered = false

export function registerGsap() {
  if (registered || typeof window === 'undefined') return gsap
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)
  registered = true
  return gsap
}

export { gsap, ScrollTrigger, MotionPathPlugin }
