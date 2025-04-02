import pandas as pd
import json

# File paths
csv_file = "data/filtered_data.csv"         
rows_data_file = "data/rows_data.json"       
severity_file = "data/severity.json"        
output_file = "combined_accident_data.json"  # Output file

# Step 1: Load CSV data
print("Reading CSV file...")
csv_data = pd.read_csv(csv_file)
csv_data.columns = csv_data.columns.str.strip()  

# Select relevant columns
if 'Start_Lat' in csv_data.columns and 'Start_Lng' in csv_data.columns:
    csv_data = csv_data[['Start_Lat', 'Start_Lng']].reset_index(drop=True)
else:
    print("Error: Columns 'Start_Lat' and 'Start_Lng' not found in the CSV file.")
    exit()

# Step 2: Load rows_data.json and severity.json
print("Loading JSON files...")
with open(rows_data_file, 'r') as f:
    rows_data = json.load(f)

with open(severity_file, 'r') as f:
    severity_data = json.load(f)

# Step 3: Combine data by row index
print("Combining data...")
combined_data = []
for idx, row in enumerate(rows_data):  
    if idx < len(csv_data): 
        severity_id = str(row['severity_id'])
        severity = severity_data.get(severity_id, {}).get("number", None)
        
        combined_data.append({
            "id": row['id'],
            "latitude": csv_data.loc[idx, 'Start_Lat'],
            "longitude": csv_data.loc[idx, 'Start_Lng'],
            "severity": severity
        })

# Step 4: Write combined data to JSON
print(f"Processed {len(combined_data)} records.")
with open(output_file, 'w') as f:
    json.dump(combined_data, f, indent=4)

print(f"Combined data saved to '{output_file}'")
