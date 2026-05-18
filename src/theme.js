export function initTheme() {
  const toggle = document.querySelector('.theme-toggle')
  if (!toggle) return

  function apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      toggle.textContent = 'LIGHT'
    } else {
      document.documentElement.removeAttribute('data-theme')
      toggle.textContent = 'DARK'
    }
  }

  apply(localStorage.getItem('theme') || 'light')

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const next = isDark ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    apply(next)
  })
}
