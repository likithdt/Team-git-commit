/* GreenPulse — Shared utilities v2 */
const API_BASE = "http://localhost:8000";

const State = { city:"Bengaluru", lat:12.9716, lon:77.5946 };

/* ── SVG icon strings (no font dependency) ── */
const SVG = {
  home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  plan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="2" fill="currentColor"/><circle cx="17" cy="12" r="2" fill="currentColor"/><circle cx="7" cy="18" r="2" fill="currentColor"/></svg>`,
  map:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>`,
  walk: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`,
  loc:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/></svg>`,
  dest:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  eco:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.05 8.5C4.78 11.2 5.12 14.33 6.95 16.72L2 22l5.27-.05C9.57 23.23 12.2 24 15 24c4.97 0 9-4.03 9-9 0-4.1-2.76-7.57-6.5-8.66V2c-4.57.5-8.38 3.3-11.45 6.5zM15 22c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
  star:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  edit:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
  logout:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`,
  delete:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  info:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  notif: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>`,
  camera:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2S13.77 8.8 12 8.8 8.8 10.23 8.8 12s1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`,
  eye:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  eyeoff:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`,
  google:`<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
};

/* ── API Client ── */
const API = {
  async dashboard(lat=State.lat,lon=State.lon,city=State.city){
    const r=await fetch(`${API_BASE}/api/dashboard?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
    if(!r.ok)throw new Error("Dashboard fetch failed");return r.json();
  },
  async routes(origin,destination){
    const r=await fetch(`${API_BASE}/api/routes`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({origin,destination,city:State.city,lat:State.lat,lon:State.lon})
    });if(!r.ok)throw new Error("Route planning failed");return r.json();
  },
  async journey(rank,origin,destination){
    const r=await fetch(`${API_BASE}/api/journey/${rank}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&lat=${State.lat}&lon=${State.lon}`);
    if(!r.ok)throw new Error("Journey fetch failed");return r.json();
  },
  async heatmap(){
    const r=await fetch(`${API_BASE}/api/heatmap?lat=${State.lat}&lon=${State.lon}&city=${encodeURIComponent(State.city)}`);
    if(!r.ok)throw new Error("Heatmap fetch failed");return r.json();
  }
};

/* ── Helpers ── */
function aqiColor(a){return a<=50?"#3fff8b":a<=100?"#ffbd5c":a<=150?"#ff7350":"#ff716c";}
function aqiLabel(a){return a<=50?"Good":a<=100?"Moderate":a<=150?"Unhealthy (Sensitive)":"Unhealthy";}
function scoreOffset(s,r=88){const c=2*Math.PI*r;return c-(s/100)*c;}
function showLoading(el,msg="Fetching data…"){if(!el)return;el.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;gap:1rem;color:var(--on-sv)"><div style="width:36px;height:36px;border:2px solid var(--primary);border-top-color:transparent;border-radius:50%;" class="spin"></div><span style="font-size:.875rem">${msg}</span></div>`;}
function showError(el,msg){if(!el)return;el.innerHTML=`<div style="color:var(--secondary);font-size:.875rem;text-align:center;padding:2rem 1rem">${msg}<br><span style="color:var(--on-sv);font-size:.75rem">Make sure backend is running: uvicorn main:app --reload</span></div>`;}

/* ── Bottom nav (SVG icons) ── */
function buildBottomNav(activePage){
  const nav=document.getElementById("bottom-nav");if(!nav)return;
  const items=[
    {key:"dashboard",svg:SVG.home,   label:"Home",   href:"dashboard.html"},
    {key:"route",    svg:SVG.plan,   label:"Plan",   href:"route-planner.html"},
    {key:"heatmap",  svg:SVG.map,    label:"Map",    href:"heatmap.html"},
    {key:"journey",  svg:SVG.walk,   label:"Journey",href:"journey.html"},
    {key:"profile",  svg:SVG.user,   label:"Profile",href:"profile.html"},
  ];
  nav.innerHTML=items.map(({key,svg,label,href})=>{
    const a=key===activePage;
    return `<a href="${href}" class="${a?"active":""}" style="${a?"color:var(--primary)":""}">
      <span style="width:24px;height:24px;display:flex;">${svg}</span>
      ${label}
    </a>`;
  }).join("");
}

/* ── Score ring renderer ── */
function renderScoreRing(containerId,score,label="Lungs Score"){
  const el=document.getElementById(containerId);if(!el)return;
  const c=aqiColor(score>=60?10:score>=40?80:150);
  const off=scoreOffset(score);
  el.innerHTML=`<div style="position:relative;width:180px;height:180px;display:flex;align-items:center;justify-content:center;">
    <svg style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)" viewBox="0 0 192 192">
      <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,.05)" stroke-width="8"/>
      <circle cx="96" cy="96" r="88" fill="transparent" stroke="${c}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${2*Math.PI*88}" stroke-dashoffset="${off}"
        style="filter:drop-shadow(0 0 12px ${c}88);transition:stroke-dashoffset 1.2s ease"/>
    </svg>
    <div style="position:absolute;display:flex;flex-direction:column;align-items:center;">
      <span style="font-size:3rem;font-weight:900;letter-spacing:-.04em;line-height:1;">${score}</span>
      <span style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:var(--on-sv)">${label}</span>
    </div>
  </div>`;
}

/* ── Auth guard ── */
function requireAuth(){
  if(!localStorage.getItem("gp_user")&&!location.pathname.includes("login.html")){
    location.href="login.html";
  }
}
