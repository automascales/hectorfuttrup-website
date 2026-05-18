# CV Website v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sculpture look-at effect, auto-scrolling marquee strip, dark/light mode toggle, and bio pull-quote rewrite to hectorfuttrup.com.

**Architecture:** Four independent features layered onto the existing Vite/Vanilla JS/GSAP stack. No new npm deps. Each feature touches isolated files. Dark mode uses CSS custom properties already in place — just adding a `[data-theme="dark"]` override block.

**Tech Stack:** Vite, Vanilla JS, GSAP (quickTo), Lenis, CSS custom properties, localStorage

---

## File Map

| File | Change |
|---|---|
| `src/sculpture.js` | **Create** — look-at mousemove logic |
| `src/theme.js` | **Create** — dark/light toggle logic |
| `src/main.js` | **Modify** — import + call initSculptureLookAt, initTheme |
| `index.html` | **Modify** — inline theme script in head, theme toggle in nav, marquee section, bio copy |
| `src/styles/main.css` | **Modify** — marquee styles, dark mode vars, toggle styles, bio stagger fix |

---

## Task 1: Sculpture Look-At Effect

**Files:**
- Create: `src/sculpture.js`
- Modify: `src/main.js` (add import + call)
- Modify: `src/styles/main.css` (remove `.sculpture-wrap:hover .sculpture` scale — conflicts with 3D)

The sculpture PNG tracks the cursor in 3D space: `rotateY` (left/right, ±15°) and `rotateX` (up/down, ±8°). GSAP `quickTo` provides smooth natural lag. Skipped on touch devices.

- [ ] **Step 1: Create `src/sculpture.js`**

```js
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
```

- [ ] **Step 2: Remove conflicting hover scale from `src/styles/main.css`**

Find and delete this block (around line 214):
```css
.sculpture-wrap:hover .sculpture {
  transform: scale(1.03);
}
```

The look-at 3D transform replaces this. Keeping it would conflict.

- [ ] **Step 3: Add import and call to `src/main.js`**

Add at top with other imports:
```js
import { initSculptureLookAt } from './sculpture.js'
```

Add at the bottom of the file, after `initScroll()`:
```js
initSculptureLookAt()
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Open browser. Move mouse across the hero — sculpture should tilt and turn toward cursor with smooth lag. Check no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/sculpture.js src/main.js src/styles/main.css
git commit -m "feat: sculpture look-at effect — 3D mousemove tracking"
```

---

## Task 2: Auto-Scrolling Marquee Strip

**Files:**
- Modify: `index.html` (add `#marquee` section between `#bio` and `#contact`)
- Modify: `src/styles/main.css` (add marquee styles + keyframe)

One row, 70s loop, pauses on hover. Content duplicated twice for seamless loop.

- [ ] **Step 1: Add marquee section to `index.html`**

Insert between the closing `</section>` of `#bio` and the opening `<section id="contact">`:

```html
  <!-- ─── Marquee ───────────────────────────────────────────── -->
  <section id="marquee" aria-hidden="true">
    <div class="marquee-track">
      <span class="marquee-content">Copenhagen&nbsp;·&nbsp;Venture Founder&nbsp;·&nbsp;17&nbsp;·&nbsp;AI&nbsp;·&nbsp;JBIA Aug 2026&nbsp;·&nbsp;Vancouver&nbsp;·&nbsp;Work Before Comfort&nbsp;·&nbsp;First job at 14&nbsp;·&nbsp;3 yrs strength training&nbsp;·&nbsp;&nbsp;&nbsp;</span>
      <span class="marquee-content" aria-hidden="true">Copenhagen&nbsp;·&nbsp;Venture Founder&nbsp;·&nbsp;17&nbsp;·&nbsp;AI&nbsp;·&nbsp;JBIA Aug 2026&nbsp;·&nbsp;Vancouver&nbsp;·&nbsp;Work Before Comfort&nbsp;·&nbsp;First job at 14&nbsp;·&nbsp;3 yrs strength training&nbsp;·&nbsp;&nbsp;&nbsp;</span>
    </div>
  </section>
```

- [ ] **Step 2: Add marquee styles to `src/styles/main.css`**

Add after the `#bio` block:

```css
/* ─── Marquee ─────────────────────────────────────────────── */
#marquee {
  overflow: hidden;
  border-top: 1px solid rgba(26, 20, 16, 0.08);
  border-bottom: 1px solid rgba(26, 20, 16, 0.08);
  padding: 1.2rem 0;
  background: var(--bg);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 70s linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

.marquee-content {
  font-family: var(--ff-mono);
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--fg);
  opacity: 0.38;
  white-space: nowrap;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Scroll past bio — marquee strip should appear with slow left scroll. Hover it — should pause. No layout breaks.

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "feat: auto-scrolling marquee facts strip"
```

---

## Task 3: Dark / Light Mode Toggle

**Files:**
- Modify: `index.html` (inline script in `<head>`, toggle button in nav)
- Create: `src/theme.js`
- Modify: `src/styles/main.css` (dark vars, body transition, toggle styles)
- Modify: `src/main.js` (import + call initTheme)

Inline script in head prevents flash of wrong theme on load. CSS vars already in place — dark mode just overrides them.

- [ ] **Step 1: Add flash-prevention inline script to `index.html`**

Add as the FIRST child of `<head>`, before any `<link>` tags:

```html
  <script>
    (function(){var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');})();
  </script>
```

- [ ] **Step 2: Add theme toggle button to nav in `index.html`**

The current nav:
```html
  <nav class="site-nav" aria-label="Site navigation">
    <span class="nav-coords" aria-label="Copenhagen, Denmark">55.6761° N  12.5683° E</span>
    <a href="#contact" class="nav-contact">Contact</a>
  </nav>
```

Replace with:
```html
  <nav class="site-nav" aria-label="Site navigation">
    <span class="nav-coords" aria-label="Copenhagen, Denmark">55.6761° N  12.5683° E</span>
    <div class="nav-right">
      <button class="theme-toggle" aria-label="Toggle dark mode">DARK</button>
      <a href="#contact" class="nav-contact">Contact</a>
    </div>
  </nav>
```

- [ ] **Step 3: Add dark mode CSS to `src/styles/main.css`**

Add after the `:root` block:

```css
/* Dark theme overrides */
:root[data-theme="dark"] {
  --bg: #111009;
  --fg: #f2ede4;
}
```

Add to the `body` rule — append `transition`:
```css
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--ff-mono);
  overflow-x: hidden;
  cursor: none;
  transition: background-color 0.5s ease, color 0.5s ease;
}
```

Add nav-right and theme toggle styles after `.nav-contact:hover` block:

```css
.nav-right {
  display: flex;
  align-items: center;
  gap: 1.8rem;
  pointer-events: auto;
}

.theme-toggle {
  font-family: var(--ff-mono);
  font-size: 0.58rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--fg);
  background: none;
  border: none;
  padding: 0;
  cursor: none;
  opacity: 0.45;
  transition: opacity 0.22s ease, color 0.22s ease;
}

.theme-toggle:hover {
  opacity: 1;
  color: var(--accent1);
}
```

`.nav-contact` keeps its `pointer-events: auto` — `.nav-right` also sets it, both are fine, no conflict.

- [ ] **Step 4: Create `src/theme.js`**

```js
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
```

- [ ] **Step 5: Import and call initTheme in `src/main.js`**

Add import at top:
```js
import { initTheme } from './theme.js'
```

Add at bottom of file after `initSculptureLookAt()`:
```js
initTheme()
```

Also add `.theme-toggle` to the GSAP initial nav animation — the toggle should fade in with the nav. The nav is already animated as `.site-nav` so the toggle inherits it as a child. No change needed.

- [ ] **Step 6: Verify in browser**

Run `npm run dev`. Click DARK — page transitions to dark bg. Click LIGHT — transitions back. Refresh in dark mode — should start dark with no flash. Check sculpture and grain look good on dark bg.

- [ ] **Step 7: Commit**

```bash
git add index.html src/theme.js src/main.js src/styles/main.css
git commit -m "feat: dark/light mode toggle with localStorage persistence"
```

---

## Task 4: Bio Pull-Quote Rewrite

**Files:**
- Modify: `index.html` (update bio text, reduce to 2 lines)
- Modify: `src/styles/main.css` (remove 3rd stagger delay rule)

- [ ] **Step 1: Update bio in `index.html`**

Find the current bio `<p>` block:
```html
      <p class="bio-text">
        <span class="reveal-line"><span class="reveal-line-inner">I grew up in Copenhagen. Worked since I was 14.</span></span>
        <span class="reveal-line"><span class="reveal-line-inner">Spent 10 months in Vancouver — never stopped building.</span></span>
        <span class="reveal-line"><span class="reveal-line-inner">17. Founding AI ventures. JBIA — August 2026.</span></span>
      </p>
```

Replace with:
```html
      <p class="bio-text">
        <span class="reveal-line"><span class="reveal-line-inner">Born in Copenhagen. Built in Vancouver.</span></span>
        <span class="reveal-line"><span class="reveal-line-inner">17. Founding AI ventures.</span></span>
      </p>
```

- [ ] **Step 2: Remove 3rd stagger delay from `src/styles/main.css`**

Find and delete this rule:
```css
.reveal-line:nth-child(3) .reveal-line-inner { transition-delay: 0.18s; }
```

Only 2 reveal lines now — the 3rd rule is dead code and can be confusing.

- [ ] **Step 3: Verify in browser**

Scroll to bio — two lines should reveal on scroll, staggered cleanly. Text reads: "Born in Copenhagen. Built in Vancouver. / 17. Founding AI ventures."

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "feat: bio pull-quote rewrite — two punchy lines"
```

---

## Task 5: Final polish + push

- [ ] **Step 1: Full walkthrough**

Open `npm run dev`. Check in order:
1. Hero loads — sculpture animates in, name reveals, coords scramble
2. Move mouse — sculpture tracks cursor in 3D
3. Scroll past hero — scroll progress bar fills
4. Bio section — two lines reveal on scroll
5. Marquee strip — scrolls slowly, pauses on hover
6. Contact section — fades in on scroll, magnetic effect on email link
7. Toggle DARK — smooth transition, everything readable
8. Toggle LIGHT — back to warm sand
9. Refresh in dark mode — no flash

- [ ] **Step 2: Check mobile (resize to 375px)**

Sculpture look-at: skipped (touch device) ✓
Marquee: still scrolls ✓
Dark mode toggle: visible and tappable ✓
No layout breaks ✓

- [ ] **Step 3: Push to GitHub**

```bash
git push
```

Cloudflare Pages auto-deploys if connected.
