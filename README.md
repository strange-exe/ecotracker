# 🌿 EcoTrack — Personal Carbon Footprint Tracker

> **Track your daily carbon footprint, build eco-habits, and compete with peers — all while keeping your data 100% private on your own device.**

---

## Problem Statement Alignment

EcoTrack addresses the growing need for individuals to understand and reduce their personal carbon emissions. It provides:

- **Personalized Baseline**: A multi-step onboarding questionnaire calculates your unique daily kg CO₂e baseline using EPA/IPCC emission factors.
- **Daily Logging**: Log transport, diet, and energy activities to track real-time footprint changes.
- **Actionable Recommendations**: Curated eco-actions with difficulty levels, CO₂ savings, and health co-benefits.
- **Gamification**: Points, streaks, levels, and achievement badges motivate consistent sustainable behaviour.
- **Peer Comparison**: Anonymous leaderboard lets users benchmark against regional and peer averages.
- **Analytics**: Historical trend charts visualise progress over 4+ weeks of data.
- **Data Privacy**: All data is stored client-side (`localStorage`). Nothing is ever sent to any server.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Icons | Lucide React (no emoji) |
| Charts | Recharts |
| Fonts | Google Fonts: Outfit + Plus Jakarta Sans |
| Styling | Vanilla CSS with CSS Variables (glassmorphism, 3D parallax) |
| Testing | Vitest + @testing-library/react |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Watch mode (TDD)
npm run test:watch

# Production build
npm run build

# Lint
npm run lint
```

---

## Architecture

```
src/
├── __tests__/                 # Vitest test suite
│   ├── carbonCalculator.test.js  # 23 unit tests for emission calculations
│   ├── tiltHandlers.test.js      # 3 unit tests for 3D interaction utilities
│   └── setup.js                  # jest-dom matchers setup
├── components/
│   ├── Dashboard.jsx          # Daily log, quick-wins, stat cards
│   ├── Onboarding.jsx         # Multi-step footprint baseline wizard
│   ├── ActionsFeed.jsx        # All eco-action cards
│   ├── Analytics.jsx          # Recharts trend visualisation
│   ├── Leaderboard.jsx        # Peer comparison with podium UI
│   └── Integrations.jsx       # CSV import / data sync
├── utils/
│   ├── carbonCalculator.js    # EPA/IPCC-based emission factor maths
│   ├── mockData.js            # Seed data for actions & leaderboard peers
│   └── tiltHandlers.js        # Shared 3D tilt mouse event handlers
├── App.jsx                    # Root: routing, state, toast, CSP
├── index.css                  # Design system: tokens, animations, a11y
└── main.jsx                   # React DOM entry point
```

---

## Security Features

- **Content Security Policy**: Strict CSP meta tag in `index.html` (no external scripts).
- **Cryptographic IDs**: `window.crypto.getRandomValues()` generates all log entry IDs — no `Math.random()`.
- **Safe Storage Parsing**: `safeReadStorage()` wraps all `localStorage.getItem()` calls to prevent JSON parse exceptions from tampered/corrupt data.
- **No `dangerouslySetInnerHTML`**: All user inputs are rendered as text content.
- **CSV Validation**: Imported CSV rows are validated and IDs are cryptographically re-generated.

---

## Accessibility Features (WCAG 2.1 AA)

- **Skip Navigation**: `<a class="skip-nav">` allows keyboard users to bypass the header (WCAG 2.4.1).
- **Focus Indicators**: All interactive elements have a 2px `outline: var(--accent-leaf)` on `:focus-visible`.
- **ARIA Live Regions**: Toast notifications use `role="alert" aria-live="assertive"`.
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` disables all animations for users with vestibular disorders.
- **Keyboard Accessible Toggle**: The green energy toggle switch supports `Space` and `Enter` keys.
- **Semantic Landmarks**: `<header>`, `<main id="main-content">`, `<footer>`, `<nav aria-label>`.

---

## Testing

**26 tests across 2 test files:**

| File | Tests |
|------|-------|
| `carbonCalculator.test.js` | 23 tests covering emission calculations, edge cases, and domain invariants |
| `tiltHandlers.test.js` | 3 tests for 3D interaction with `prefers-reduced-motion` compliance |

Run with:
```bash
npm test
```

---

## Data Privacy

All user data is stored exclusively in `localStorage` under keys prefixed `ecotrack_*`. No analytics, telemetry, or third-party services are used. The **Reset** button completely wipes all data.

---

*Built with nature-conscious purpose. All emission factors are sourced from the US EPA and IPCC AR6 guidelines.*
