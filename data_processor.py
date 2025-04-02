import os
import json
import pandas as pd

class DataProcessor:
    def __init__(self, data_folder):
        self.data_folder = data_folder

    def load_json(self, file_name):
        """Load a JSON file and return its content."""
        try:
            file_path = os.path.join(self.data_folder, file_name)
            print(f"Loading file: {file_name}")  # Debugging line
            with open(file_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: File '{file_name}' not found. Proceeding without it.")
            return {}
        except json.JSONDecodeError:
            raise ValueError(f"Error: File '{file_name}' is not a valid JSON file.")

    def merge_data(self):
        """Process and merge rows_data.json with other data sources."""
        try:
            # Load rows_data.json (mandatory file)
            rows_data = self.load_json("rows_data.json")
            if not rows_data:
                raise FileNotFoundError("Mandatory file 'rows_data.json' is missing.")

            rows_df = pd.DataFrame(rows_data)

            # Load optional files and prepare mapping dictionaries
            mappings = {}
            optional_files = {
                "severity.json": "severity_id",
                "cities.json": "city_id",
                "crossings.json": "crossing_id",
                "junctions.json": "junction_id",
                "states.json": "state_id",
                "sunrise_sunsets.json": "sunrise_sunset_id",
                "time_zones.json": "time_zone_id",
                "traffic_signals.json": "traffic_signal_id",
                "visibility.json": "visibility_id",
                "counties.json": "county_id",
                "weather_conditions.json": "weather_condition_id",
                "weather_timestamps.json": "weather_timestamp_id",
                "temperatures.json": "temperature_id",
                "visibility.json": "visibility_id",
            }

            for file_name, id_column in optional_files.items():
                content = self.load_json(file_name)
                if content:
                    if isinstance(content, dict):
                        mappings[id_column] = {
                            int(k): v["number"] for k, v in content.items()
                        } if file_name == "severity.json" else {
                            int(k): v for k, v in content.items()
                        }
                    elif isinstance(content, list):
                        try:
                            mappings[id_column] = {
                                item["id"]: item.get("name", item.get("value", item.get("condition", "Unknown")))
                                for item in content
                            }
                        except (KeyError, TypeError):
                            print(f"Warning: Invalid structure in file '{file_name}'. Skipping mapping.")
                    else:
                        print(f"Warning: File '{file_name}' does not contain valid data or is not a supported format.")
                else:
                    print(f"Warning: File '{file_name}' is empty or not found.")

            # Map IDs to actual values
            for id_column, mapping in mappings.items():
                feature_name = id_column.replace("_id", "")  # Remove '_id' suffix for column name
                if id_column in rows_df.columns:
                    rows_df[feature_name] = rows_df[id_column].map(mapping)
                else:
                    print(f"Warning: Column '{id_column}' not found in rows_data.json.")

            # Ensure severity_id exists in the dataset
            if "severity_id" not in rows_df.columns:
                raise KeyError("'severity_id' column is missing in rows_data.json. Cannot proceed with model training.")

            # Drop unnecessary ID columns
            id_columns = list(optional_files.values())
            rows_df.drop(columns=id_columns, inplace=True, errors="ignore")

            # Handle missing data
            rows_df.dropna(inplace=True)

            # Convert dictionary values and mixed types to strings
            for col in rows_df.columns:
                if rows_df[col].apply(lambda x: isinstance(x, dict)).any():
                    print(f"Warning: Column '{col}' contains dict values. Converting to strings.")
                    rows_df[col] = rows_df[col].apply(str)
                elif rows_df[col].apply(lambda x: isinstance(x, list)).any():
                    print(f"Warning: Column '{col}' contains list values. Converting to strings.")
                    rows_df[col] = rows_df[col].apply(str)

            # Label encode categorical columns
            categorical_columns = rows_df.select_dtypes(include=["object"]).columns
            print(f"Encoding categorical columns: {categorical_columns}")

            for col in categorical_columns:
                # Retain top 100 most frequent values for high cardinality columns
                top_categories = rows_df[col].value_counts().nlargest(100).index
                rows_df[col] = rows_df[col].apply(lambda x: x if x in top_categories else "Other")
                rows_df[col] = rows_df[col].astype("category").cat.codes

            return rows_df
        except Exception as e:
            raise RuntimeError(f"Error while processing rows_data.json: {e}")
