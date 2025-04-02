import joblib
import pandas as pd
import numpy as np

class AccidentPredictor:
    def __init__(self, model_file):
        # Load the trained model
        self.model = joblib.load(model_file)
        self.required_features = self.model.feature_names_in_

    def preprocess_input(self, input_data):
        # Convert input data to DataFrame
        input_df = pd.DataFrame([input_data])

        # Ensure all necessary columns are present
        missing_columns = [col for col in self.required_features if col not in input_df.columns]
        for col in missing_columns:
            input_df[col] = 0  # Default values

        # Handle categorical encoding dynamically
        for col in input_df.columns:
            if input_df[col].dtype == "object":  # Handle string columns
                input_df[col] = input_df[col].astype(str).str.lower()  # Normalize strings

        # Reorder the input data to match the model's expected feature order
        input_df = input_df[self.required_features]

        # Ensure numerical data types for compatibility with the model
        input_df = input_df.apply(pd.to_numeric, errors="coerce").fillna(0)

        return input_df

    def predict(self, input_data):
        # Preprocess input data
        input_df = self.preprocess_input(input_data)

        # Predict severity
        prediction = self.model.predict(input_df)
        return int(prediction[0]) 
