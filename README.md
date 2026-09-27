<div align="center">

# 🌱 MahaFarm

### An AI-empowered automated farm management platform

Turn soil, water, and weather into decisions — automatically.
Built for the way Maharashtra farms.

`React` · `Vite` · `React Router` · `Recharts` · `MERN-ready`

</div>

---

## Overview

**MahaFarm** is a full-stack precision-agriculture platform that helps farmers monitor
their fields, automate irrigation, detect crop disease with computer vision, sell produce
directly to buyers, and ask an AI assistant for guidance — all from one dashboard.

This repository is built as a **portfolio project in three phases**. You are currently
looking at the **complete** codebase: Phase 1 (Frontend), Phase 2 (Backend), and Phase 3 (Deployment).

| Phase | Scope | Status |
|------:|-------|:------:|
| **Phase 1** | **Frontend** — React UI components, navigation, interaction, design system | ✅ **Done** |
| **Phase 2** | **Backend** — Express routes, controllers, Mongo models, CRUD, auth & sessions | ✅ **Done** |
| **Phase 3** | **Deployment** — Docker, env config, CI, and cloud hosting | ✅ **Done** |

> **Backend (Phase 2)** lives in [`server/`](./server) with its own README and full API
> docs. **Deployment (Phase 3)** is covered in [`DEPLOYMENT.md`](./DEPLOYMENT.md) — run the
> whole stack with `docker compose up --build`, or host the frontend and API separately.
> The frontend talks to the API when `VITE_ENABLE_MOCK_DATA=false`, and falls back to
> built-in mock data otherwise, so it always runs standalone too.

---

## ✨ Phase 1 — what's included

A complete, responsive, multi-page React front end with a custom design system.

### Marketing site
- **Landing page** with an animated "living dashboard" hero, feature grid, how-it-works
  loop, impact figures, pricing tiers, and a call-to-action band.

### The app (dashboard shell)
- **Overview** — KPI cards, 24-hour soil-moisture area chart, water-savings bar chart,
  live sensor tiles, alerts feed, automation schedule, and fields needing attention.
- **Crop monitoring** — filterable/searchable field cards with health rings, growth-stage
  and moisture progress, and per-field recommended actions.
- **Disease scan** — drag-and-drop leaf upload with a simulated vision-AI flow that returns
  a diagnosis, confidence, severity, and treatment plan.
- **Weather** — current conditions, a 7-day forecast, and crop-tuned advisories.
- **Marketplace** — produce listings with category filters, live price trends, and an
  in-memory cart.
- **Assistant** — a chat interface with suggestion chips and contextual sample replies.

### Auth & system
- **Login** and **Register** screens with a branded split layout.
- A custom **404** page.

### Design system
- Token-driven CSS (color, type, spacing, radius, shadow) in `src/index.css`.
- Reusable components: stat cards, sensor cards, progress rings/bars, badges, buttons.
- **Signature element:** an animated chartreuse **PulseLine** — the farm's "vital sign."
- Fully responsive, keyboard-focus styles, and `prefers-reduced-motion` support.

---

## 🎨 Design language

| Token | Value | Role |
|-------|-------|------|
| Soil greens | `#0A1610` → `#244B34` | App surfaces & ink |
| Leaf greens | `#1B5E3F` → `#4DAE7C` | Brand |
| Sprout (signature) | `#C8F24B` | "Live data" / AI accent |
| Harvest amber | `#ECA72C` | Warnings, sun, highlights |
| Paper | `#F6F3EA` | Marketing surfaces |

**Type:** Sora (display) · Inter (body) · JetBrains Mono (data).

---

## 🧱 Tech stack

- **React 18** with hooks
- **Vite** for fast dev/build
- **React Router 6** for navigation
- **Recharts** for data visualization
- **lucide-react** for icons
- **Plain CSS** with custom properties (no UI framework — every pixel is intentional)

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

> Requires Node.js 18+.

---

## 📁 Project structure

```
mahafarm/
├── index.html               # Vite entry + font loading
├── package.json
├── vite.config.js
├── .env.example             # Forward-looking config for Phase 2/3
├── public/
│   └── leaf.svg             # Favicon
└── src/
    ├── main.jsx             # App bootstrap + Router
    ├── App.jsx              # Route map
    ├── index.css            # Design tokens + global styles
    ├── data/
    │   └── mockData.js      # All mock data (shaped to match the future API)
    ├── components/
    │   ├── icons.jsx        # Central icon map
    │   ├── PulseLine.jsx    # Signature animated component
    │   ├── ui.jsx           # Logo, StatCard, SensorCard, rings, bars
    │   ├── Navbar.jsx       # Marketing nav
    │   ├── Footer.jsx       # Marketing footer
    │   ├── Sidebar.jsx      # Dashboard sidebar
    │   ├── DashboardLayout.jsx  # App shell (sidebar + topbar + outlet)
    │   └── ScrollToTop.jsx
    └── pages/
        ├── Landing.jsx
        ├── Dashboard.jsx
        ├── CropMonitoring.jsx
        ├── DiseaseDetection.jsx
        ├── Marketplace.jsx
        ├── Assistant.jsx
        ├── Weather.jsx
        ├── Login.jsx
        ├── Register.jsx
        └── NotFound.jsx
```

---

## 🔭 The three phases

### Phase 1 — Frontend ✅
- React UI, navigation, and an opinionated design system; all screens runnable on mock data.

### Phase 2 — Backend ✅ ([`server/`](./server))
- Express REST API for fields, sensors, alerts, products, tasks, and scans
- Mongoose models mirroring the shapes in `src/data/mockData.js`
- JWT authentication with httpOnly-cookie sessions; aggregate dashboard endpoint
- A seeder that loads the demo farm

### Phase 3 — Deployment ✅ ([`DEPLOYMENT.md`](./DEPLOYMENT.md))
- Frontend wired to the API: `src/lib/api.js`, an auth context with real sessions, a
  `useResource` data hook, and a protected dashboard route — with a mock fallback so the
  UI still runs with no backend
- Full-stack **Docker Compose** (MongoDB + API + nginx-served frontend, one command)
- Cloud configs: `render.yaml`, `vercel.json`, `netlify.toml`, and a GitHub Actions CI workflow

---

## 🌦️ Foresight — AI advisory, no sensors required ([FORESIGHT.md](./FORESIGHT.md))

Built for the GOMYCODE × NVIDIA *Come Build with AI* hackathon. A farmer names a location
and a crop; Foresight pulls free weather and evapotranspiration data, runs an FAO-56 water
balance, scores seven days of disease-infection risk, and an LLM writes the plan in English
or Hausa.

- **Removes the hardware barrier** — no probes to buy, install or maintain
- **Measurable impact** — litres saved vs a fixed schedule, and the ₦ value, on every run
- **Maths and language kept separate** — the model explains the figures, it never calculates
- **Degrades honestly** — climatology and rules-engine fallbacks, both labelled in the UI

`POST /api/foresight` · public by design · screen at `/app/foresight`

---

## 🔌 Hardware / IoT (optional) — [`hardware/`](./hardware)

MahaFarm can read from real sensors and drive real actuators via an Arduino.
Using the **USB serial bridge** (no WiFi needed), an Arduino streams readings that
update the live dashboard tiles, and the app can switch the irrigation relay.

- [`hardware/HARDWARE.md`](./hardware/HARDWARE.md) — full guide: component map, wiring, setup
- [`hardware/arduino/`](./hardware/arduino) — Arduino sketches (field node + RFID)
- [`hardware/bridge/`](./hardware/bridge) — Node USB→API bridge

New API endpoints support this: `POST /api/device/ingest` and `GET /api/device/commands`
(device-key auth), `POST /api/commands` (queue a hardware action), and
`GET /api/export/:resource` (download any collection as CSV).

---

## 📝 Notes

- Mock data is intentionally shaped like the API payload, so flipping
  `VITE_ENABLE_MOCK_DATA` to `false` switches every screen to live calls with no code change.
- App/cart/chat state is kept **in-memory** (React state) — no browser storage — so the
  client runs anywhere.
- The disease scan and assistant are simulated on the backend in Phase 2; the contracts are
  ready to swap in a real vision model and language model later.

---

<div align="center">

**MahaFarm** — Cultivated in Maharashtra. 🌾

</div>
