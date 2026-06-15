# WM Dresden 2026 — Public Viewing Map

**Date:** 2026-06-13  
**Status:** Approved

## Overview

Interactive map for Dresden showing World Cup 2026 public viewing locations — bars, restaurants, outdoor areas and other venues showing football. Target audience: locals and tourists in Dresden. Primary use case: finding a spot to watch a match.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React + Vite |
| Map | Mapbox GL JS |
| Animations | Framer Motion |
| Data | `src/data/venues.json` (edited manually) |
| Hosting | Vercel (auto-deploy from GitHub, zero config for Vite) |
| Language | JavaScript (plain JS, no TypeScript) |

## Design Decisions

### Layout
Full-screen map with a bottom sheet. The map takes the entire viewport. A bottom sheet slides up from the bottom and contains a horizontally scrollable row of venue cards. On desktop, the bottom sheet is taller and shows more content.

### Theme
- Background: `#0a0a14` / `#0d1526` / `#141f35`
- Accent: `#f4a261` (gold)
- Text primary: `#ffffff`
- Text secondary: `#8899bb`
- Card border active: `#f4a261`

### Languages
DE/EN toggle in the top-right corner. All UI text and venue descriptions support both languages. The toggle switches instantly with a crossfade animation.

## Components

### `App.jsx`
Root component. Holds selected venue state. Renders Map + BottomSheet + LanguageToggle + VenueDetail.

### `Map.jsx`
Mapbox GL JS map centered on Dresden (`[13.7372, 51.0504]`, zoom 13). Dark custom style. Renders a gold pin for each venue. On pin click: map flies smoothly to the venue (flyTo with duration 800ms), sets it as selected. Pins pulse with a CSS keyframe animation.

### `BottomSheet.jsx`
Fixed to bottom of screen. Default state: handle + single row of venue cards visible (~160px). On drag up: expands to show cards fully. Uses Framer Motion `useMotionValue` + `drag` for swipe gesture. Cards appear with staggered `fadeInUp` on mount.

### `VenueCard.jsx`
Compact card shown in bottom sheet row. Shows: emoji icon (by type), name, type + screens count, indoor/outdoor badge. Highlighted with gold border when selected. On click: triggers map flyTo + opens VenueDetail.

### `VenueDetail.jsx`
Slides up from bottom with Framer Motion spring animation when a venue is selected. Full-screen on mobile, right panel on desktop. Shows: photo/icon, name, address, tags (indoor/outdoor, screens, hours), description (DE or EN based on toggle), website button. Closes on swipe down or X button.

### `LanguageToggle.jsx`
Top-right corner pill button showing "DE" or "EN". On click: toggles language context. Text transitions with Framer Motion layout animation (crossfade).

## Animation Spec

| Element | Animation |
|---|---|
| Map pins | CSS pulse glow ring, infinite |
| Selected pin | Scale up 1.3×, gold glow shadow |
| Bottom sheet open | Spring: stiffness 300, damping 30 |
| Venue cards | Stagger 0.05s, fadeInUp (y: 20→0, opacity 0→1) |
| VenueDetail open | Slide up from y: 100%, spring physics |
| VenueDetail close | Slide down to y: 100% |
| Language toggle | Text opacity crossfade 150ms |
| Map flyTo | Mapbox native, duration 800ms, curve 1.5 |

## Data Model

```json
{
  "id": "watzke",
  "name": "Brauhaus Watzke",
  "type": "bar",
  "coordinates": [13.6800, 51.0650],
  "address": "Kötzschenbroder Str. 1, Dresden",
  "photo": null,
  "screens": 3,
  "indoor": true,
  "hours": "17:00 – 24:00",
  "website": "https://watzke.de",
  "description": {
    "de": "Klassische Brauerei direkt an der Elbe mit großem Biergarten.",
    "en": "Classic brewery on the Elbe river with a large beer garden."
  }
}
```

Venue types: `bar` | `restaurant` | `outdoor` | `other`  
Photo field: URL string or `null` (shows emoji fallback based on type).

## File Structure

```
wm-public-viewing/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Map.jsx
│   │   ├── BottomSheet.jsx
│   │   ├── VenueCard.jsx
│   │   ├── VenueDetail.jsx
│   │   └── LanguageToggle.jsx
│   ├── data/
│   │   └── venues.json
│   ├── context/
│   │   └── LanguageContext.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Responsive Behavior

- **Mobile (<768px):** Map fullscreen, bottom sheet with horizontal card scroll, VenueDetail fullscreen slide-up
- **Desktop (≥768px):** Map fullscreen, bottom sheet taller (shows 2 card rows), VenueDetail as right-side panel (400px wide) overlaid on top of the map — map stays fullscreen, panel does not push or shrink it

## Out of Scope (v1)

- Filtering / search
- Admin panel for adding venues
- User location / "near me"
- Match schedule
- User ratings or comments
