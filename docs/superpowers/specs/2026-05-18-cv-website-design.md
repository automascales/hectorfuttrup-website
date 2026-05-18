# Design Spec: hectorfuttrup.com — CV Website v2

Date: 2026-05-18
Status: Approved

---

## Context

Personal identity site for Hector Futtrup (17, Copenhagen). Audience: broad — investors, employers, networking. No traditional portfolio to show. Strategy: the site itself IS the proof of taste and execution ability. WOW comes from design quality, not content volume.

Current state: Hero (name + static sculpture) → Bio (3 lines) → Contact. Approved approach: add motion, a marquee facts strip, dark mode, and a stronger bio pull-quote — all within the existing editorial beige/terracotta aesthetic.

---

## Feature 1: Sculpture Look-At Effect

**What:** The marble bust sculpture tracks the user's cursor in 3D space, tilting and turning toward wherever the mouse moves. Feels alive without Three.js.

**How:**
- Track `mousemove` on `document` (or `#hero`)
- Normalize cursor to center: `dx = (clientX / innerWidth - 0.5)`, `dy = (clientY / innerHeight - 0.5)`
- Apply to `.sculpture-wrap`:
  - `rotateY`: `dx * 30deg` (±15°, left/right turn)
  - `rotateX`: `-dy * 16deg` (±8°, up/down tilt — inverted so up cursor = tilt up)
- Add `perspective: 800px` to `.sculpture-wrap` via CSS
- Use GSAP `quickTo` for each axis — `duration: 0.6, ease: 'power3.out'` — for smooth natural lag
- Skip on touch devices (`pointer: coarse` media query check)

**Files:** `src/cursor.js` (or new `src/sculpture.js`) + `src/styles/main.css`

---

## Feature 2: Auto-Scrolling Marquee Strip

**What:** Horizontal ticker between `#bio` and `#contact`. Slow infinite scroll of personal facts. Editorial, scannable, requires zero reading effort.

**Content:**
```
Copenhagen · Venture Founder · 17 · AI · JBIA Aug 2026 · Vancouver · Work Before Comfort · First job at 14 · 3 yrs strength training ·
```
Content duplicated twice in HTML so loop is seamless.

**How:**
- New `<section id="marquee">` in `index.html` between bio and contact
- Inner: `.marquee-track` containing two identical `.marquee-content` spans
- CSS animation: `@keyframes marquee-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`
- Duration: `70s linear infinite`
- Pause on hover: `.marquee-track:hover { animation-play-state: paused }`
- Reversed second row option: skip for simplicity — one row is cleaner

**Styles:**
- Font: `var(--ff-mono)`, size `0.6rem`, letter-spacing `0.25em`, text-transform uppercase
- Color: `var(--fg)`, opacity `0.38`
- Section: `border-top: 1px solid rgba(26,20,16,0.08)`, `border-bottom: 1px solid rgba(26,20,16,0.08)`, padding `1.2rem 0`
- Overflow hidden on section

**Files:** `index.html`, `src/styles/main.css`

---

## Feature 3: Dark / Light Mode Toggle

**What:** Toggle between warm-sand (current) and near-black dark theme. Smooth transition, preference persisted.

**Toggle UI:**
- Small element in `.site-nav`, added as third flex child after `.nav-contact` (rightmost)
- Label: `[LIGHT]` / `[DARK]` in Space Mono, same size as `.nav-contact` (0.58rem)
- On active theme: dimmed opacity (0.45). On other: highlight on hover.

**Implementation:**
- `<html>` gets `data-theme="dark"` class on toggle
- CSS: `:root[data-theme="dark"] { --bg: #111009; --fg: #f2ede4; }`
- Transition on `body`: `transition: background-color 0.5s ease, color 0.5s ease`
- JS: read `localStorage.getItem('theme')` on load, apply immediately to avoid flash
- On toggle: flip `data-theme`, write to `localStorage`

**Grain + sculpture:** Both work in dark mode unchanged — grain is multiply blended, sculpture is transparent PNG on new dark bg.

**Files:** `index.html`, `src/main.js` (or new `src/theme.js`), `src/styles/main.css`

---

## Feature 4: Bio Pull-Quote Rewrite

**What:** Replace current 3-line bio with 2 punchy lines. More weight, less scatter.

**New copy:**
> *"Born in Copenhagen. Built in Vancouver.*
> *17. Founding AI ventures."*

**Style:** Same `.bio-text` Playfair italic. Same mask-reveal scroll animation. Reduce from 3 `.reveal-line` elements to 2. Remove stagger delay on 3rd child (now only 2 children).

**Files:** `index.html`, `src/styles/main.css` (remove 3rd stagger rule)

---

## Architecture Notes

- All new JS fits in existing files — no new modules required unless cleanliness demands it
- Load order: sculpture look-at init after GSAP timeline completes (at ~t=1.5s) so it doesn't fight load animations
- Dark mode: apply theme before first paint (inline `<script>` in `<head>`) to prevent flash of wrong theme
- Marquee: pure CSS animation, zero JS, zero performance cost
- No new npm dependencies needed

---

## Out of Scope

- Loading performance audit (Vite + static PNG — already fast, not a priority)
- Contact link fix (mailto: already works)
- Cloudflare Pages deployment (separate task)
