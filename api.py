from flask import Flask, request, jsonify
from predictor import AccidentPredictor
import json
import os
import logging
import numpy as np
from joblib import load
from datetime import datetime

app = Flask(__name__)

# Setting up logging to track application activity
logging.basicConfig(level=logging.INFO)

# Define the folder that contains all mapping JSON files
data_folder = "data"

# Function to load mapping files dynamically
def load_mapping(file_name):
    try:
        with open(os.path.join(data_folder, file_name), "r") as f:
            content = json.load(f)
            # If the content is a list, convert it into a dictionary for easier lookup
            if isinstance(content, list):
                return {str(item["id"]): item for item in content}
            return content  # Return as-is if it's already a dictionary
    except FileNotFoundError:
        logging.warning(f"File '{file_name}' not found. Proceeding with an empty mapping.")
        return {}
    except json.JSONDecodeError:
        logging.error(f"Error: File '{file_name}' is not a valid JSON file. Proceeding with an empty mapping.")
        return {}

# Load mappings for different features dynamically from files
mappings = {
    "cities": load_mapping("cities.json"),
    "counties": load_mapping("counties.json"),
    "states": load_mapping("states.json"),
    "time_zones": load_mapping("time_zones.json"),
    "weather_conditions": load_mapping("weather_conditions.json"),
    "crossings": load_mapping("crossings.json"),
    "junctions": load_mapping("junctions.json"),
    "humidity": load_mapping("humidity.json"),
    "traffic_signals": load_mapping("traffic_signals.json"),
    "temperatures": load_mapping("temperatures.json"),
    "visibility": load_mapping("visibility.json"),
    "sunrise_sunsets": load_mapping("sunrise_sunsets.json"),
    "weather_timestamps": load_mapping("weather_timestamps.json"),
}

# Define the path to the trained model file and the feature columns required for predictions
model_file = "accident_model.joblib"
feature_columns = [
    "description", "city", "county", "state",
    "time_zone", "weather_condition", "crossing",
    "junction", "traffic_signal", "humidity",
    "temperature", "visibility", "road_safety_score"
]

# Load the prediction model used for accident severity prediction
try:
    predictor = AccidentPredictor(model_file)
except FileNotFoundError:
    raise FileNotFoundError(f"Model file '{model_file}' not found. Please train the model and ensure the file exists.")

# Load the road safety model for additional scoring
try:
    road_safety_model = load("road_safety_model.joblib")
except FileNotFoundError:
    raise FileNotFoundError("Road safety model file not found. Please train and save the model first.")

# Helper function to determine if the time is night or day based on sunrise/sunset information
def is_night(sunrise_sunset):
    return 1 if sunrise_sunset.lower() == "night" else 0

@app.route("/predict", methods=["POST"])
def predict_likelihood():
    data = request.get_json()
    try:
        logging.info("Received data: %s", data)

        # Process input data by mapping IDs to actual values or using the raw input directly
        processed_data = {}
        for field, mapping_key in {
            "city": "cities",
            "county": "counties",
            "state": "states",
            "time_zone": "time_zones",
            "weather_condition": "weather_conditions",
            "crossing": "crossings",
            "junction": "junctions",
            "traffic_signal": "traffic_signals",
            "humidity": "humidity",
            "temperature": "temperatures",
            "visibility": "visibility"
        }.items():
            if field in data and data[field]:  # Use the provided value if available
                processed_data[field] = data[field]
            else:  # Otherwise, try mapping based on IDs
                field_id = data.get(f"{field}_id")
                processed_data[field] = mappings[mapping_key].get(str(field_id), {}).get(field, 0)

        # Ensure numeric values are properly converted
        processed_data["temperature"] = float(processed_data.get("temperature", 0))
        processed_data["visibility"] = float(processed_data.get("visibility", 10))  # Default to 10km visibility
        processed_data["humidity"] = int(processed_data.get("humidity", 50))  # Default to 50% humidity

        # Encode the weather condition into a numeric category
        weather_condition = data.get("weather_condition", "Other")
        if weather_condition not in mappings["weather_conditions"]:
            weather_condition_encoded = len(mappings["weather_conditions"])  # Assign a code for unknown conditions
        else:
            weather_condition_encoded = mappings["weather_conditions"][weather_condition]["weather_condition"]

        processed_data["weather_condition"] = weather_condition_encoded

        # Add derived features for night and weekend checks
        processed_data["is_night"] = is_night(data.get("sunrise_sunset", "day"))
        processed_data["is_weekend"] = int(datetime.now().weekday() >= 5)

        # Predict road safety score using relevant features
        road_safety_features = [
            processed_data["visibility"],
            processed_data["temperature"],
            processed_data["humidity"],
            processed_data["weather_condition"],
            processed_data["is_night"],
            processed_data["is_weekend"]
        ]
        road_safety_features = np.array(road_safety_features).reshape(1, -1)
        road_safety = road_safety_model.predict(road_safety_features)[0]
        processed_data["road_safety_score"] = road_safety

        # Prepare the final input data structure for the accident prediction model
        input_data = {key: processed_data.get(key, 0) for key in feature_columns}
        logging.info("Processed input data: %s", input_data)

        # Generate the prediction using the loaded model
        prediction = predictor.predict(input_data)

        # Convert any NumPy data types to standard Python types for JSON compatibility
        if isinstance(prediction, (np.integer, np.floating)):
            prediction = prediction.item()

        logging.info("Prediction Result: %s", prediction)
        return jsonify({"predicted_severity": prediction, "road_safety_score": road_safety})

    except Exception as e:
        logging.error("Error during prediction: %s", str(e))
        return jsonify({"error": str(e)}), 400

@app.route("/", methods=["GET"])
def home():
    return "Flask API is running. Use /predict for predictions."

if __name__ == "__main__":
    app.run(port=5000, debug=True)
