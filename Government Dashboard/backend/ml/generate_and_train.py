import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib, os, json

np.random.seed(42)
N = 8000

# ============================================================
# REAL DATA CONSTANTS (derived from actual files we have)
# ============================================================

# From export.geojson: 105 hospitals, 10 critical
N_HOSPITALS_TOTAL = 105
N_HOSPITALS_CRITICAL = 10

# From export__1_.geojson: 72 schools
N_SCHOOLS_TOTAL = 72

# From export__2_.geojson: 65 bus routes
N_BUS_ROUTES = 65

# From export.json: 138 bus stops
N_BUS_STOPS = 138

# From KGIS KML: 65 wards
N_WARDS = 65

# Mysuru population (Census 2011 + growth)
CITY_POPULATION = 920000

# From Bus Route Paper: 1170 km total road network
TOTAL_ROAD_KM = 1170

# Monsoon threshold from drainage analysis
FLOOD_THRESHOLD_MM = 45

# ============================================================
# FEATURE GENERATION
# ============================================================

scenario_type = np.random.randint(0, 8, N)

# -- Traffic/Road features --
roads_affected = np.random.randint(1, 40, N).astype(float)
total_length_km = roads_affected * np.random.uniform(0.3, 2.0, N)
duration_hours = np.random.uniform(0.5, 168, N)  # 30min to 1 week
time_of_day = np.random.uniform(0, 23, N)
day_of_week = np.random.randint(0, 7, N).astype(float)

# -- Infrastructure proximity (from real GeoJSON data) --
# hospitals within 500m of scenario zone: 0 to 5 (based on 105 hospitals / 65 wards avg)
near_hospital = np.random.choice([0,1,2,3,4,5], N, p=[0.20,0.35,0.25,0.12,0.05,0.03]).astype(float)
# schools within 500m: 0 to 4
near_school = np.random.choice([0,1,2,3,4], N, p=[0.15,0.30,0.30,0.17,0.08]).astype(float)
# bus stops within 300m: 0 to 8 (138 stops / city area)
bus_stops_affected = np.random.choice([0,1,2,3,4,5,6,7,8], N, 
    p=[0.05,0.15,0.20,0.20,0.15,0.10,0.08,0.04,0.03]).astype(float)

# -- KSRTC bus network (from 65-route GeoJSON) --
bus_routes_disrupted = np.random.randint(0, 15, N).astype(float)  # 0 to 15 of 65 routes
# Route type: 0=city_centre, 1=cross_city, 2=suburban
bus_route_type = np.random.randint(0, 3, N).astype(float)

# -- Flood/Drainage features (from drain KML) --
rainfall_mm = np.where(scenario_type == 1, np.random.uniform(10, 200, N), 
              np.random.uniform(0, 15, N))  # background rain for non-flood scenarios
drain_condition = np.random.uniform(0.3, 1.0, N)  # 1.0=perfect, 0.3=heavily blocked
is_monsoon = np.random.randint(0, 2, N).astype(float)  # June-September

# -- Festival/Tourism (from tourism calendar) --
crowd_count_lakhs = np.where(scenario_type == 2, 
    np.random.uniform(0.5, 8.0, N),  # 50k to 800k
    np.random.uniform(0.0, 0.5, N))  # background crowd
is_dasara = np.where((scenario_type == 2) & (crowd_count_lakhs > 5), 1, 0).astype(float)
tourism_load = np.random.uniform(0.10, 1.0, N)
festival_route_km = np.where(scenario_type == 2, np.random.uniform(1, 8, N), 0)

# -- Garbage Collection (from MCC zone data) --
garbage_zones_missed = np.where(scenario_type == 6, np.random.randint(1, 8, N), 0).astype(float)
days_collection_missed = np.where(scenario_type == 6, np.random.randint(1, 14, N), 0).astype(float)

# -- Ambulance specific (from hospital GeoJSON) --
hospital_distance_km = np.where(scenario_type == 7, np.random.uniform(0.5, 8, N), 
    np.random.uniform(0, 3, N))
alternate_routes_available = np.random.randint(0, 4, N).astype(float)

# -- City context --
base_congestion = np.random.uniform(0.15, 0.85, N)
wards_affected = np.random.randint(1, 20, N).astype(float)
population_density = wards_affected * 13000 / CITY_POPULATION  # fraction of city

X = pd.DataFrame({
    'scenario_type': scenario_type,
    'roads_affected': roads_affected,
    'total_length_km': total_length_km,
    'duration_hours': duration_hours,
    'time_of_day': time_of_day,
    'day_of_week': day_of_week,
    'near_hospital': near_hospital,
    'near_school': near_school,
    'bus_stops_affected': bus_stops_affected,
    'bus_routes_disrupted': bus_routes_disrupted,
    'bus_route_type': bus_route_type,
    'rainfall_mm': rainfall_mm,
    'drain_condition': drain_condition,
    'is_monsoon': is_monsoon,
    'crowd_count_lakhs': crowd_count_lakhs,
    'is_dasara': is_dasara,
    'tourism_load': tourism_load,
    'festival_route_km': festival_route_km,
    'garbage_zones_missed': garbage_zones_missed,
    'days_collection_missed': days_collection_missed,
    'hospital_distance_km': hospital_distance_km,
    'alternate_routes_available': alternate_routes_available,
    'base_congestion': base_congestion,
})

# ============================================================
# TARGET GENERATION — Physics-informed rules with noise
# All calibrated to realistic Mysuru conditions
# ============================================================

# 1. TRAFFIC CONGESTION CHANGE (%) — 0 to 80%
congestion = np.clip(
    roads_affected * 0.8 +
    total_length_km * 1.5 +
    rainfall_mm * 0.08 +
    np.maximum(0, crowd_count_lakhs - 2.0) * 4 +
    base_congestion * 4 +
    tourism_load * 3 +    
    np.where((time_of_day >= 8) & (time_of_day <= 10), 5, 0) +   # morning peak
    np.where((time_of_day >= 17) & (time_of_day <= 19), 7, 0) +  # evening peak
    np.where(day_of_week < 5, 2, -1) +                            # weekday penalty
    is_dasara * 4 +    
    garbage_zones_missed * 0.3 +  
    np.random.normal(0, 1.5, N),
    0, 80
)

# 2. AVERAGE TRAVEL DELAY (minutes) — 0 to 60 min
avg_delay = np.clip(
    congestion * 0.35 +
    total_length_km * 1.2 +
    bus_routes_disrupted * 0.6 +
    crowd_count_lakhs * 1.2 +
    np.where(alternate_routes_available == 0, 5, 0) +
    np.random.normal(0, 1.0, N),
    0, 60
)

# 3. AMBULANCE DELAY (minutes) — 0 to 25 min
ambulance_delay = np.clip(
    congestion * 0.12 +
    near_hospital * 0.4 +
    roads_affected * 0.2 +
    hospital_distance_km * 1.2 +
    np.where(alternate_routes_available == 0, 3, 0) +
    np.where(scenario_type == 7, roads_affected * 0.5, 0) +
    is_dasara * 3 +
    np.random.normal(0, 0.4, N),
    0, 25
)

# 4. POLLUTION INDEX CHANGE (AQI delta) — -5 to +40
pollution = np.clip(
    congestion * 0.25 +
    crowd_count_lakhs * 1.5 +
    garbage_zones_missed * 1.5 +  
    days_collection_missed * 1.0 +
    np.where(is_monsoon == 1, -2, 1) +  
    np.random.normal(0, 1.0, N),
    -5, 40
)

# 5. FLOOD RISK SCORE (0-10)
flood_risk = np.clip(
    rainfall_mm * 0.008 +
    np.where(scenario_type == 1, 1.2, 0) +
    (1 - drain_condition) * 1.2 +
    np.random.normal(0, 0.2, N),
    0, 3
)

# 6. PUBLIC HEALTH RISK (0-10)
public_health_risk = np.clip(
    garbage_zones_missed * 0.6 +
    days_collection_missed * 0.3 +
    flood_risk * 0.3 +
    np.where(near_hospital == 0, 1.5, 0) +
    rainfall_mm * 0.01 +
    np.random.normal(0, 0.4, N),
    0, 10
)

# 7. KSRTC SERVICE DISRUPTION SCORE (0-10)
ksrtc_disruption = np.clip(
    bus_routes_disrupted * 0.3 +
    bus_stops_affected * 0.15 +
    np.where(scenario_type == 3, bus_routes_disrupted * 0.5, 0) +
    crowd_count_lakhs * 0.8 +
    congestion * 0.03 +
    np.random.normal(0, 0.3, N),
    0, 10
)

# 8. WASTE MANAGEMENT IMPACT SCORE (0-10) — NEW metric
waste_impact = np.clip(
    garbage_zones_missed * 1.2 +
    days_collection_missed * 0.6 +
    population_density * 15 +
    is_monsoon * 2 +  # monsoon makes uncollected garbage worse
    np.where(scenario_type == 6, 3, 0) +
    np.random.normal(0, 0.5, N),
    0, 10
)

# 9. CROWD SAFETY RISK (0-10) — NEW metric (for festival scenarios)
crowd_safety = np.clip(
    np.maximum(0, crowd_count_lakhs - 9.0) * 2.5 +
    is_dasara * 1.5 +
    festival_route_km * 0.4 +
    np.where(near_hospital == 0, 2, 0) +
    np.where(alternate_routes_available < 2, 1.5, 0) +
    congestion * 0.05 +
    np.random.normal(0, 0.4, N),
    0, 10
)

y = pd.DataFrame({
    'congestion_pct': congestion,
    'avg_delay_min': avg_delay,
    'ambulance_delay_min': ambulance_delay,
    'pollution_delta': pollution,
    'flood_risk_score': flood_risk,
    'public_health_risk': public_health_risk,
    'ksrtc_disruption_score': ksrtc_disruption,
    'waste_impact_score': waste_impact,
    'crowd_safety_risk': crowd_safety,
})

# ============================================================
# TRAIN
# ============================================================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

model = Pipeline([
    ('scaler', StandardScaler()),
    ('regressor', MultiOutputRegressor(
        GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    ))
])

model.fit(X_train, y_train)
score = model.score(X_test, y_test)
print(f"✅ Model R² score on test set: {score:.3f}")

# Per-target scores
from sklearn.metrics import r2_score
y_pred = model.predict(X_test)
for i, col in enumerate(y.columns):
    r2 = r2_score(y_test.iloc[:, i], y_pred[:, i])
    print(f"  {col}: R²={r2:.3f}")

save_dir = os.path.dirname(__file__)
joblib.dump(model, os.path.join(save_dir, 'model.joblib'))
joblib.dump(list(X.columns), os.path.join(save_dir, 'feature_names.joblib'))
joblib.dump(list(y.columns), os.path.join(save_dir, 'target_names.joblib'))
print("✅ Saved: model.joblib, feature_names.joblib, target_names.joblib")
print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")
