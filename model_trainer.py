import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import pandas as pd
import logging
from data_processor import DataProcessor
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")

def train_and_save_model(data_folder, model_file, backup_file="backup_model.joblib"):
    try:
        # Initialize data processor
        processor = DataProcessor(data_folder)
        
        # Process and merge rows_data.json
        data = processor.merge_data()
        
        # Debug: Print column names for verification
        logging.info("Columns in dataset: %s", data.columns)

        # Ensure severity exists in the dataset and drop ID columns if any remain
        if "severity" not in data.columns:
            raise KeyError("'severity' column is missing in the processed dataset. Cannot proceed with training.")

        # Use severity as the target variable (after mapping)
        X = data.drop(columns=["severity"])  # Features
        y = data["severity"]  # Target variable

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train the model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Evaluate the model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        logging.info(f"Model accuracy on test data: {accuracy:.2f}")
        logging.info("Classification report:\n%s", classification_report(y_test, y_pred))

        # Backup existing model, if any
        if os.path.exists(model_file):
            os.rename(model_file, backup_file)
            logging.info(f"Existing model backed up as '{backup_file}'.")

        # Save the trained model
        joblib.dump(model, model_file)
        logging.info(f"Model trained and saved as '{model_file}'.")

    except Exception as e:
        logging.error(f"Error training model: {e}")
        raise

if __name__ == "__main__":
    data_folder = "data"
    model_file = "accident_model.joblib"
    train_and_save_model(data_folder, model_file)
