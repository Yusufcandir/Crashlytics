import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib

# Load dataset
data = pd.read_csv("data/filtered_data.csv")

# Convert timestamp to datetime
data["Weather_Timestamp"] = pd.to_datetime(data["Weather_Timestamp"], errors="coerce")

# Extract day of the week and time of day
data["day_of_week"] = data["Weather_Timestamp"].dt.day_name()
data["hour"] = data["Weather_Timestamp"].dt.hour

def get_time_of_day(hour):
    if 5 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 17:
        return "Afternoon"
    elif 17 <= hour < 21:
        return "Evening"
    else:
        return "Night"

data["time_of_day"] = data["hour"].apply(get_time_of_day)

# Feature engineering
data["is_night"] = data["Sunrise_Sunset"].fillna("day").apply(lambda x: 1 if x.lower() == "night" else 0)
data["is_weekend"] = data["day_of_week"].apply(lambda x: 1 if x in ["Saturday", "Sunday"] else 0)

# Encode categorical features
# Encode Weather_Condition and time_of_day as numeric values
data["Weather_Condition"] = data["Weather_Condition"].astype("category").cat.codes
data["time_of_day"] = data["time_of_day"].astype("category").cat.codes

# Use 'Severity' as a proxy for road_safety_score
data["road_safety_score"] = data["Severity"]  # Proxy target variable

# Define features and target
features = [
    "Visibility(mi)", "Temperature(F)", "Humidity(%)",
    "Weather_Condition", "is_night", "is_weekend"
]
target = "road_safety_score"

# Drop rows with missing values
data = data.dropna(subset=features + [target])

X = data[features]
y = data[target]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a machine learning model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse}")

# Save the trained model
joblib.dump(model, "road_safety_model.joblib")
