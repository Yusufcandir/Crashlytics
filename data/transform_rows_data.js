const fs = require('fs');
const path = require('path');

// Dosya yolları
const rowsDataFilePath = path.join(__dirname, 'rows_data.json');
const severityFilePath = path.join(__dirname, 'transformed_severity.json');
const descriptionFilePath = path.join(__dirname, 'transformed_description.json');
const cityFilePath = path.join(__dirname, 'transformed_cities.json');
const countyFilePath = path.join(__dirname, 'transformed_counties.json');
const stateFilePath = path.join(__dirname, 'transformed_states.json');
const timeZoneFilePath = path.join(__dirname, 'transformed_time_zones.json');
const weatherTimestampFilePath = path.join(__dirname, 'transformed_weather_timestamps.json');
const temperatureFilePath = path.join(__dirname, 'transformed_temperatures.json');
const windChillFilePath = path.join(__dirname, 'transformed_wind_chills.json');
const humidityFilePath = path.join(__dirname, 'transformed_humidity.json');
const visibilityFilePath = path.join(__dirname, 'transformed_visibility.json');
const weatherConditionFilePath = path.join(__dirname, 'transformed_weather_conditions.json');
const crossingFilePath = path.join(__dirname, 'transformed_crossings.json');
const junctionFilePath = path.join(__dirname, 'transformed_juncrions.json');
const trafficSignalFilePath = path.join(__dirname, 'transformed_traffic_signals.json');
const sunriseSunsetFilePath = path.join(__dirname, 'transformed_sunrise_sunsets.json');

// Verileri okuma fonksiyonu
const readJSON = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return [];
    }
};

// rows_data.json'ı oku ve dönüştür
fs.readFile(rowsDataFilePath, 'utf8', (err, rowsData) => {
    if (err) {
        console.error("Error reading rows_data.json:", err);
        return;
    }

    try {
        const rowsDataParsed = JSON.parse(rowsData);

        // Diğer tüm dosyaları oku
        const severity = readJSON(severityFilePath);
        const descriptions = readJSON(descriptionFilePath);
        const cities = readJSON(cityFilePath);
        const counties = readJSON(countyFilePath);
        const states = readJSON(stateFilePath);
        const timeZones = readJSON(timeZoneFilePath);
        const weatherTimestamps = readJSON(weatherTimestampFilePath);
        const temperatures = readJSON(temperatureFilePath);
        const windChills = readJSON(windChillFilePath);
        const humidities = readJSON(humidityFilePath);
        const visibility = readJSON(visibilityFilePath);
        const weatherConditions = readJSON(weatherConditionFilePath);
        const crossings = readJSON(crossingFilePath);
        const junctions = readJSON(junctionFilePath);
        const trafficSignals = readJSON(trafficSignalFilePath);
        const sunriseSunsets = readJSON(sunriseSunsetFilePath);

        // Veriyi birleştirme
        const enrichedData = rowsDataParsed.map(row => ({
            id: row.id,
            severity: severity[row.severity_id]?.number || 'N/A',
            description: descriptions[row.description_id]?.description || 'N/A',
            city: cities[row.city_id]?.city || 'N/A',
            county: counties[row.county_id]?.county || 'N/A',
            state: states[row.state_id]?.state || 'N/A',
            time_zone: timeZones[row.time_zone_id]?.time_zone || 'N/A',
            weather_timestamp: weatherTimestamps[row.weather_timestamp_id]?.weather_timestamp || 'N/A',
            temperature: temperatures[row.temperature_id]?.temperature || 'N/A',
            wind_chill: windChills[row.wind_chill_id]?.wind_chill || 'N/A',
            humidity: humidities[row.humidity_id]?.humidity || 'N/A',
            visibility: visibility[row.visibility_id]?.visibility || 'N/A',
            weather_condition: weatherConditions[row.weather_condition_id]?.weather_condition || 'N/A',
            crossing: crossings[row.crossing_id]?.crossing || 'N/A',
            junction: junctions[row.junction_id]?.junction || 'N/A',
            traffic_signal: trafficSignals[row.traffic_signal_id]?.traffic_signal || 'N/A',
            sunrise_sunset: sunriseSunsets[row.sunrise_sunset_id]?.sunrise_sunset || 'N/A'
        }));

        // Dönüştürülmüş veriyi dosyaya kaydet
        fs.writeFileSync(path.join(__dirname, 'transformed_rows_data.json'), JSON.stringify(enrichedData, null, 2));
        console.log('Transformed rows data saved to transformed_rows_data.json');
    } catch (err) {
        console.error("Error processing rows_data.json:", err);
    }
});
