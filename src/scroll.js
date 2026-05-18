import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScroll(onExplosionProgress) {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  // Lenis → GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  // Lenis → ScrollTrigger sync (required for pin to work correctly)
  lenis.on('scroll', ScrollTrigger.update)

  // ScrollTrigger: drive explosion progress (canvas is already fixed — no pin needed)
  ScrollTrigger.create({
    trigger: '#explosion',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => {
      onExplosionProgress(self.progress)
    },
  })

  // Bio text reveal
  document.querySelectorAll('.reveal-word').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        el.style.transitionDelay = `${i * 0.18}s`
        el.classList.add('revealed')
      },
    })
  })

  return lenis
}
