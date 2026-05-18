import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScroll() {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  lenis.on('scroll', ScrollTrigger.update)

  // Scroll progress bar
  const bar = document.querySelector('.scroll-progress')
  if (bar) {
    lenis.on('scroll', ({ progress }) => {
      bar.style.width = progress * 100 + '%'
    })
  }

  // Sculpture parallax — image moves up slower than scroll
  const sculpture = document.querySelector('.sculpture')
  if (sculpture) {
    gsap.to(sculpture, {
      y: '-12%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }

  // Bio text — mask/clip reveal per line
  document.querySelectorAll('.reveal-line').forEach((el) => {
    const inner = el.querySelector('.reveal-line-inner')
    if (!inner) return
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => el.classList.add('revealed'),
    })
  })

  // Contact section — fade up
  const contactInner = document.querySelector('.contact-inner')
  if (contactInner) {
    gsap.fromTo(contactInner,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '#contact', start: 'top 85%' },
      }
    )
  }

  // Smooth anchor navigation (nav Contact link)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(a.getAttribute('href'))
      if (target) lenis.scrollTo(target, { offset: -56 })
    })
  })

  return lenis
}
