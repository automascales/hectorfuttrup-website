export function initTheme() {
  const toggle = document.querySelector('.theme-toggle')
  if (!toggle) return

  function apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      toggle.textContent = 'LIGHT'
      toggle.setAttribute('aria-label', 'Switch to light mode')
    } else {
      document.documentElement.removeAttribute('data-theme')
      toggle.textContent = 'DARK'
      toggle.setAttribute('aria-label', 'Switch to dark mode')
    }
  }

  apply((() => { try { return localStorage.getItem('theme') } catch(e) { return null } })() || 'light')

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const next = isDark ? 'light' : 'dark'
    try { localStorage.setItem('theme', next) } catch (e) {}
    apply(next)
  })
}
