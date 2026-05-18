import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initCursor } from './cursor.js'
import { initScroll } from './scroll.js'

gsap.registerPlugin(ScrollTrigger)

function scrambleToCoords(el, target, duration = 1800) {
  const digits = '0123456789'
  const frameMs = 35
  const steps = Math.ceil(duration / frameMs)
  let step = 0
  const interval = setInterval(() => {
    step++
    const lockCount = Math.floor((step / steps) * target.length)
    let out = ''
    for (let i = 0; i < target.length; i++) {
      const c = target[i]
      if (i < lockCount || c === '°' || c === ' ' || c === 'N' || c === 'E' || c === ',' || c === '.') {
        out += c
      } else {
        out += digits[Math.floor(Math.random() * digits.length)]
      }
    }
    el.textContent = out
    if (step >= steps) {
      clearInterval(interval)
      el.textContent = target
    }
  }, frameMs)
}

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

tl.call(() => {
  const coords = document.querySelector('.nav-coords')
  if (coords) scrambleToCoords(coords, '55.6761° N  12.5683° E', 1800)
}, [], 0.65)

initCursor()
initScroll()
