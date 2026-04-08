# 🌿 GreenPulse — AI-Powered Micro-Climate & Commute Optimizer

> **Presidency College Hackathon MVP** — BuildWithAI Track

GreenPulse analyzes real-time environmental data and uses **Google Gemini AI** to suggest the "Healthiest Route," not just the fastest one. It tells commuters *which path* and *when to leave* to avoid heat islands and pollution pockets.

---

## 🏗 Architecture

```
greenpulse/
├── backend/
│   ├── main.py              # FastAPI server — all API endpoints
│   ├── requirements.txt
│   └── .env.example         # API key template
├── frontend/
│   ├── dashboard.html       # Lungs Score + live AQI dashboard
│   ├── route-planner.html   # Gemini MCDM route analysis
│   ├── journey.html         # Per-route milestone breakdown
│   ├── heatmap.html         # Canvas-based city pollution map
│   └── assets/
│       ├── app.js           # Shared API client + UI helpers
│       └── styles.css       # Liquid Glass design system
├── start.sh                 # One-command launcher
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- A modern web browser

### 1. Clone & configure
```bash
cd greenpulse
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys (see below)
```

### 2. Run everything
```bash
chmod +x start.sh
./start.sh
```

Open **http://localhost:3000** in your browser.

---

## 🔑 API Keys

| Key | Where to get | Required? |
|-----|-------------|-----------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) | Recommended (free) |
| `OPENWEATHERMAP_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) | Optional (free tier) |

> **Demo mode**: Both keys are optional. Without them, GreenPulse uses realistic simulated data with a local AI fallback — perfect for the hackathon demo.

---

## 🤖 AI Integration (The "Brain")

### Gemini MCDM Engine (`POST /api/routes`)
The core AI flow:
1. Real-time AQI + weather data fetched from OpenWeatherMap
2. 3 route options generated with simulated environmental segments
3. A structured prompt is sent to **Gemini 1.5 Flash** requesting Multi-Criteria Decision Making:
   - Air Quality Index: **40% weight**
   - Temperature / Heat Index: **25% weight**
   - CO₂ Exposure: **20% weight**
   - Travel Time: **15% weight**
4. Gemini returns a ranked JSON of routes with Lungs Scores, health benefits, and departure windows
5. Results rendered as interactive route cards

### Predictive Departure Window
Gemini also calculates the optimal 15-minute departure window based on predicted smog/heat cycles — the "leave in X minutes" recommendation.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/dashboard` | Live AQI, Lungs Score, weather stats |
| `POST` | `/api/routes` | **AI route analysis** (Gemini MCDM) |
| `GET`  | `/api/journey/{rank}` | Per-route milestone breakdown |
| `GET`  | `/api/heatmap` | City pollution zone data |
| `GET`  | `/api/health` | Service health + API key status |
| `GET`  | `/docs` | Interactive Swagger UI |

### Example: Plan Routes
```bash
curl -X POST http://localhost:8000/api/routes \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "MG Road",
    "destination": "Koramangala",
    "city": "Bengaluru",
    "lat": 12.9716,
    "lon": 77.5946
  }'
```

---

## 🎨 Design System: Liquid Glass

Built on the **Bioluminescent Sanctuary** design philosophy:
- Deep translucent surfaces with `backdrop-filter: blur()`
- Emerald primary (#3fff8b) / Amber secondary (#ffbd5c) / Coral accent (#ff7350)
- Zero hard borders — depth through tonal layers
- Ambient glow effects for status indication (healthy = green pulse, polluted = amber/red)

---

## 📱 Screens

| Screen | File | Features |
|--------|------|---------|
| **Dashboard** | `dashboard.html` | Lungs Score ring, live AQI stats, departure window |
| **Route Planner** | `route-planner.html` | AI-powered 3-route comparison, MCDM ranking |
| **Journey Details** | `journey.html` | Milestone map, CO₂ saved, health tips |
| **City Heatmap** | `heatmap.html` | Canvas pollution visualization, clean corridors |

---

## 🔮 Scalability Roadmap

1. **Wearable Integration** — Apple Watch/Fitbit API for personal exposure tracking
2. **Historical Analysis** — "You saved 2.3g of PM2.5 this week" personal reports
3. **Community Crowdsourcing** — Real-time reports from commuters on road conditions
4. **Predictive Smog Modeling** — Time-series ML on AQI + traffic patterns
5. **Multi-City Support** — Delhi, Mumbai, Chennai presets

---

## 🏆 Hackathon Scoring Map

| Criterion | Implementation |
|-----------|---------------|
| **AI Integration (25%)** | Gemini MCDM prompt, structured JSON output, fallback logic |
| **Innovation (25%)** | Spatial AI, health-first routing, departure window prediction |
| **Real-World Usability (20%)** | Bengaluru-specific AQI data, actionable commute advice |
| **Scalability (20%)** | Clean API design, modular frontend, documented extension points |
| **Presentation (10%)** | Liquid Glass UI, 4-screen flow, live demo ready |

---

## 👩‍💻 Tech Stack

**Backend**: Python · FastAPI · Google Generative AI (Gemini 1.5 Flash) · OpenWeatherMap API · Uvicorn

**Frontend**: Vanilla JS · Tailwind CSS CDN · Material Symbols · HTML5 Canvas

**AI**: Gemini 1.5 Flash with structured JSON prompting for Multi-Criteria Decision Making
