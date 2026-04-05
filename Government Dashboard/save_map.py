# save_map.py
import osmnx as ox
import pickle

print("Downloading Mysuru road network...")
G = ox.graph_from_place("Mysuru, Karnataka, India", network_type="drive")
ox.save_graphml(G, "mysuru_graph.graphml")

# Also save a pickle for faster loading
with open("mysuru_graph.pkl", "wb") as f:
    pickle.dump(G, f)

print(f"Saved. Nodes: {len(G.nodes)}, Edges: {len(G.edges)}")