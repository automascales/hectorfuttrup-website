import gsap from 'gsap'

export function initCursor() {
  const dot = document.querySelector('.cursor-dot')
  const ring = document.querySelector('.cursor-ring')

  // Don't init on touch devices
  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return

  // quickTo for smooth lag — dot is instant, ring follows with lag
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' })

  document.addEventListener('mousemove', (e) => {
    dotX(e.clientX)
    dotY(e.clientY)
    ringX(e.clientX)
    ringY(e.clientY)
  })

  // Hover state — ring expands and turns terracotta on interactive elements
  const interactives = 'a, button, .fact-chip, .magnetic, .sculpture-wrap'
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) ring.classList.add('hovered')
  })
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) ring.classList.remove('hovered')
  })

  // Shrink dot on mousedown, restore on up — tactile click feel
  document.addEventListener('mousedown', () => {
    gsap.to(dot, { scale: 0.5, duration: 0.1 })
    gsap.to(ring, { scale: 0.8, duration: 0.15 })
  })
  document.addEventListener('mouseup', () => {
    gsap.to(dot, { scale: 1, duration: 0.2, ease: 'back.out(2)' })
    gsap.to(ring, { scale: 1, duration: 0.3, ease: 'back.out(2)' })
  })

  // Hide when cursor leaves window
  document.addEventListener('mouseleave', () => {
    gsap.to([dot, ring], { opacity: 0, duration: 0.2 })
  })
  document.addEventListener('mouseenter', () => {
    gsap.to(dot, { opacity: 1, duration: 0.2 })
    gsap.to(ring, { opacity: 0.6, duration: 0.2 })
  })

  // Magnetic effect — elements with .magnetic class pull the cursor
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const radius = 90

      if (dist < radius) {
        const pull = (1 - dist / radius) * 0.4
        gsap.to(el, {
          x: dx * pull,
          y: dy * pull,
          duration: 0.4,
          ease: 'power2.out',
        })
      }
    })

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    })
  })
}
