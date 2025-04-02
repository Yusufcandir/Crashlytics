import json
import pandas as pd

# Load the CSV file
file_path = "filtered_data.csv"
df = pd.read_csv(file_path)

# Convert 'Start Time' column to datetime format, allowing for fractional seconds
df['Start_Time'] = pd.to_datetime(df['Start_Time'], errors='coerce')

# Filter the data for the years 2019 to 2023
start_date = '2019-01-01'
end_date = '2023-12-31'
mask = (df['Start_Time'] >= start_date) & (df['Start_Time'] <= end_date)
filtered_df = df.loc[mask]

# Save the filtered data to a new CSV file
filtered_df.to_csv("filtered_data.csv", index=False)
