import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initCursor } from './cursor.js'
import { initScroll } from './scroll.js'

gsap.registerPlugin(ScrollTrigger)

// Set initial animation states
gsap.set('.site-nav', { opacity: 0, y: -10 })
gsap.set('.name-line-inner', { y: '110%' })
gsap.set('.hero-eyebrow', { opacity: 0, y: 8 })
gsap.set('.tagline', { opacity: 0, y: 6 })
gsap.set('.sculpture-wrap', { opacity: 0, x: 20 })
gsap.set('.scroll-indicator', { opacity: 0 })

// Page load timeline
const tl = gsap.timeline({ delay: 0.15 })

tl.to('.sculpture-wrap', {
  opacity: 1,
  x: 0,
  duration: 1.4,
  ease: 'power3.out',
}, 0)

tl.to('.hero-eyebrow', {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: 'power2.out',
}, 0.1)

tl.to('.name-line-inner', {
  y: '0%',
  duration: 1.1,
  stagger: 0.1,
  ease: 'power4.out',
}, 0.2)

tl.to('.tagline', {
  opacity: 1,
  y: 0,
  duration: 0.7,
  ease: 'power2.out',
}, 0.75)

tl.to('.scroll-indicator', {
  opacity: 1,
  duration: 0.6,
  ease: 'power2.out',
}, 1.0)

tl.to('.site-nav', {
  opacity: 1,
  y: 0,
  duration: 0.7,
  ease: 'power2.out',
}, 0.4)

initCursor()
initScroll()
