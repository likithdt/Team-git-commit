/**
 * GreenPulse Frontend — Shared API Client & Utilities
 * Connects to the FastAPI backend at localhost:8000
 */

const API_BASE = "http://localhost:8000";

// ── State ────────────────────────────────────────────────────────────────────
const State = {
  city: "Bengaluru",
  lat: 12.9716,
  lon: 77.5946,
  lastRoutes: null,
  selectedRank: 1,
};

// ── API Client ───────────────────────────────────────────────────────────────
const API = {
  async dashboard() {
    const r = await fetch(
      `${API_BASE}/api/dashboard?lat=${State.lat}&lon=${State.lon}&city=${encodeURIComponent(State.city)}`
    );
    if (!r.ok) throw new Error("Dashboard fetch failed");
    return r.json();
  },

  async routes(origin, destination) {
    const r = await fetch(`${API_BASE}/api/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        city: State.city,
        lat: State.lat,
        lon: State.lon,
      }),
    });
    if (!r.ok) throw new Error("Route planning failed");
    return r.json();
  },

  async journey(rank, origin, destination) {
    const r = await fetch(
      `${API_BASE}/api/journey/${rank}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&lat=${State.lat}&lon=${State.lon}`
    );
    if (!r.ok) throw new Error("Journey fetch failed");
    return r.json();
  },

  async heatmap() {
    const r = await fetch(
      `${API_BASE}/api/heatmap?lat=${State.lat}&lon=${State.lon}&city=${encodeURIComponent(State.city)}`
    );
    if (!r.ok) throw new Error("Heatmap fetch failed");
    return r.json();
  },
};

// ── Utility helpers ──────────────────────────────────────────────────────────
function aqiColor(aqi) {
  if (aqi <= 50)  return "#3fff8b";
  if (aqi <= 100) return "#ffbd5c";
  if (aqi <= 150) return "#ff7350";
  if (aqi <= 200) return "#ff716c";
  return "#9f0519";
}

function aqiLabel(aqi) {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
}

function scoreRingOffset(score, r = 88) {
  const circumference = 2 * Math.PI * r;
  return circumference - (score / 100) * circumference;
}

function showLoading(el, msg = "Fetching live data…") {
  if (!el) return;
  el.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 gap-4 text-on-surface-variant">
      <div class="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      <span class="text-sm">${msg}</span>
    </div>`;
}

function showError(el, msg) {
  if (!el) return;
  el.innerHTML = `
    <div class="text-secondary text-sm text-center py-8">
      ⚠️ ${msg}<br>
      <span class="text-on-surface-variant text-xs">Make sure the backend is running: <code>uvicorn main:app</code></span>
    </div>`;
}

// ── Navigation ───────────────────────────────────────────────────────────────
function navigate(page, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.href = `${page}${query ? "?" + query : ""}`;
}

function navActive(page) {
  const links = document.querySelectorAll("[data-nav]");
  links.forEach((l) => {
    const isActive = l.dataset.nav === page;
    l.classList.toggle("text-primary", isActive);
    l.classList.toggle("text-on-surface-variant", !isActive);
  });
}

// ── Bottom Nav builder ───────────────────────────────────────────────────────
// ── Bottom Nav builder ───────────────────────────────────────────────
function buildBottomNav(activePage) {
  const nav = document.getElementById("bottom-nav");
  if (!nav) return;
  const items = [
    { key: "dashboard", icon: "home",          label: "Home",    href: "dashboard.html" },
    { key: "route",     icon: "route",          label: "Plan",    href: "route-planner.html" },
    { key: "heatmap",   icon: "public",         label: "Map",     href: "heatmap.html" },
    { key: "journey",   icon: "directions_walk",label: "Journey", href: "journey.html" },
    { key: "profile",   icon: "account_circle", label: "Profile", href: "profile.html" },
  ];
  nav.innerHTML = items.map(({ key, icon, label, href }) => {
    const active = key === activePage;
    const col = active ? "#3fff8b" : "#ababac";
    return `<a href="${href}" style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:.45rem .55rem;border-radius:.75rem;text-decoration:none;color:${col};transition:color .15s;-webkit-tap-highlight-color:transparent;">
        <span class="material-symbols-outlined" style="font-size:25px;font-variation-settings:'FILL' ${active?1:0},'wght' 400,'GRAD' 0,'opsz' 24;">${icon}</span>
        <span style="font-size:.54rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;">${label}</span>
      </a>`;
  }).join("");
}


// ── Auth guard — redirect to login if no user stored ────────────────────────
function requireAuth() {
  if (!localStorage.getItem("gp_user") && !window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
  }
}

// ── Lungs Score Ring ─────────────────────────────────────────────────────────
function renderScoreRing(containerId, score, label = "Lungs Score") {
  const el = document.getElementById(containerId);
  if (!el) return;
  const offset = scoreRingOffset(score);
  const color  = aqiColor(score > 50 ? 100 - score : 10); // invert: high score = good
  el.innerHTML = `
    <div class="relative w-48 h-48 flex items-center justify-center">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
        <circle cx="96" cy="96" r="88" fill="transparent"
                stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
        <circle cx="96" cy="96" r="88" fill="transparent"
                stroke="${color}" stroke-width="12"
                stroke-dasharray="${2 * Math.PI * 88}"
                stroke-dashoffset="${offset}"
                stroke-linecap="round"
                style="filter: drop-shadow(0 0 12px ${color}88); transition: stroke-dashoffset 1s ease"/>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-5xl font-extrabold tracking-tighter">${score}</span>
        <span class="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">${label}</span>
      </div>
    </div>`;
}

// ── Auth guard ───────────────────────────────────────────────────────────────
function requireAuth() {
  const u = localStorage.getItem("gp_user");
  if (!u) { window.location.href = "login.html"; return null; }
  return JSON.parse(u);
}