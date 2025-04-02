import json

# Input and output file paths
input_file = "combined_accident_data.json"
output_file = "accidents.geojson"

# Step 1: Read combined data
with open(input_file, 'r') as f:
    data = json.load(f)

# Step 2: Convert to GeoJSON format
geojson = {
    "type": "FeatureCollection",
    "features": []
}

severity_colors = {
    1: "green",   # Low severity
    2: "yellow",  # Moderate severity
    3: "orange",  # High severity
    4: "red"      # Very high severity
}

for record in data:
    feature = {
        "type": "Feature",
        "properties": {
            "id": record["id"],
            "severity": record["severity"],
            "color": severity_colors.get(record["severity"], "gray") 
        },
        "geometry": {
            "type": "Point",
            "coordinates": [record["longitude"], record["latitude"]]
        }
    }
    geojson["features"].append(feature)

# Step 3: Save to GeoJSON file
with open(output_file, 'w') as f:
    json.dump(geojson, f, indent=4)

print(f"GeoJSON file saved to {output_file}")
