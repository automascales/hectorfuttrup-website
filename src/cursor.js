export function initMagneticCursor() {
  const magnetics = document.querySelectorAll('.magnetic')

  magnetics.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const radius = 100

      if (dist < radius) {
        const strength = (1 - dist / radius) * 0.45
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
      }
    })

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)'
      el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      setTimeout(() => { el.style.transition = '' }, 500)
    })
  })
}
