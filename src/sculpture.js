import gsap from 'gsap'

export function initSculptureLookAt() {
  if (window.matchMedia('(pointer: coarse)').matches) return

  const wrap = document.querySelector('.sculpture-wrap')
  if (!wrap) return

  gsap.set(wrap, { transformPerspective: 800 })

  const rotY = gsap.quickTo(wrap, 'rotateY', { duration: 0.6, ease: 'power3.out' })
  const rotX = gsap.quickTo(wrap, 'rotateX', { duration: 0.6, ease: 'power3.out' })

  document.addEventListener('mousemove', (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5) * 2
    const dy = (e.clientY / window.innerHeight - 0.5) * 2
    rotY(dx * 15)
    rotX(-dy * 8)
  })
}
