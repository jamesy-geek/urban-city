import joblib, numpy as np, os
from math import radians, sin, cos, sqrt, atan2
import json

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')
FEATURES_PATH = os.path.join(os.path.dirname(__file__), 'feature_names.joblib')
TARGETS_PATH = os.path.join(os.path.dirname(__file__), 'target_names.joblib')

_model = _features = _targets = None

# Real data buffers
HOSPITALS_DATA = []  # (lat, lng, name)
SCHOOLS_DATA = []    # (lat, lng)
BUS_STOPS_DATA = []  # (lat, lng, name)

def load_real_data():
    global HOSPITALS_DATA, SCHOOLS_DATA, BUS_STOPS_DATA
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    
    # Paths according to spec
    h_path = os.path.join(data_dir, 'hospitals.geojson')
    s_path = os.path.join(data_dir, 'schools.geojson')
    bs_path = os.path.join(data_dir, 'bus_stops.json')

    try:
        if os.path.exists(h_path):
            with open(h_path) as f:
                d = json.load(f)
                HOSPITALS_DATA = [(feat['geometry']['coordinates'][1], 
                                   feat['geometry']['coordinates'][0],
                                   feat['properties'].get('name','?'))
                                  for feat in d['features']]
        
        if os.path.exists(s_path):
            with open(s_path) as f:
                d = json.load(f)
                SCHOOLS_DATA = [(feat['geometry']['coordinates'][1],
                                 feat['geometry']['coordinates'][0])
                                for feat in d['features']]
        
        if os.path.exists(bs_path):
            with open(bs_path) as f:
                d = json.load(f)
                elements = d.get('elements', [])
                BUS_STOPS_DATA = [(e['lat'], e['lon'], e['tags'].get('name','?'))
                                  for e in elements if 'lat' in e]
                                  
    except Exception as e:
        print(f"Warning: Could not load real data files: {e}")

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2-lat1)
    dlon = radians(lon2-lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))

def count_near(point_lat, point_lng, dataset, radius_km):
    if not dataset: return 1 # Baseline fallback
    return sum(1 for lat, lng, *_ in dataset 
               if haversine_km(point_lat, point_lng, lat, lng) <= radius_km)

def load_model():
    global _model, _features, _targets
    if not os.path.exists(MODEL_PATH):
        import subprocess, sys
        script_path = os.path.join(os.path.dirname(__file__), 'generate_and_train.py')
        print(f"Model not found. Training now using: {script_path}")
        subprocess.run([sys.executable, script_path])
        
    _model = joblib.load(MODEL_PATH)
    _features = joblib.load(FEATURES_PATH)
    _targets = joblib.load(TARGETS_PATH)
    load_real_data()

def predict(scenario: dict, zone_lat: float = 12.2958, zone_lng: float = 76.6394) -> dict:
    global _model, _features, _targets
    if _model is None:
        load_model()
    
    # Auto-compute proximity features from real data
    hospitals_nearby = count_near(zone_lat, zone_lng, HOSPITALS_DATA, 0.5)
    schools_nearby = count_near(zone_lat, zone_lng, SCHOOLS_DATA, 0.5)
    bus_stops_nearby = count_near(zone_lat, zone_lng, BUS_STOPS_DATA, 0.3)
    
    # If no data loaded, use realistic fallback provided by spec logic
    if not HOSPITALS_DATA: hospitals_nearby = 1
    if not SCHOOLS_DATA: schools_nearby = 2
    if not BUS_STOPS_DATA: bus_stops_nearby = 2

    SCENARIO_MAP = {
        'road_closure': 0, 'flood': 1, 'festival': 2, 'bus_route': 3,
        'vehicle_restriction': 4, 'construction': 5, 'garbage': 6,
        'ambulance': 7
    }
    
    X = np.array([[
        SCENARIO_MAP.get(scenario.get('scenario_type', 'road_closure'), 0),
        scenario.get('roads_affected', 3),
        scenario.get('total_length_km', 2.0),
        scenario.get('duration_hours', 4),
        scenario.get('time_of_day', 9),
        scenario.get('day_of_week', 1),
        hospitals_nearby,
        schools_nearby,
        bus_stops_nearby,
        scenario.get('bus_routes_disrupted', 0),
        scenario.get('bus_route_type', 0),
        scenario.get('rainfall_mm', 0),
        scenario.get('drain_condition', 0.8),
        scenario.get('is_monsoon', 0),
        scenario.get('crowd_count_lakhs', 0),
        scenario.get('is_dasara', 0),
        scenario.get('tourism_load', 0.2),
        scenario.get('festival_route_km', 0),
        scenario.get('garbage_zones_missed', 0),
        scenario.get('days_collection_missed', 0),
        scenario.get('hospital_distance_km', 2.0),
        scenario.get('alternate_routes_available', 2),
    ]])
    
    result = _model.predict(X)[0]
    
    return {
        target: round(float(val), 1)
        for target, val in zip(_targets, result)
    }
