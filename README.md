# Crashlytics

Crashlytics is a platform designed to harness the power of machine learning and data analytics to make roads safer. It provides real-time predictions of accident severity and road safety scores using a comprehensive dataset of accident records.

## Features

- Real-time accident severity prediction
- Road safety score calculation
- Interactive map displaying accident locations
- Filter and search accident data
- Responsive web interface

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.x
- Flask
- Joblib
- Pandas
- Scikit-learn

### Installation

1. Install server dependencies:
    ```sh
    npm install
    ```

2. Install Python dependencies:
    ```sh
    pip install -r package.json
    ```

### Running the Application

1. Start the Flask API server:
    ```sh
    python api.py
    ```

2. Start the Node.js server:
    ```sh
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- `data`: Directory containing accident data files. (Because of the size limit we couldn't not load the main data and some of the jsons)
- `public/script.js`: Client-side JavaScript for handling UI interactions.
- `views/index.ejs`: EJS template for the main page.
- `api.py`: Flask API for handling prediction requests.
- `data_processor.py`: Python script for processing and merging accident data.
- `model_trainer.py`: Python script for training the machine learning model.
- `road_safety_trainer.py`: Python script for training the road safety model.
- `predictor.py`: Python script for loading the trained model and making predictions.
- `server.js`: Main server file for handling routes and middleware.
- `location.py`: Python script for combining accident data with location information.
- `geojson_converter.py`: Python script for converting accident data to GeoJSON format.
- `filter_interval.py`: Python script for filtering accident data by date range.


## Usage

### Predicting Accident Severity

1. Fill in the prediction form on the main page with the required details.
2. Click the "Predict" button to get the predicted severity and road safety score.

### Filtering Accident Data

1. Use the filter form on the main page to specify your search criteria.
2. Click the "Apply Filters" button to view the filtered accident data.

### Viewing Accident Locations

1. Navigate to the map section on the main page.
2. The map will display accident locations with markers color-coded by severity.

## Contact

For any questions or inquiries, please contact 
[yusufcandir30@gmail.com,seymanurdmrkprn@gmail.com]
