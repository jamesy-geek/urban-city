# PRD 1: AI Urban Digital Twin (AUDT) — Full Government Platform
**Project:** Mysuru AI Urban Digital Twin  
**Team:** QUINTUS  
**Version:** 1.0  
**Target Agent:** Antigravity (VS Code)  
**Status:** Ready for Build  

---

## INSTRUCTION TO ANTIGRAVITY

Read this entire PRD before writing a single line of code. Build everything described here. Do not skip any section. Do not add features not described here. Do not ask for clarification — all decisions are made in this document. When in doubt, follow the tech stack and structure defined below exactly.

---

## 1. Project Overview

Build a full-stack web application called **"Mysuru Urban Intelligence Platform" (MUIP)** — an AI-powered Urban Digital Twin for Mysuru city. The platform has two portals that share the same backend:

1. **Government Dashboard** — Full access: simulation controls, policy tools, analytics, citizen form management, city-wide oversight. Protected by login.
2. **Citizen Dashboard** — Limited access: real-time city status map only (no simulation, no analytics, no policy tools). Plus an AI chatbot and civic forms. This is a **separate Next.js page/route**, not a separate app.

This PRD covers **the entire system** — backend, frontend, data layer, ML layer, and both portals. PRD 2 covers the Citizen Dashboard in detail. Build both from this one repo.

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules (no Tailwind, no styled-components)
- **Map:** Leaflet.js with react-leaflet
- **Charts:** Recharts
- **Animations:** Framer Motion
- **PDF Generation (client):** jsPDF + jsPDF-AutoTable
- **State:** Zustand
- **Forms:** React Hook Form + Zod validation

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15 with PostGIS extension
- **ORM:** SQLAlchemy 2.0 with GeoAlchemy2
- **Cache:** Redis (for real-time simulation state)
- **Auth:** JWT (python-jose) + bcrypt
- **Background Tasks:** Celery + Redis broker
- **PDF Generation (server):** ReportLab
- **Geospatial:** Shapely, Geopandas, Fiona (for KML processing)
- **Simulation Engine:** NetworkX (graph-based traffic simulation — do NOT use SUMO, keep it self-contained)
- **ML:** scikit-learn + joblib (for impact prediction model)

### Data Sources (pre-loaded, not fetched at runtime)
- Mysuru Ward Boundaries KML: `https://data.opencity.in/dataset/f613063a-50ac-4f34-9bd8-d98d21148b93/resource/d2542fba-3c2d-4f23-a622-7335e9088fd6/download/ca1b4555-0388-4bc0-90d8-48cf3873ed30.kml`
- Mysuru Drainage Network KML: `https://data.opencity.in/dataset/148679f9-7672-4ffd-9498-e8fd3de3d257/resource/ca482432-dcd3-4e5d-8788-3a5f33971534/download/677eda70-e321-49ca-ab78-cefc267402ec.kml`
- Road network: Fetch from OpenStreetMap Overpass API for Mysuru city bounds on first startup and cache to DB

### Deployment
- Frontend: Vercel
- Backend: Railway or Render (containerized with Docker)
- Database: Supabase PostgreSQL (free tier)

---

## 3. Repository Structure

```
muip/
├── frontend/                   # Next.js 14 app
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── government/         # Protected government dashboard
│   │   │   ├── dashboard/
│   │   │   ├── simulation/
│   │   │   ├── analytics/
│   │   │   ├── policy/
│   │   │   ├── forms/          # View and manage citizen form submissions
│   │   │   └── alerts/
│   │   ├── citizen/            # Public citizen dashboard (no auth)
│   │   │   ├── map/
│   │   │   ├── chat/
│   │   │   └── forms/
│   │   ├── api/                # Next.js API routes (proxies to FastAPI)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── map/
│   │   ├── simulation/
│   │   ├── charts/
│   │   ├── forms/
│   │   └── shared/
│   └── styles/
├── backend/                    # FastAPI app
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── simulation.py
│   │   │   │   ├── city_data.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── alerts.py
│   │   │   │   ├── forms.py
│   │   │   │   └── citizen.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── auth.py
│   │   │   └── database.py
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── simulation/         # Simulation engine
│   │   │   ├── engine.py       # NetworkX traffic graph
│   │   │   ├── scenarios.py    # Scenario definitions
│   │   │   └── ml_predictor.py # scikit-learn model
│   │   ├── data/
│   │   │   ├── kml_loader.py   # KML parsing and DB seeding
│   │   │   └── osm_loader.py   # OSM road network loader
│   │   └── tasks/              # Celery background tasks
│   ├── requirements.txt
│   └── Dockerfile
├── ml/                         # ML model training scripts
│   ├── train.py
│   ├── generate_synthetic_data.py
│   └── models/                 # Saved .joblib model files
└── docker-compose.yml
```

---

## 4. Database Schema

Create all tables with SQLAlchemy + PostGIS. Run migrations with Alembic.

### Tables

**`users`**
```
id (UUID PK), email, password_hash, role ENUM('superadmin','admin','analyst'), 
full_name, created_at, is_active
```

**`wards`**
```
id (int PK), kgis_ward_id (int), ward_code (str), ward_name (str), 
ward_number (int), town_code (str), lgd_ward_code (int),
area_sqm (float), perimeter_m (float),
geometry (GEOMETRY Polygon SRID=4326)
```

**`drains`**
```
id (int PK), object_id (int), category ENUM('Drain','Stream','River'),
dr_code (str), status (str), length_m (float),
geometry (GEOMETRY MultiLineString SRID=4326)
```

**`road_segments`**
```
id (int PK), osm_id (bigint), name (str), highway_type (str),
lanes (int), max_speed (int), oneway (bool),
start_node (bigint), end_node (bigint),
geometry (GEOMETRY LineString SRID=4326),
ward_id (int FK → wards)
```

**`simulations`**
```
id (UUID PK), created_by (UUID FK → users), name (str),
status ENUM('pending','running','complete','failed'),
scenario_type ENUM('road_closure','construction','flood','festival','bus_route','vehicle_restriction'),
input_parameters (JSONB), results (JSONB),
started_at, completed_at, created_at
```

**`active_alerts`**
```
id (UUID PK), alert_type ENUM('road_block','flood_risk','high_congestion','event','construction'),
severity ENUM('low','medium','high','critical'),
title (str), description (str), affected_wards (int[]),
geometry (GEOMETRY SRID=4326), is_active (bool),
created_by (UUID FK → users), created_at, expires_at
```

**`citizen_forms`**
```
id (UUID PK), form_type ENUM('procession','road_closure_request','loudspeaker','construction_notice'),
applicant_name, applicant_phone, applicant_address (str),
form_data (JSONB), status ENUM('submitted','under_review','approved','rejected'),
pdf_path (str), submitted_at, reviewed_by (UUID FK → users), reviewed_at, reviewer_notes
```

**`simulation_results_cache`**
```
id (UUID PK), simulation_id (UUID FK → simulations),
congestion_change_pct (float), avg_delay_minutes (float),
ambulance_delay_minutes (float), affected_road_count (int),
flood_risk_wards (int[]), pollution_index_change (float),
alternative_routes (JSONB), ward_impacts (JSONB),
created_at
```

---

## 5. Data Loading (Startup Scripts)

### KML Loader (`backend/app/data/kml_loader.py`)
On first startup, if `wards` table is empty:
1. Download both KML files from the URLs in Section 2
2. Parse with `fiona` + `shapely`
3. Insert all features into `wards` and `drains` tables
4. Log "Ward data loaded: N wards" and "Drain data loaded: N features"

### OSM Road Network Loader (`backend/app/data/osm_loader.py`)
On first startup, if `road_segments` table is empty:
1. Fetch Mysuru road network from Overpass API:
   - Bounding box: `12.2, 76.5, 12.5, 76.8` (covers Mysuru city)
   - Query: all ways with `highway` tag that are not footway/path/steps
2. Parse the response, build road segments
3. Spatial join each segment to its ward using PostGIS `ST_Within`
4. Insert into `road_segments`
5. Build a NetworkX DiGraph from the segments and cache to Redis as pickle
6. Log "Road network loaded: N segments"

---

## 6. Simulation Engine (`backend/app/simulation/engine.py`)

The simulation engine is a graph-based traffic model. It does NOT call any external simulation software.

### Graph Construction
- Load road segments from DB into a NetworkX `DiGraph`
- Each node = OSM intersection node (lat, lng)
- Each edge = road segment with attributes: `length_m`, `lanes`, `max_speed`, `base_congestion` (0.0–1.0), `ward_id`
- Edge weight = `travel_time = length_m / (max_speed * (1 - base_congestion))`

### Scenario Application
The engine accepts a `ScenarioInput` object and returns a `SimulationResult`.

**Scenario: `road_closure`**
- Input: `road_segment_ids: list[int]`, `closure_duration_hours: int`
- Operation: Remove those edges from the working graph copy
- Run Dijkstra on 20 sampled OD pairs across the city
- Calculate: avg path length change, count of unreachable OD pairs
- Re-add edges, recalculate with them present for comparison
- Congestion spillover: increase `base_congestion` by 0.3 on adjacent edges

**Scenario: `construction`**
- Input: `road_segment_ids: list[int]`, `duration_days: int`, `drain_impact: bool`
- Same as road_closure but slower congestion build (0.15 increase)
- If `drain_impact=True`: flag all `drains` geometries within 100m of segments as 'at_risk'

**Scenario: `festival`** (Dasara mode)
- Input: `festival_route: list[node_ids]`, `crowd_count: int`, `duration_hours: int`
- Close all edges along festival route
- Add crowd density factor: congestion increase on 500m radius around route = `min(0.9, crowd_count / 50000 * 0.6)`
- Flag Cheluvamba Hospital and KR Hospital access roads separately

**Scenario: `flood`**
- Input: `rainfall_mm: float`, `duration_hours: float`
- For each drain within city boundary: calculate overflow risk = `rainfall_mm * duration_hours / (drain.length_m * 0.1)`
- Mark roads adjacent (within 50m) to overflowing drains as closed
- Run road_closure scenario on those roads

**Scenario: `bus_route`**
- Input: `new_route: list[node_ids]`, `frequency_per_hour: int`
- Reduce congestion on route edges by `frequency_per_hour * 0.03` (capped at 0.4 reduction)
- Recalculate network-wide metrics

**Scenario: `vehicle_restriction`**
- Input: `zone_ward_ids: list[int]`, `vehicle_type: str`, `hours: str`
- Reduce edge capacity (lanes effectively) on all roads in those wards by 30%
- Recalculate

### Output Calculation
For every scenario, the engine produces:
```python
SimulationResult(
    congestion_change_pct: float,        # compared to baseline
    avg_delay_minutes: float,            # average across OD pairs
    ambulance_delay_minutes: float,      # specifically for hospital routes
    affected_road_count: int,
    flood_risk_wards: list[int],         # ward IDs
    pollution_index_change: float,       # proxy: proportional to congestion increase
    alternative_routes: list[RouteGeoJSON],  # top 3 Dijkstra routes
    ward_impacts: dict[int, WardImpact], # per-ward congestion delta
    affected_geometry: GeoJSON,          # all affected road geometries
)
```

---

## 7. ML Predictor (`backend/app/simulation/ml_predictor.py`)

A scikit-learn model that **predicts** simulation outputs instantly, before the full NetworkX simulation runs (which may take 5–10 seconds).

### Training Data Generation (`ml/generate_synthetic_data.py`)
Generate 5000 synthetic training samples:
```python
features = {
    "road_count_affected": int,       # 1–50
    "total_length_affected_m": float, # sum of road lengths
    "ward_population_density": float, # avg density of affected wards
    "num_adjacent_hospitals": int,    # count of hospitals within 500m
    "drain_segments_at_risk": int,    # for flood scenarios
    "scenario_type_encoded": int,     # one-hot encoded
    "time_of_day": float,             # 0–23
    "day_of_week": int                # 0–6
}
targets = {
    "congestion_change_pct": float,
    "avg_delay_minutes": float,
    "ambulance_delay_minutes": float,
    "pollution_index_change": float
}
```
Use physics-informed rules with Gaussian noise to generate realistic outputs.

### Model (`ml/train.py`)
- Train a `GradientBoostingRegressor` (multi-output via `MultiOutputRegressor`) on the synthetic data
- 80/20 train/test split
- Log R² score for each target
- Save as `ml/models/impact_predictor.joblib`

### Usage in API
- On simulation request: run ML predictor first (< 100ms), stream result to frontend immediately as "preliminary estimate"
- Then run full NetworkX simulation in background (Celery task)
- When full simulation completes, push update via SSE (Server-Sent Events)

---

## 8. Authentication

- JWT-based, HS256
- Token expiry: 8 hours
- Roles: `superadmin`, `admin`, `analyst`
- `superadmin`: all access including user management
- `admin`: simulation, analytics, form review, alerts
- `analyst`: simulation and analytics only (read-only on forms)
- All `/api/v1/government/*` routes require valid JWT
- `/api/v1/citizen/*` routes are public (no auth)

Default superadmin: `admin@muip.in` / `muip@2026` (created in DB seed)

---

## 9. API Endpoints

### Auth
```
POST   /api/v1/auth/login              → {access_token, user}
POST   /api/v1/auth/refresh            → {access_token}
GET    /api/v1/auth/me                 → current user
```

### City Data (public + government)
```
GET    /api/v1/city/wards              → GeoJSON FeatureCollection of all wards
GET    /api/v1/city/wards/{id}         → Single ward with stats
GET    /api/v1/city/drains             → GeoJSON of drain network
GET    /api/v1/city/roads              → GeoJSON of road network (paginated by ward)
GET    /api/v1/city/roads/ward/{ward_id} → roads in specific ward
```

### Simulation (government only)
```
POST   /api/v1/simulation/run          → {simulation_id, preliminary_result}  [triggers Celery task]
GET    /api/v1/simulation/{id}         → simulation status + result
GET    /api/v1/simulation/{id}/stream  → SSE endpoint for live updates
GET    /api/v1/simulation/history      → list of past simulations (paginated)
DELETE /api/v1/simulation/{id}         → delete simulation record
POST   /api/v1/simulation/{id}/publish → publish as active alert to citizen map
```

### Analytics (government only)
```
GET    /api/v1/analytics/ward-summary       → congestion, alerts, simulations per ward
GET    /api/v1/analytics/simulation-stats   → aggregate outcomes across all simulations
GET    /api/v1/analytics/alert-history      → historical alert data
GET    /api/v1/analytics/form-stats         → citizen form submission statistics
```

### Alerts
```
GET    /api/v1/alerts/active           → all active alerts (public — citizen map uses this)
POST   /api/v1/alerts/create           → create alert [government only]
PATCH  /api/v1/alerts/{id}             → update alert [government only]
DELETE /api/v1/alerts/{id}             → deactivate alert [government only]
```

### Forms
```
GET    /api/v1/forms/types             → list of available form types with schema [public]
POST   /api/v1/forms/submit            → submit a citizen form [public]
GET    /api/v1/forms/{id}/pdf          → download pre-filled PDF [public]
GET    /api/v1/forms/all               → all submissions [government only]
GET    /api/v1/forms/{id}              → single submission detail [government only]
PATCH  /api/v1/forms/{id}/review       → update status + notes [government only]
```

### Citizen
```
GET    /api/v1/citizen/city-status     → active alerts + open road blocks [public]
POST   /api/v1/citizen/chat            → AI chatbot endpoint [public]
```

---

## 10. Government Dashboard — Frontend

### Design System
- **Aesthetic:** Dark-mode technical dashboard. Deep navy/charcoal backgrounds. Sharp cyan and amber accents. Monospaced data displays. Feels like a real government command center, not a startup.
- **Font:** `Space Mono` (headings/labels) + `Inter` (body/data)
- **Colors:**
  - Background: `#0a0e1a`
  - Surface: `#111827`
  - Border: `#1f2937`
  - Accent primary: `#00d4ff` (cyan)
  - Accent secondary: `#f59e0b` (amber)
  - Danger: `#ef4444`
  - Success: `#22c55e`
  - Text primary: `#f9fafb`
  - Text muted: `#6b7280`

### Pages

#### `/government/dashboard`
The main overview screen. Layout: full-screen with a persistent left sidebar.

**Left Sidebar:**
- Logo: "MUIP" in large Space Mono text
- Nav links: Dashboard, Simulation, Policy Lab, Analytics, Citizen Forms, Alerts, Settings
- User info at bottom + logout

**Main Content — 3-zone layout:**

**Zone 1 (top row — 4 stat cards):**
- Active Alerts (count + severity breakdown)
- Simulations Run Today (count)
- Citizen Forms Pending Review (count)
- Drain Risk Zones (count of wards with flood risk)
Each card has a small sparkline chart showing 7-day trend.

**Zone 2 (large, left 65%):**
- Leaflet map of Mysuru city
- Default layers shown: Ward boundaries (subtle gray outline), Active alerts (colored markers by severity)
- Layer toggles: Wards, Roads, Drains, Active Alerts, Simulation Results
- Ward boundaries loaded from `/api/v1/city/wards` as GeoJSON overlay
- Clicking a ward: opens a right-side panel with ward name, area, active alerts, recent simulations in that ward
- Map controls: zoom, reset view, layer toggles (top-right of map)
- Alert markers: pulsing red dots for critical, amber for high, etc.

**Zone 3 (right 35%):**
- "Recent Activity" feed: last 10 simulations + alerts with timestamps
- Quick-action buttons: "+ New Simulation", "+ New Alert"

#### `/government/simulation`
Full-screen simulation builder.

**Left panel — Scenario Builder:**
Step 1: Choose Scenario Type (road_closure | construction | festival | flood | bus_route | vehicle_restriction)
Step 2: Configure parameters based on type:
  - Road Closure: click roads on map to select, set duration
  - Festival: draw route on map, set crowd count + duration. Pre-set button: "Dasara Jamboo Savari" (pre-fills palace to Bannimantap route)
  - Flood: slider for rainfall mm (0–200), duration hours (1–24)
  - Construction: select roads + enable drain impact toggle
  - Bus Route: draw route on map, set frequency
  - Vehicle Restriction: select wards, vehicle type (heavy/all), time range
Step 3: Name the simulation, click "Run Simulation"

**Right panel — Map:**
- Interactive Leaflet map
- Clickable road segments (highlight on hover, select on click — changes color to red)
- Draw tool for festival/bus routes (polyline drawing mode)
- Ward selection tool for vehicle restriction

**Results Panel (appears below after simulation runs):**
- Preliminary ML estimate shown immediately (labeled "AI Estimate — Full analysis in progress")
- When Celery task completes, SSE updates results
- Show: congestion change %, avg delay, ambulance delay, flood risk wards, pollution change
- Map updates: affected roads highlighted red, alternative routes shown in green
- "Publish as Alert" button — creates an active alert from this simulation
- "Export Results" button — downloads a PDF report (ReportLab generated)

#### `/government/analytics`
Data analytics page with charts.

**Charts to render (using Recharts):**
1. Bar chart: Simulations by scenario type (last 30 days)
2. Line chart: Average congestion change over time per scenario type
3. Choropleth-style map: Wards colored by number of active alerts (dark to red gradient)
4. Pie chart: Citizen form submissions by type + status
5. Table: Top 10 most-simulated road segments

All charts have a date range filter (7d / 30d / 90d / custom).

#### `/government/policy`
Policy Lab — compare multiple scenarios side by side.

- Create up to 3 simulation scenarios simultaneously
- Side-by-side result cards with comparison table
- "Which option is better?" AI summary (send results to Claude API, display response)

#### `/government/forms`
Citizen Form Management page.

- Table of all citizen form submissions (paginated, 20 per page)
- Filters: form type, status, date range
- Click a row: opens slide-over panel with full form details
- Actions: Approve, Reject, Add reviewer notes
- Bulk actions: export CSV of all submissions
- Badge counts at top: Pending, Approved, Rejected

#### `/government/alerts`
Alert Management page.

- List of all active + expired alerts
- "Create Alert" button: modal form with type, severity, title, description, expiry date, geometry (draw on mini-map)
- Click alert: edit/deactivate
- Alert affect which wards: shown via ward name tags

---

## 11. Citizen Dashboard — Frontend

See PRD 2 for detailed Citizen Dashboard specification. This portal lives at `/citizen/*` routes in the same Next.js app.

Key constraint: **The citizen portal must never show any simulation controls, analytics, policy tools, or government form management.** It only shows:
- The live city status map (alerts from public API only)
- The AI chatbot
- The civic forms

---

## 12. Real Mysuru Landmarks (Hardcoded for Demo)

Store these as seed data. Display on the government map as named markers.

```python
MYSURU_LANDMARKS = [
    {"name": "Mysore Palace", "lat": 12.3052, "lng": 76.6551, "type": "heritage"},
    {"name": "KR Hospital", "lat": 12.3074, "lng": 76.6563, "type": "hospital"},
    {"name": "Cheluvamba Hospital", "lat": 12.3019, "lng": 76.6551, "type": "hospital"},
    {"name": "Devaraja Market", "lat": 12.3060, "lng": 76.6554, "type": "commercial"},
    {"name": "Bannimantap KSRTC Terminal", "lat": 12.3044, "lng": 76.6281, "type": "transport"},
    {"name": "Mysore Railway Station", "lat": 12.3153, "lng": 76.6462, "type": "transport"},
    {"name": "Chamundi Hill", "lat": 12.2724, "lng": 76.6730, "type": "heritage"},
    {"name": "University of Mysore", "lat": 12.3308, "lng": 76.6214, "type": "education"},
    {"name": "Narasimharaja Circle", "lat": 12.3067, "lng": 76.6508, "type": "junction"},
    {"name": "Hardinge Circle", "lat": 12.3086, "lng": 76.6494, "type": "junction"},
    {"name": "Dasara Procession Start (Palace)", "lat": 12.3052, "lng": 76.6551, "type": "route_point"},
    {"name": "Dasara Procession End (Bannimantap)", "lat": 12.3044, "lng": 76.6281, "type": "route_point"},
]
```

The "Dasara" preset in the simulation builder pre-fills the festival scenario route using Palace → Bannimantap coordinates.

---

## 13. Environment Variables

```env
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@host/muip
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your_secret_here
JWT_ALGORITHM=HS256
ANTHROPIC_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:3000,https://muip.vercel.app

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAP_CENTER_LAT=12.2958
NEXT_PUBLIC_MAP_CENTER_LNG=76.6394
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=12
```

---

## 14. Docker Setup

`docker-compose.yml` should spin up:
1. `postgres` (with PostGIS)
2. `redis`
3. `backend` (FastAPI on port 8000)
4. `celery_worker` (same image as backend, different command)
5. `frontend` (Next.js on port 3000)

Include a `startup.sh` in the backend that:
1. Runs Alembic migrations
2. Seeds default admin user
3. Runs KML loader
4. Runs OSM loader
5. Starts Uvicorn

---

## 15. Error Handling Rules

- All API errors return: `{"error": "message", "code": "ERROR_CODE", "detail": {}}`
- Frontend: all API calls wrapped in try/catch, errors shown in toast notifications
- Simulation failures: set status to 'failed', store error in `results.error`
- KML/OSM load failures: log to console, continue startup (don't crash)
- Map layer failures: show empty layer with warning badge, don't crash map

---

## 16. Performance Requirements

- Government dashboard initial load: < 3 seconds
- Map load with ward boundaries: < 2 seconds
- ML preliminary simulation result: < 500ms
- Full simulation (Celery): < 30 seconds for any scenario
- Citizen dashboard: < 2 seconds (public, cacheable)
- All GeoJSON responses: compressed with gzip

---

## 17. What NOT to Build

- Mobile app (web only)
- Real-time IoT sensor integration
- 3D city rendering
- Payment processing
- Email notifications
- User registration (admin-only user creation)
- Multi-city support
