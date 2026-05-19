import gsap from 'gsap'

export function initSculptureLookAt() {
  // Restore img + remove any leftover Three.js canvas
  const img = document.querySelector('.sculpture')
  if (img) img.style.display = ''
  const canvas = document.querySelector('.sculpture-wrap canvas')
  if (canvas) canvas.remove()

  if (window.matchMedia('(pointer: coarse)').matches) return

  const wrap = document.querySelector('.sculpture-wrap')
  if (!wrap || !img) return

  // Translate the wrap — no conflict with scroll parallax (which targets .sculpture)
  const moveX = gsap.quickTo(wrap, 'x', { duration: 0.9, ease: 'power3.out' })
  const moveY = gsap.quickTo(wrap, 'y', { duration: 0.7, ease: 'power3.out' })

  // Default shadow
  img.style.filter = 'drop-shadow(0px 6px 24px rgba(0,0,0,0.14))'

  document.addEventListener('mousemove', (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5) * 2
    const dy = (e.clientY / window.innerHeight - 0.5) * 2

    moveX(dx * 22)
    moveY(dy * 14)

    // Shadow shifts opposite to cursor — simulates light source following cursor
    const sx = -dx * 18
    const sy = -dy * 12
    img.style.filter = `drop-shadow(${sx}px ${sy}px 28px rgba(0,0,0,0.26))`
  })

  document.addEventListener('mouseleave', () => {
    moveX(0)
    moveY(0)
    img.style.filter = 'drop-shadow(0px 6px 24px rgba(0,0,0,0.14))'
  })
}
