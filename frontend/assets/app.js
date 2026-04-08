/* GreenPulse — Shared utilities v3 (SQLite, Auth & Heatmap Integrated) */
const API_BASE = "http://127.0.0.1:8000";

const State = { city: "Bengaluru", lat: 12.9716, lon: 77.5946 };

/* ── SVG icon strings ── */
const SVG = {
  home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  plan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="2" fill="currentColor"/><circle cx="17" cy="12" r="2" fill="currentColor"/><circle cx="7" cy="18" r="2" fill="currentColor"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>`,
  walk: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`
};

/* ── Database-Driven API Client ── */
const API = {
  async signup(name, email, password) {
    const r = await fetch(`${API_BASE}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.detail || "Signup failed");
    }
    return r.json();
  },

  async login(email, password) {
    const r = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) throw new Error("Invalid email or password");
    const data = await r.json();
    localStorage.setItem("gp_user", JSON.stringify(data.user));
    return data;
  },

  // NEW: Heatmap data method
  async heatmap() {
    const r = await fetch(`${API_BASE}/api/heatmap`);
    if (!r.ok) throw new Error("Heatmap data failed to load");
    return r.json();
  },

  async completeJourney(lungsScore, co2Saved) {
    const user = JSON.parse(localStorage.getItem("gp_user"));
    if (!user) return;

    const r = await fetch(`${API_BASE}/api/complete-journey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        lungs_score: lungsScore,
        co2_saved: co2Saved
      })
    });

    if (r.ok) {
      user.journeys += 1;
      user.co2_saved += co2Saved;
      user.lungs_avg = Math.round((user.lungs_avg + lungsScore) / 2);
      localStorage.setItem("gp_user", JSON.stringify(user));
    }
    return r.json();
  },

  async dashboard(lat = State.lat, lon = State.lon, city = State.city) {
    const r = await fetch(`${API_BASE}/api/dashboard?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
    if (!r.ok) throw new Error("Dashboard fetch failed");
    return r.json();
  },

  async routes(origin, destination) {
    const r = await fetch(`${API_BASE}/api/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, city: State.city, lat: State.lat, lon: State.lon })
    });
    if (!r.ok) throw new Error("Route planning failed");
    return r.json();
  }
};

/* ── Helpers ── */
function aqiColor(a) { return a <= 50 ? "#3fff8b" : a <= 100 ? "#ffbd5c" : a <= 150 ? "#ff7350" : "#ff716c"; }
function scoreOffset(s, r = 88) { const c = 2 * Math.PI * r; return c - (s / 100) * c; }

/* ── Bottom Nav Builder ── */
function buildBottomNav(activePage) {
  const nav = document.getElementById("bottom-nav");
  if (!nav) return;
  const items = [
    { key: "dashboard", svg: SVG.home, label: "Home", href: "dashboard.html" },
    { key: "route", svg: SVG.plan, label: "Plan", href: "route-planner.html" },
    { key: "heatmap", svg: SVG.map, label: "Map", href: "heatmap.html" },
    { key: "journey", svg: SVG.walk, label: "Journey", href: "journey.html" },
    { key: "profile", svg: SVG.user, label: "Profile", href: "profile.html" },
  ];
  nav.innerHTML = items.map(({ key, svg, label, href }) => {
    const a = key === activePage;
    return `<a href="${href}" class="${a ? "active" : ""}" style="${a ? "color:var(--primary)" : ""}">
      <span style="width:24px;height:24px;display:flex;">${svg}</span>
      ${label}
    </a>`;
  }).join("");
}

/* ── Authentication Guard ── */
function requireAuth() {
  const user = localStorage.getItem("gp_user");
  const path = window.location.pathname;
  if (!user && !path.includes("login.html") && !path.includes("signup.html")) {
    window.location.href = "login.html";
  }
}

function doLogout() {
  localStorage.removeItem("gp_user");
  window.location.href = "login.html";
}

/* ── Map Tooltip Initializer ── */
function setupMapHover(map) {
  const tooltip = document.getElementById('hover-tooltip');
  if (!tooltip) return;

  let hoverTimer;

  map.on('mousemove', (e) => {
    tooltip.style.display = 'block';
    tooltip.style.left = (e.originalEvent.pageX + 15) + 'px';
    tooltip.style.top = (e.originalEvent.pageY + 15) + 'px'; // FIXED: pageY for vertical axis

    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(async () => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(`${API_BASE}/api/weather-at?lat=${lat}&lon=${lng}`);
        const data = await res.json();

        if (data.temp !== undefined) {
          document.getElementById('tooltip-city').innerText = data.city_guess || "Bengaluru Outer";
          document.getElementById('tooltip-temp').innerText = `${Math.round(data.temp)}°C`;
          document.getElementById('tooltip-aqi').innerText = data.aqi;

          const aqiCol = data.aqi <= 2 ? "#3fff8b" : data.aqi <= 3 ? "#ffbd5c" : "#ff716c";
          document.getElementById('tooltip-aqi').style.color = aqiCol;
        }
      } catch (err) {
        console.error("Hover Data Error:", err);
      }
    }, 300);
  });

  map.on('mouseout', () => { tooltip.style.display = 'none'; });
}