# WM Dresden 2026 — Public Viewing Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive full-screen Mapbox map for Dresden showing World Cup 2026 public viewing spots, with a draggable bottom sheet, animated venue cards, detail panel, and DE/EN language toggle.

**Architecture:** React + Vite SPA. All venue data lives in `src/data/venues.json` edited manually. Mapbox GL JS renders the map with custom gold pins. Framer Motion handles all UI animations (bottom sheet drag, slide-up detail panel, staggered card entrance). Language state lives in a React context.

**Tech Stack:** React 18, Vite 5, Mapbox GL JS 3, Framer Motion 11, Vitest + @testing-library/react

---

## File Map

| File | Responsibility |
|---|---|
| `src/main.jsx` | React root mount |
| `src/App.jsx` | App shell: selected venue state, render all components |
| `src/index.css` | Global reset, CSS vars, map pin styles + pulse keyframe |
| `src/i18n.js` | DE/EN translation object |
| `src/data/venues.json` | Venue data array (manually edited) |
| `src/context/LanguageContext.jsx` | Language context + `useLanguage` hook |
| `src/components/LanguageToggle.jsx` | DE/EN pill button with crossfade |
| `src/components/Map.jsx` | Mapbox GL JS map + gold markers + flyTo |
| `src/components/VenueCard.jsx` | Compact card shown in bottom sheet |
| `src/components/BottomSheet.jsx` | Draggable bottom sheet with card row |
| `src/components/VenueDetail.jsx` | Slide-up detail panel with full venue info |
| `src/test/setup.js` | Vitest setup: @testing-library/jest-dom |
| `src/test/LanguageContext.test.jsx` | Tests for language toggle logic |
| `src/test/VenueCard.test.jsx` | Tests for card render and click |
| `src/test/LanguageToggle.test.jsx` | Tests for toggle render |
| `vite.config.js` | Vite + Vitest config |
| `.env` | `VITE_MAPBOX_TOKEN=...` (gitignored) |

---

## Task 1: Scaffold project and install dependencies

**Files:**
- Create: `package.json`, `vite.config.js`, `.env`, `.gitignore`, `src/main.jsx`, `index.html`

- [ ] **Step 1: Initialize Vite React project in the existing folder**

```bash
cd /Users/alekseyermoshin/dev/wm-public-viewing
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — select **Yes** (the only existing files are `docs/` which Vite won't touch since it only writes to the root and `src/`).

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install mapbox-gl framer-motion
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **Step 4: Delete boilerplate files you won't use**

```bash
rm src/App.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 5: Create `.env` with your Mapbox token**

Get a free token at https://account.mapbox.com → Tokens → Create a token (or use the default public token).

Create `.env` in the project root:
```
VITE_MAPBOX_TOKEN=pk.YOUR_TOKEN_HERE
```

- [ ] **Step 6: Ensure `.gitignore` includes `.env`**

Open `.gitignore` (Vite creates it). Verify these lines exist — add if missing:
```
.env
.env.local
node_modules
dist
```

- [ ] **Step 7: Update `index.html` — set title and add full-height styles**

Replace the contents of `index.html` with:
```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WM Dresden 2026 — Public Viewing</title>
    <style>
      html, body, #root { height: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Replace `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite prints a local URL (e.g. `http://localhost:5173`). Opening it shows a blank white page (App.jsx still has boilerplate — that's fine for now).

- [ ] **Step 10: Commit**

```bash
git init
git add index.html src/main.jsx .gitignore package.json vite.config.js
git commit -m "chore: scaffold Vite React project with dependencies"
```

---

## Task 2: Configure Vite and test infrastructure

**Files:**
- Modify: `vite.config.js`
- Create: `src/test/setup.js`

- [ ] **Step 1: Replace `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['mapbox-gl'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

The `optimizeDeps.exclude` prevents Vite from pre-bundling mapbox-gl, which has known issues with Vite's optimizer.

- [ ] **Step 2: Create test setup file**

```bash
mkdir -p src/test
```

Create `src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to `package.json`**

Open `package.json`. The `"scripts"` section should already have `"dev"`, `"build"`, `"preview"`. Add two test scripts:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 4: Verify test infrastructure works**

Create a temporary smoke test `src/test/smoke.test.js`:
```js
test('test infrastructure works', () => {
  expect(1 + 1).toBe(2)
})
```

Run:
```bash
npm run test:run
```

Expected output: `✓ src/test/smoke.test.js (1 test) — PASS`

- [ ] **Step 5: Delete the smoke test**

```bash
rm src/test/smoke.test.js
```

- [ ] **Step 6: Commit**

```bash
git add vite.config.js src/test/setup.js package.json
git commit -m "chore: configure Vitest with jsdom"
```

---

## Task 3: Global CSS — design tokens, reset, map pin styles

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css` entirely**

```css
/* Design tokens */
:root {
  --bg-deep: #0a0a14;
  --bg-card: #0d1526;
  --bg-card-hover: #141f35;
  --accent: #f4a261;
  --accent-dim: rgba(244, 162, 97, 0.3);
  --text-primary: #ffffff;
  --text-secondary: #8899bb;
  --border-muted: #2a3a5c;
  --shadow-sheet: 0 -4px 20px rgba(0, 0, 0, 0.5);
  --radius-card: 12px;
  --radius-sheet: 16px;
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-deep);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* Hide scrollbars on bottom sheet card row */
.cards-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.cards-row::-webkit-scrollbar {
  display: none;
}

/* Mapbox map pin */
.map-pin {
  width: 20px;
  height: 20px;
  background: var(--accent);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(244, 162, 97, 0.4);
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.map-pin::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(244, 162, 97, 0.5);
  transform: translate(-50%, -50%) rotate(45deg);
  animation: pin-pulse 2s ease-out infinite;
}

.map-pin--active {
  transform: rotate(-45deg) scale(1.4);
  box-shadow: 0 0 14px rgba(244, 162, 97, 0.9), 0 2px 8px rgba(244, 162, 97, 0.5);
}

@keyframes pin-pulse {
  0% {
    transform: translate(-50%, -50%) rotate(45deg) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) rotate(45deg) scale(2.8);
    opacity: 0;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "style: global CSS, design tokens, map pin animations"
```

---

## Task 4: Translations (i18n)

**Files:**
- Create: `src/i18n.js`

- [ ] **Step 1: Create `src/i18n.js`**

```js
export const t = {
  de: {
    venueCount: (n) => `${n} ORTE IN DRESDEN`,
    indoor: 'Drinnen',
    outdoor: 'Draußen',
    screens: (n) => `${n} ${n === 1 ? 'Bildschirm' : 'Bildschirme'}`,
    visitWebsite: 'Webseite besuchen →',
    hours: 'Öffnungszeiten',
    types: {
      bar: 'Bar',
      restaurant: 'Restaurant',
      outdoor: 'Outdoor',
      other: 'Sonstiges',
    },
  },
  en: {
    venueCount: (n) => `${n} PLACES IN DRESDEN`,
    indoor: 'Indoor',
    outdoor: 'Outdoor',
    screens: (n) => `${n} ${n === 1 ? 'screen' : 'screens'}`,
    visitWebsite: 'Visit website →',
    hours: 'Opening hours',
    types: {
      bar: 'Bar',
      restaurant: 'Restaurant',
      outdoor: 'Outdoor',
      other: 'Other',
    },
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n.js
git commit -m "feat: DE/EN translation strings"
```

---

## Task 5: Venue data

**Files:**
- Create: `src/data/venues.json`

- [ ] **Step 1: Create `src/data/venues.json` with three sample venues**

```bash
mkdir -p src/data
```

```json
[
  {
    "id": "watzke",
    "name": "Brauhaus Watzke",
    "type": "bar",
    "coordinates": [13.6803, 51.0649],
    "address": "Kötzschenbroder Str. 1, 01139 Dresden",
    "photo": null,
    "screens": 3,
    "indoor": true,
    "hours": "17:00 – 24:00",
    "website": "https://watzke.de",
    "description": {
      "de": "Klassische Dresdner Brauerei direkt an der Elbe. Mehrere große Bildschirme im Schankraum und auf der Terrasse.",
      "en": "Classic Dresden brewery right on the Elbe river. Multiple large screens in the taproom and on the terrace."
    }
  },
  {
    "id": "strandbar",
    "name": "Strandbar Elbe",
    "type": "outdoor",
    "coordinates": [13.7420, 51.0520],
    "address": "Terrassenufer 1, 01069 Dresden",
    "photo": null,
    "screens": 1,
    "indoor": false,
    "hours": "15:00 – 23:00",
    "website": null,
    "description": {
      "de": "Entspannte Strandbar direkt an der Elbe mit einem großen Outdoor-Screen. Perfekt für Sommerspiele.",
      "en": "Relaxed beach bar right on the Elbe with one large outdoor screen. Perfect for summer matches."
    }
  },
  {
    "id": "sportscafe",
    "name": "Sports Café König",
    "type": "restaurant",
    "coordinates": [13.7380, 51.0500],
    "address": "Altmarkt 15, 01067 Dresden",
    "photo": null,
    "screens": 5,
    "indoor": true,
    "hours": "16:00 – 02:00",
    "website": null,
    "description": {
      "de": "Großes Sports Café am Altmarkt mit 5 Bildschirmen und Leinwand. Reservierung für Spielabende empfohlen.",
      "en": "Large sports café at Altmarkt with 5 screens and a projection wall. Reservations recommended for match nights."
    }
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/venues.json
git commit -m "data: add three sample Dresden venues"
```

---

## Task 6: LanguageContext (TDD)

**Files:**
- Create: `src/context/LanguageContext.jsx`
- Create: `src/test/LanguageContext.test.jsx`

- [ ] **Step 1: Write the failing tests first**

Create `src/test/LanguageContext.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../context/LanguageContext'

function TestComponent() {
  const { lang, toggleLang } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={toggleLang}>toggle</button>
    </div>
  )
}

test('defaults to "de"', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  expect(screen.getByTestId('lang')).toHaveTextContent('de')
})

test('toggles to "en" when clicked', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  fireEvent.click(screen.getByText('toggle'))
  expect(screen.getByTestId('lang')).toHaveTextContent('en')
})

test('toggles back to "de" on second click', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  fireEvent.click(screen.getByText('toggle'))
  fireEvent.click(screen.getByText('toggle'))
  expect(screen.getByTestId('lang')).toHaveTextContent('de')
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run -- src/test/LanguageContext.test.jsx
```

Expected: FAIL — `Cannot find module '../context/LanguageContext'`

- [ ] **Step 3: Implement LanguageContext**

```bash
mkdir -p src/context
```

Create `src/context/LanguageContext.jsx`:
```jsx
import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('de')
  const toggleLang = () => setLang((l) => (l === 'de' ? 'en' : 'de'))

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test:run -- src/test/LanguageContext.test.jsx
```

Expected: `✓ src/test/LanguageContext.test.jsx (3 tests) — PASS`

- [ ] **Step 5: Commit**

```bash
git add src/context/LanguageContext.jsx src/test/LanguageContext.test.jsx
git commit -m "feat: LanguageContext with DE/EN toggle (TDD)"
```

---

## Task 7: LanguageToggle component

**Files:**
- Create: `src/components/LanguageToggle.jsx`
- Create: `src/test/LanguageToggle.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/LanguageToggle.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageToggle from '../components/LanguageToggle'
import { LanguageProvider } from '../context/LanguageContext'

function Wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

test('shows DE by default', () => {
  render(<Wrapper><LanguageToggle /></Wrapper>)
  expect(screen.getByText('DE')).toBeInTheDocument()
})

test('shows EN after clicking', () => {
  render(<Wrapper><LanguageToggle /></Wrapper>)
  fireEvent.click(screen.getByText('DE'))
  expect(screen.getByText('EN')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test:run -- src/test/LanguageToggle.test.jsx
```

Expected: FAIL — `Cannot find module '../components/LanguageToggle'`

- [ ] **Step 3: Implement LanguageToggle**

```bash
mkdir -p src/components
```

Create `src/components/LanguageToggle.jsx`:
```jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage()

  return (
    <button
      onClick={toggleLang}
      style={{
        position: 'fixed',
        top: 14,
        right: 14,
        zIndex: 30,
        background: 'rgba(244,162,97,0.15)',
        border: '1px solid rgba(244,162,97,0.35)',
        borderRadius: 20,
        padding: '5px 14px',
        color: '#f4a261',
        fontWeight: 'bold',
        fontSize: 11,
        letterSpacing: 1,
        cursor: 'pointer',
        minWidth: 44,
        textAlign: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {lang.toUpperCase()}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test:run -- src/test/LanguageToggle.test.jsx
```

Expected: `✓ src/test/LanguageToggle.test.jsx (2 tests) — PASS`

- [ ] **Step 5: Commit**

```bash
git add src/components/LanguageToggle.jsx src/test/LanguageToggle.test.jsx
git commit -m "feat: LanguageToggle component with crossfade animation"
```

---

## Task 8: VenueCard component

**Files:**
- Create: `src/components/VenueCard.jsx`
- Create: `src/test/VenueCard.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/test/VenueCard.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import VenueCard from '../components/VenueCard'

const venue = {
  id: 'test-bar',
  name: 'Test Bar',
  type: 'bar',
  screens: 3,
  indoor: true,
  hours: '17:00 – 24:00',
  coordinates: [13.74, 51.05],
  address: 'Teststr. 1',
  photo: null,
  website: null,
  description: { de: 'Test', en: 'Test' },
}

test('renders venue name', () => {
  render(<VenueCard venue={venue} isSelected={false} onSelect={() => {}} lang="de" />)
  expect(screen.getByText('Test Bar')).toBeInTheDocument()
})

test('renders bar emoji for type bar', () => {
  render(<VenueCard venue={venue} isSelected={false} onSelect={() => {}} lang="de" />)
  expect(screen.getByText('🍺')).toBeInTheDocument()
})

test('calls onSelect when clicked', () => {
  const onSelect = vi.fn()
  render(<VenueCard venue={venue} isSelected={false} onSelect={onSelect} lang="de" />)
  fireEvent.click(screen.getByText('Test Bar'))
  expect(onSelect).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test:run -- src/test/VenueCard.test.jsx
```

Expected: FAIL — `Cannot find module '../components/VenueCard'`

- [ ] **Step 3: Implement VenueCard**

Create `src/components/VenueCard.jsx`:
```jsx
import { t } from '../i18n'

const TYPE_EMOJI = {
  bar: '🍺',
  restaurant: '🍔',
  outdoor: '🌤️',
  other: '⚽',
}

export default function VenueCard({ venue, isSelected, onSelect, lang }) {
  const tr = t[lang]

  return (
    <div
      onClick={onSelect}
      style={{
        width: 140,
        background: '#141f35',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: `1.5px solid ${isSelected ? '#f4a261' : 'transparent'}`,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Icon / photo area */}
      <div
        style={{
          height: 64,
          background: 'linear-gradient(135deg, #1e3a5f, #0f2040)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
      >
        {venue.photo
          ? <img src={venue.photo} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : TYPE_EMOJI[venue.type] ?? '⚽'
        }
      </div>

      {/* Info */}
      <div style={{ padding: '8px 9px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>
          {venue.name}
        </div>
        <div style={{ fontSize: 9, color: '#f4a261' }}>
          {tr.types[venue.type] ?? venue.type} · {tr.screens(venue.screens)}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>
          {venue.indoor ? `🏠 ${tr.indoor}` : `🌿 ${tr.outdoor}`}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
          ⏰ {venue.hours}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test:run -- src/test/VenueCard.test.jsx
```

Expected: `✓ src/test/VenueCard.test.jsx (3 tests) — PASS`

- [ ] **Step 5: Run all tests to confirm nothing broke**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/VenueCard.jsx src/test/VenueCard.test.jsx
git commit -m "feat: VenueCard component with emoji, tags, selection highlight"
```

---

## Task 9: Map component (Mapbox GL JS)

**Files:**
- Create: `src/components/Map.jsx`

Note: Mapbox GL JS requires a real browser canvas — unit tests are skipped for this component. Test manually in the browser.

- [ ] **Step 1: Create `src/components/Map.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const DRESDEN_CENTER = [13.7372, 51.0504]

export default function Map({ venues, selectedId, onVenueSelect }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DRESDEN_CENTER,
      zoom: 13,
    })
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Re-render markers when venues or selection changes
  useEffect(() => {
    if (!mapRef.current) return

    const addMarkers = () => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      venues.forEach((venue) => {
        const el = document.createElement('div')
        el.className = 'map-pin'
        if (venue.id === selectedId) el.classList.add('map-pin--active')
        el.addEventListener('click', () => onVenueSelect(venue))

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(venue.coordinates)
          .addTo(mapRef.current)

        markersRef.current.push(marker)
      })
    }

    if (mapRef.current.loaded()) {
      addMarkers()
    } else {
      mapRef.current.once('load', addMarkers)
    }
  }, [venues, selectedId, onVenueSelect])

  // Fly to selected venue
  useEffect(() => {
    if (!mapRef.current || !selectedId) return
    const venue = venues.find((v) => v.id === selectedId)
    if (!venue) return

    const fly = () => {
      mapRef.current.flyTo({
        center: venue.coordinates,
        zoom: 15,
        duration: 800,
        curve: 1.5,
      })
    }

    if (mapRef.current.loaded()) {
      fly()
    } else {
      mapRef.current.once('load', fly)
    }
  }, [selectedId, venues])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  )
}
```

- [ ] **Step 2: Verify manually in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. You should see a full-screen dark Mapbox map centered on Dresden. (App.jsx still has boilerplate — the map won't render yet. That's wired up in Task 11.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Map.jsx
git commit -m "feat: Map component with Mapbox GL JS, gold pins, flyTo"
```

---

## Task 10: BottomSheet component

**Files:**
- Create: `src/components/BottomSheet.jsx`

- [ ] **Step 1: Create `src/components/BottomSheet.jsx`**

```jsx
import { motion } from 'framer-motion'
import VenueCard from './VenueCard'
import { t } from '../i18n'

const COLLAPSED_OFFSET = 160
const FULL_HEIGHT = 340

export default function BottomSheet({ venues, selectedId, onVenueSelect, lang }) {
  const tr = t[lang]

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: FULL_HEIGHT - COLLAPSED_OFFSET }}
      dragElastic={0.05}
      initial={{ y: FULL_HEIGHT - COLLAPSED_OFFSET }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: FULL_HEIGHT,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sheet) var(--radius-sheet) 0 0',
        padding: '10px 16px 16px',
        zIndex: 10,
        boxShadow: 'var(--shadow-sheet)',
        touchAction: 'none',
      }}
    >
      {/* Drag handle */}
      <div
        style={{
          width: 32,
          height: 3,
          background: 'var(--border-muted)',
          borderRadius: 2,
          margin: '0 auto 14px',
        }}
      />

      {/* Venue count label */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--accent)',
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        {tr.venueCount(venues.length)}
      </div>

      {/* Horizontally scrollable card row */}
      <div className="cards-row">
        {venues.map((venue, i) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            style={{ flexShrink: 0 }}
          >
            <VenueCard
              venue={venue}
              isSelected={venue.id === selectedId}
              onSelect={() => onVenueSelect(venue)}
              lang={lang}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BottomSheet.jsx
git commit -m "feat: BottomSheet with drag gesture and staggered card entrance"
```

---

## Task 11: VenueDetail component

**Files:**
- Create: `src/components/VenueDetail.jsx`

- [ ] **Step 1: Create `src/components/VenueDetail.jsx`**

```jsx
import { motion } from 'framer-motion'
import { t } from '../i18n'

const TYPE_EMOJI = {
  bar: '🍺',
  restaurant: '🍔',
  outdoor: '🌤️',
  other: '⚽',
}

function Tag({ children, muted }) {
  return (
    <span
      style={{
        background: '#141f35',
        border: `1px solid ${muted ? 'transparent' : 'rgba(244,162,97,0.3)'}`,
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 12,
        color: muted ? 'var(--text-secondary)' : 'var(--accent)',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}

export default function VenueDetail({ venue, lang, onClose }) {
  const tr = t[lang]

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80) onClose()
      }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: 'var(--bg-card)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '88vh',
        overflowY: 'auto',
        touchAction: 'none',
        // Desktop: right panel overlay
        ...(window.innerWidth >= 768
          ? { left: 'auto', right: 0, width: 400, top: 0, bottom: 0, borderRadius: 0, maxHeight: '100vh' }
          : {}),
      }}
    >
      {/* Photo / icon area */}
      <div
        style={{
          height: 200,
          background: 'linear-gradient(135deg, #1e3a5f, #0f2040)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 72,
          position: 'relative',
          borderRadius: window.innerWidth >= 768 ? 0 : '20px 20px 0 0',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {venue.photo ? (
          <img
            src={venue.photo}
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          TYPE_EMOJI[venue.type] ?? '⚽'
        )}

        {/* Type badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(244,162,97,0.2)',
            border: '1px solid rgba(244,162,97,0.4)',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 10,
            color: 'var(--accent)',
            fontWeight: 700,
          }}
        >
          {tr.types[venue.type] ?? venue.type}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(10,10,20,0.75)',
            border: 'none',
            color: 'white',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px 40px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
          {venue.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          📍 {venue.address}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <Tag>{venue.indoor ? `🏠 ${tr.indoor}` : `🌿 ${tr.outdoor}`}</Tag>
          <Tag>{`📺 ${tr.screens(venue.screens)}`}</Tag>
          <Tag muted>{`⏰ ${venue.hours}`}</Tag>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, marginBottom: 22 }}>
          {venue.description[lang]}
        </p>

        {/* Website CTA */}
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              background: 'var(--accent)',
              color: '#0a0a14',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            {tr.visitWebsite}
          </a>
        )}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/VenueDetail.jsx
git commit -m "feat: VenueDetail slide-up panel with spring animation and swipe-to-close"
```

---

## Task 12: App.jsx — wire everything together

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace `src/App.jsx` entirely**

```jsx
import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Map from './components/Map'
import BottomSheet from './components/BottomSheet'
import VenueDetail from './components/VenueDetail'
import LanguageToggle from './components/LanguageToggle'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import venues from './data/venues.json'

function AppContent() {
  const [selectedVenue, setSelectedVenue] = useState(null)
  const { lang } = useLanguage()

  const handleVenueSelect = useCallback((venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue))
  }, [])

  const handleClose = useCallback(() => setSelectedVenue(null), [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Map
        venues={venues}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={handleVenueSelect}
      />

      <LanguageToggle />

      <BottomSheet
        venues={venues}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={handleVenueSelect}
        lang={lang}
      />

      <AnimatePresence>
        {selectedVenue && (
          <VenueDetail
            key={selectedVenue.id}
            venue={selectedVenue}
            lang={lang}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
```

- [ ] **Step 2: Run dev server and verify the full app**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Full-screen dark Mapbox map of Dresden is visible
- Bottom sheet is visible at the bottom with 3 venue cards
- Cards show emoji, name, screens, indoor/outdoor
- Clicking a card: map flies to the venue, card gets gold border, VenueDetail slides up from bottom
- VenueDetail shows: emoji, name, address, tags, description, website button (only for Watzke)
- Swiping VenueDetail down (or clicking ✕) closes it
- Language toggle in top-right: clicking switches DE ↔ EN, venue descriptions and labels change
- Dragging the bottom sheet handle up expands it

- [ ] **Step 3: Run all tests one final time**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire all components in App, app is fully functional"
```

---

## Task 13: Deploy to Vercel

**Files:** none (deployment config only)

- [ ] **Step 1: Push to GitHub**

Go to https://github.com/new → create a new repository named `wm-public-viewing` (public or private, your choice). Then:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/wm-public-viewing.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

1. Go to https://vercel.com → Log in with GitHub
2. Click **Add New → Project**
3. Import `wm-public-viewing` from your GitHub repos
4. Vercel auto-detects Vite — no build config needed
5. Before clicking Deploy: go to **Environment Variables** and add:
   - Name: `VITE_MAPBOX_TOKEN`
   - Value: your Mapbox token (same as in your local `.env`)
6. Click **Deploy**

- [ ] **Step 3: Verify deployment**

After ~30 seconds, Vercel shows a URL like `https://wm-public-viewing.vercel.app`. Open it — the app should work identically to your local version.

- [ ] **Step 4: Verify auto-deploy works**

Make a trivial change (e.g. update a venue description in `venues.json`), commit and push:

```bash
git add src/data/venues.json
git commit -m "test: verify auto-deploy"
git push
```

Go to your Vercel dashboard — a new deployment should start automatically and finish in ~30 seconds.

---

## Final checklist

- [ ] All 8 tests pass (`npm run test:run`)
- [ ] Map renders on Dresden with gold pulsing pins
- [ ] Clicking a pin / card: map flies to venue, VenueDetail slides up
- [ ] Bottom sheet is draggable up/down
- [ ] DE/EN toggle switches all text including venue descriptions
- [ ] VenueDetail closes on swipe-down or ✕
- [ ] Site deployed and live on Vercel
- [ ] `VITE_MAPBOX_TOKEN` not committed to git (check `git log -- .env` shows nothing)
