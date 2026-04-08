"""
GreenPulse Backend — AI-Powered Micro-Climate & Commute Optimizer
FastAPI server with Gemini AI integration and real AQI/weather data
"""

import os, json, math, random, time
from datetime import datetime
from typing import Optional
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import sqlite3
from database import init_db

load_dotenv()
init_db()

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class JourneyComplete(BaseModel):
    email: str
    co2_saved: int
    lungs_score: int

app = FastAPI(title="GreenPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API keys ────────────────────────────────────────────────────────────────
GEMINI_KEY   = os.getenv("GEMINI_API_KEY", "")
OWM_KEY      = os.getenv("OPENWEATHERMAP_API_KEY", "")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# ── Pydantic models ──────────────────────────────────────────────────────────
class RouteRequest(BaseModel):
    origin: str
    destination: str
    city: str = "Bengaluru"
    lat: Optional[float] = 12.9716
    lon: Optional[float] = 77.5946

class HeatmapRequest(BaseModel):
    city: str = "Bengaluru"
    lat: float = 12.9716
    lon: float = 77.5946

# ── Helpers ──────────────────────────────────────────────────────────────────
def _aqi_category(aqi: int) -> dict:
    if aqi <= 50:
        return {"label": "Good", "color": "#3fff8b", "glow": "emerald"}
    if aqi <= 100:
        return {"label": "Moderate", "color": "#ffbd5c", "glow": "amber"}
    if aqi <= 150:
        return {"label": "Unhealthy for Sensitive", "color": "#ff7350", "glow": "orange"}
    if aqi <= 200:
        return {"label": "Unhealthy", "color": "#ff716c", "glow": "red"}
    return {"label": "Hazardous", "color": "#9f0519", "glow": "red"}

def get_db_conn():
    conn = sqlite3.connect('greenpulse.db')
    conn.row_factory = sqlite3.Row # Allows accessing columns by name
    return conn

def get_user(email: str):
    conn = get_db_conn()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    return dict(user) if user else None

def _lungs_score(aqi: int, temp_c: float) -> int:
    """Compute a 0-100 Lungs Score from AQI + temperature."""
    aqi_factor  = max(0, 100 - aqi)
    temp_factor = max(0, 100 - max(0, (temp_c - 20) * 3))
    return int(min(100, (aqi_factor * 0.7 + temp_factor * 0.3)))

async def _fetch_owm(lat: float, lon: float) -> dict:
    """Fetch real weather + AQI from OpenWeatherMap if key is present."""
    if not OWM_KEY:
        return _mock_env(lat, lon)
    async with httpx.AsyncClient(timeout=8) as client:
        try:
            weather_r = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": OWM_KEY, "units": "metric"}
            )
            aqi_r = await client.get(
                "https://api.openweathermap.org/data/2.5/air_pollution",
                params={"lat": lat, "lon": lon, "appid": OWM_KEY}
            )
            w = weather_r.json()
            a = aqi_r.json()
            raw_aqi = a["list"][0]["components"]
            aqi_val = int(raw_aqi.get("pm2_5", 30) * 4.5)
            temp    = w["main"]["temp"]
            humidity = w["main"]["humidity"]
            wind    = w["wind"]["speed"]
            return {
                "aqi": aqi_val,
                "temp": round(temp, 1),
                "humidity": humidity,
                "wind_speed": round(wind, 1),
                "description": w["weather"][0]["description"].title(),
                "pm25": round(raw_aqi.get("pm2_5", 10), 1),
                "co2_equivalent": round(raw_aqi.get("co", 200) / 100, 1),
            }
        except Exception:
            return _mock_env(lat, lon)

def _mock_env(lat: float, lon: float) -> dict:
    """Deterministic mock environment data for demo."""
    seed = int(abs(lat * lon * 100)) % 100
    random.seed(seed + int(time.time() / 3600))
    aqi  = random.randint(25, 120)
    temp = round(random.uniform(24, 36), 1)
    return {
        "aqi": aqi,
        "temp": temp,
        "humidity": random.randint(40, 85),
        "wind_speed": round(random.uniform(1, 12), 1),
        "description": random.choice(["Partly Cloudy", "Sunny", "Hazy", "Clear Sky"]),
        "pm25": round(aqi * 0.22, 1),
        "co2_equivalent": round(random.uniform(1.2, 4.8), 1),
    }

def _generate_route_segments(origin: str, destination: str, pollution_bias: float):
    """Create 3-6 route waypoints with simulated AQI heat."""
    n = random.randint(3, 6)
    segments = []
    landmarks = [
        "MG Road", "Indiranagar", "Koramangala", "HSR Layout", "Jayanagar",
        "Rajajinagar", "Whitefield", "Electronic City", "Hebbal", "Yelahanka",
        "BTM Layout", "JP Nagar", "Vijayanagar", "Yeshwantpur", "Malleswaram"
    ]
    random.shuffle(landmarks)
    for i in range(n):
        aqi = int(pollution_bias * random.randint(20, 160))
        segments.append({
            "name": landmarks[i],
            "aqi": min(aqi, 200),
            "heat_index": round(random.uniform(28, 42), 1),
            "co2_ppm": random.randint(400, 900),
        })
    return segments

GEMINI_PROMPT_TEMPLATE = """
You are GreenPulse AI, an expert urban commute health consultant.

TASK: Perform Multi-Criteria Decision Making (MCDM) to rank 3 commute routes for a user in {city}.

JOURNEY: from "{origin}" to "{destination}"

REAL-TIME ENVIRONMENTAL DATA (JSON):
{env_data}

ROUTE OPTIONS (JSON):
{routes_data}

SCORING CRITERIA (weights):
- Air Quality Index (AQI): 40% weight — lower is better
- Temperature / Heat Index: 25% weight — lower is better
- CO2 Exposure: 20% weight — lower is better
- Estimated Travel Time: 15% weight — lower is better

OUTPUT FORMAT — respond ONLY with a valid JSON object, no markdown, no explanation outside JSON:
{{
  "ranked_routes": [
    {{
      "rank": 1,
      "name": "The Green Artery",
      "tag": "Healthy Path",
      "lungs_score": <integer 0-100>,
      "aqi_avg": <integer>,
      "distance_km": <float>,
      "duration_min": <integer>,
      "co2_saved_g": <integer>,
      "health_benefit": "<one sentence health benefit>",
      "segments": ["<waypoint1>", "<waypoint2>", "..."],
      "leave_window": "<e.g. Leave in 12 minutes for cleanest air>",
      "color": "#3fff8b"
    }},
    {{
      "rank": 2,
      "name": "The Urban Shortcut",
      "tag": "Fastest Path",
      "lungs_score": <integer>,
      "aqi_avg": <integer>,
      "distance_km": <float>,
      "duration_min": <integer>,
      "co2_saved_g": <integer>,
      "health_benefit": "<one sentence>",
      "segments": ["<waypoint1>", "..."],
      "leave_window": "<e.g. Leave now>",
      "color": "#ffbd5c"
    }},
    {{
      "rank": 3,
      "name": "The Scenic Bypass",
      "tag": "Balanced Path",
      "lungs_score": <integer>,
      "aqi_avg": <integer>,
      "distance_km": <float>,
      "duration_min": <integer>,
      "co2_saved_g": <integer>,
      "health_benefit": "<one sentence>",
      "segments": ["<waypoint1>", "..."],
      "leave_window": "<e.g. Wait 20 minutes>",
      "color": "#ff7350"
    }}
  ],
  "ai_insight": "<2-sentence overall commute health insight for this city>",
  "best_window_minutes": <integer — minutes from now to leave for best air quality>
}}
"""

async def _call_gemini(prompt: str) -> dict:
    """Call Gemini 1.5 Flash and parse JSON response."""
    if not GEMINI_KEY:
        return None
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp  = model.generate_content(prompt)
        text  = resp.text.strip()
        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return None

def _fallback_routes(env: dict, origin: str, destination: str) -> dict:
    """Local fallback when Gemini API key is absent."""
    aqi = env["aqi"]
    return {
        "ranked_routes": [
            {
                "rank": 1,
                "name": "The Green Artery",
                "tag": "Healthy Path",
                "lungs_score": _lungs_score(max(aqi - 30, 10), env["temp"]),
                "aqi_avg": max(aqi - 30, 10),
                "distance_km": round(random.uniform(3.5, 8.0), 1),
                "duration_min": random.randint(18, 32),
                "co2_saved_g": random.randint(120, 400),
                "health_benefit": "Passes through tree-lined corridors with 35% lower PM2.5 exposure.",
                "segments": ["Cubbon Park Road", "MG Road", "Residency Road"],
                "leave_window": "Leave in 8 minutes for cleanest air window.",
                "color": "#3fff8b",
            },
            {
                "rank": 2,
                "name": "The Urban Shortcut",
                "tag": "Fastest Path",
                "lungs_score": _lungs_score(aqi, env["temp"]),
                "aqi_avg": aqi,
                "distance_km": round(random.uniform(2.0, 5.0), 1),
                "duration_min": random.randint(12, 22),
                "co2_saved_g": random.randint(60, 200),
                "health_benefit": "Fastest route but passes through 2 high-traffic intersections.",
                "segments": ["Brigade Road", "Richmond Circle"],
                "leave_window": "Leave now.",
                "color": "#ffbd5c",
            },
            {
                "rank": 3,
                "name": "The Scenic Bypass",
                "tag": "Balanced Path",
                "lungs_score": _lungs_score(aqi + 20, env["temp"] + 1),
                "aqi_avg": aqi + 20,
                "distance_km": round(random.uniform(5.0, 10.0), 1),
                "duration_min": random.randint(28, 45),
                "co2_saved_g": random.randint(20, 100),
                "health_benefit": "Longer route avoids main arterial roads during peak hour.",
                "segments": ["Lalbagh Road", "Jayanagar", "JP Nagar"],
                "leave_window": "Wait 15 minutes for lower traffic.",
                "color": "#ff7350",
            },
        ],
        "ai_insight": (
            f"Current AQI in {origin.split(',')[0]} is {aqi} ({_aqi_category(aqi)['label']}). "
            "The Green Artery route will expose you to 35% less pollution than the fastest path."
        ),
        "best_window_minutes": 8,
    }

def _build_heatmap_zones(lat: float, lon: float, base_aqi: int) -> list:
    """Generate mock heatmap zones around a city center."""
    zones = []
    angles = [i * 30 for i in range(12)]
    radii  = [0.02, 0.04, 0.06]
    for r in radii:
        for angle in angles:
            rad = math.radians(angle)
            z_lat = lat + r * math.cos(rad)
            z_lon = lon + r * math.sin(rad)
            seed  = int(abs(z_lat * z_lon * 10000)) % 200
            aqi   = base_aqi + random.randint(-20, 50)
            zones.append({
                "lat": round(z_lat, 5),
                "lon": round(z_lon, 5),
                "aqi": aqi,
                "temp": round(27 + (aqi / 50), 1),
                "category": _aqi_category(aqi),
                "radius_m": int(400 + aqi * 2),
            })
    return zones

# ── API Routes ───────────────────────────────────────────────────────────────
@app.post("/api/signup")
async def signup(user: UserSignup):
    conn = get_db_conn()
    try:
        conn.execute(
            'INSERT INTO users (name, email, password, joined_date) VALUES (?, ?, ?, ?)',
            (user.name, user.email, user.password, datetime.now().strftime("%Y-%m-%d"))
        )
        conn.commit()
        return {"message": "User created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()

@app.post("/api/login")
async def login(data: dict):
    user = get_user(data.get("email"))
    if user and user["password"] == data.get("password"):
        return {"status": "success", "user": user}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/complete-journey")
async def journey_complete(data: JourneyComplete):
    conn = get_db_conn()
    try:
        # 1. Update User Stats
        conn.execute(
            '''
            UPDATE users 
            SET journeys = journeys + 1, 
                co2_saved = co2_saved + ?, 
                lungs_avg = ?
            WHERE email = ?
            ''',
            (data.co2_saved, data.lungs_score, data.email)
        )
        
        # 2. Log History
        conn.execute(
            '''
            INSERT INTO history (user_email, date, lungs_score, co2_saved)
            VALUES (?, ?, ?, ?)
            ''',
            (data.email, datetime.now().strftime("%Y-%m-%d"), data.lungs_score, data.co2_saved)
        )
        
        conn.commit()
        
        # Fetch updated user data
        updated_user = get_user(data.email)
        return {"status": "success", "new_stats": updated_user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/")
async def root():
    return {"message": "GreenPulse API is alive 🌿", "version": "1.0.0"}


@app.get("/api/dashboard")
async def dashboard(lat: float = 12.9716, lon: float = 77.5946, city: str = "Bengaluru"):
    """Returns real-time dashboard data: AQI, Lungs Score, weather, quick stats."""
    env  = await _fetch_owm(lat, lon)
    aqi  = env["aqi"]
    cat  = _aqi_category(aqi)
    score = _lungs_score(aqi, env["temp"])

    hour = datetime.now().hour
    greeting = "Good morning" if hour < 12 else ("Good afternoon" if hour < 17 else "Good evening")

    return {
        "city": city,
        "greeting": greeting,
        "lungs_score": score,
        "aqi": aqi,
        "aqi_category": cat,
        "temperature": env["temp"],
        "humidity": env["humidity"],
        "wind_speed": env["wind_speed"],
        "description": env["description"],
        "pm25": env["pm25"],
        "co2_equivalent": env["co2_equivalent"],
        "aqi_vs_yesterday": random.randint(-15, 20),
        "pollution_avoided_today": random.randint(0, 340),
        "active_commuters": random.randint(1200, 8500),
        "best_leave_in_min": random.randint(5, 25),
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/routes")
async def plan_routes(req: RouteRequest):
    """
    Core AI endpoint — uses Gemini MCDM to rank 3 routes by health criteria.
    Falls back to local algorithm if API key is missing.
    """
    env = await _fetch_owm(req.lat, req.lon)

    # Build 3 raw route options for the AI to analyse
    raw_routes = []
    for bias in [0.6, 1.0, 1.3]:
        segs = _generate_route_segments(req.origin, req.destination, bias)
        avg_aqi = int(sum(s["aqi"] for s in segs) / len(segs))
        raw_routes.append({
            "option": len(raw_routes) + 1,
            "estimated_distance_km": round(random.uniform(2.5, 12.0), 1),
            "estimated_duration_min": random.randint(12, 50),
            "segments": segs,
            "avg_aqi": avg_aqi,
        })

    prompt = GEMINI_PROMPT_TEMPLATE.format(
        city=req.city,
        origin=req.origin,
        destination=req.destination,
        env_data=json.dumps(env, indent=2),
        routes_data=json.dumps(raw_routes, indent=2),
    )

    result = await _call_gemini(prompt)
    if not result:
        result = _fallback_routes(env, req.origin, req.destination)

    # Enrich with current env data
    result["environment"] = env
    result["aqi_category"] = _aqi_category(env["aqi"])
    result["origin"] = req.origin
    result["destination"] = req.destination
    result["city"] = req.city
    return result


@app.get("/api/journey/{rank}")
async def journey_detail(
    rank: int,
    origin: str = "MG Road",
    destination: str = "Koramangala",
    lat: float = 12.9716,
    lon: float = 77.5946,
):
    """Return detailed journey breakdown for a specific route rank (1/2/3)."""
    env   = await _fetch_owm(lat, lon)
    bias  = [0.6, 1.0, 1.3][min(rank - 1, 2)]
    segs  = _generate_route_segments(origin, destination, bias)
    aqi_avg = int(sum(s["aqi"] for s in segs) / len(segs))
    score = _lungs_score(aqi_avg, env["temp"])
    names = ["The Green Artery", "The Urban Shortcut", "The Scenic Bypass"]
    tags  = ["Healthy Path", "Fastest Path", "Balanced Path"]
    colors = ["#3fff8b", "#ffbd5c", "#ff7350"]

    milestones = []
    for i, seg in enumerate(segs):
        cat = _aqi_category(seg["aqi"])
        milestones.append({
            "step": i + 1,
            "location": seg["name"],
            "aqi": seg["aqi"],
            "aqi_category": cat,
            "heat_index": seg["heat_index"],
            "action": "Continue through clean corridor." if seg["aqi"] < 60
                      else "Moderate pollution zone — consider mask." if seg["aqi"] < 120
                      else "High pollution — speed through, avoid prolonged stop.",
        })

    return {
        "rank": rank,
        "name": names[rank - 1],
        "tag": tags[rank - 1],
        "color": colors[rank - 1],
        "lungs_score": score,
        "aqi_avg": aqi_avg,
        "aqi_category": _aqi_category(aqi_avg),
        "distance_km": round(random.uniform(3, 10), 1),
        "duration_min": random.randint(15, 45),
        "co2_saved_g": random.randint(80, 380),
        "calories_burned": random.randint(40, 180),
        "environment": env,
        "milestones": milestones,
        "health_tip": random.choice([
            "Hydrate before you leave — urban heat islands can raise body temp faster than you think.",
            "Breathe through your nose; nasal passages filter 70% more PM2.5 than mouth breathing.",
            "Walk on the shaded side of the street to reduce heat exposure by up to 8°C.",
        ]),
    }

@app.get("/api/heatmap")
async def heatmap(lat: float = 12.9716, lon: float = 77.5946, city: str = "Bengaluru"):
    """Returns pollution heatmap zones for the city."""
    env   = await _fetch_owm(lat, lon)
    zones = _build_heatmap_zones(lat, lon)
    hot_spots = sorted(zones, key=lambda z: z["aqi"], reverse=True)[:5]
    clean_spots = sorted(zones, key=lambda z: z["aqi"])[:5]
    return {
        "city": city,
        "center": {"lat": lat, "lon": lon},
        "environment": env,
        "zones": zones,
        "hot_spots": hot_spots,
        "clean_spots": clean_spots,
        "community_reports": random.randint(48, 320),
        "last_updated": datetime.now().isoformat(),
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_KEY),
        "owm_configured": bool(OWM_KEY),
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/api/daily-briefing")
async def get_daily_briefing(city: str = "Bengaluru"):
    env = await _fetch_owm(12.9716, 77.5946) # Use city coords
    prompt = f"Give a 1-sentence health advice for a commuter in {city} where AQI is {env['aqi']} and temp is {env['temp']}C. Focus on respiratory safety."
    model = genai.GenerativeModel("gemini-1.5-flash")
    resp = model.generate_content(prompt)
    return {"briefing": resp.text.strip()}