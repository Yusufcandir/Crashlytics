import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static("public"));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(cors());

// Helper function to read JSON files
const readJSON = (filename) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, "data", filename);

        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } else {
            console.error(`File not found: ${filePath}`);
            return [];
        }
    } catch (error) {
        console.error(`Error reading file: ${filename}`, error);
        return [];
    }
};

// Cache JSON data at server startup
let cachedData = {};

// Load all data into cache
const loadAllData = () => {
    const files = [
        "rows_data.json", "severity.json", "cities.json", "counties.json",
        "states.json", "time_zones.json", "crossings.json", "humidity.json",
        "junctions.json", "sunrise_sunsets.json", "temperatures.json",
        "traffic_signals.json", "visibility.json", "weather_conditions.json",
        "weather_timestamps.json", "accidents.geojson"
    ];
    files.forEach(file => {
        cachedData[file] = readJSON(file);
    });
};

// Load data at startup
loadAllData();

// Helper functions
const sanitizeData = (data, defaultValue = "N/A", maxLength = 255) => {
    if (data === null || data === undefined) return defaultValue;
    if (typeof data === "string") return data.length <= maxLength ? data.trim() : defaultValue;
    if (typeof data === "number") return isNaN(data) ? defaultValue : data;
    return defaultValue;
};

const paginateData = (data, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / limit);

    return { paginatedData, totalPages };
};

const filterData = (data, filters) => {
    return data.filter(row => {
        for (const key in filters) {
            const value = filters[key]?.toString().toLowerCase();
            if (value) {
                if (key === 'severity') {
                    // Exact match for severity
                    if (row[key]?.toString() !== value) return false;
                } else if (key === 'city') {
                    // Partial match for city
                    if (!row.city?.toLowerCase().includes(value)) return false;
                } else {
                    // Exact match for other fields
                    if (row[key]?.toString().toLowerCase() !== value) return false;
                }
            }
        }
        return true;
    });
};

app.get("/", (req, res) => {
    const filters = {
        severity: req.query.severity || "",
        city: req.query.city || "",
        county: req.query.county || "",
        state: req.query.state || "",
        weather_condition: req.query.weather_condition || "",
        visibility: req.query.visibility || "",
        temperature: req.query.temperature || "",
    
    };

    const rowsData = cachedData["rows_data.json"]; // Fetch raw data
    const enrichedData = rowsData.map(row => ({
        id: row.id,
        severity: sanitizeData(cachedData["severity.json"][row.severity_id]?.number),
        city: sanitizeData(cachedData["cities.json"][row.city_id]?.city),
        county: sanitizeData(cachedData["counties.json"][row.county_id]?.county),
        state: sanitizeData(cachedData["states.json"][row.state_id]?.state),
        time_zone: sanitizeData(cachedData["time_zones.json"][row.time_zone_id]?.time_zone),
        temperature: sanitizeData(cachedData["temperatures.json"][row.temperature_id]?.temperature),
        visibility: sanitizeData(cachedData["visibility.json"][row.visibility_id]?.visibility),
        weather_condition: sanitizeData(cachedData["weather_conditions.json"][row.weather_condition_id]?.weather_condition),
        crossing: sanitizeData(cachedData["crossings.json"][row.crossing_id]?.crossing),
        traffic_signal: sanitizeData(cachedData["traffic_signals.json"][row.traffic_signal_id]?.traffic_signal),
        weather_timestamp: sanitizeData(cachedData["weather_timestamps.json"][row.weather_timestamp_id]?.weather_timestamp),
        humidity: sanitizeData(cachedData["humidity.json"][row.humidity_id]?.humidity),
        junction: sanitizeData(cachedData["junctions.json"][row.junction_id]?.junction),
        sunrise_sunset: sanitizeData(cachedData["sunrise_sunsets.json"][row.sunrise_sunset_id]?.sunrise_sunset),
    }));

    // Apply filters
    const filteredData = filterData(enrichedData, filters);

    // Paginate data for the first page load
    const page = 1;
    const limit = 50; // Show 50 rows by default
    const { paginatedData, totalPages } = paginateData(filteredData, page, limit);

    res.render("index", {
        filters,
        data: paginatedData, // Pass filtered and paginated data to the template
        totalPages,
        page
    });
});



app.post("/api/predict", async (req, res) => {
    try {
        const inputData = req.body;

        // Validate input data
        if (!inputData) {
            return res.status(400).json({ error: "No input data provided" });
        }

        // Send data to Flask API
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputData),
        });

        const data = await response.json();

        if (response.ok) {
            res.json({
                predicted_severity: data.predicted_severity,
                road_safety_score: data.road_safety_score,
            });
        } else {
            console.error("Flask API error:", data.error);
            res.status(500).json({ error: data.error || "Flask API error" });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error while predicting severity" });
    }
});




// API: Get enriched and paginated accident data
app.get("/api/accidents", (req, res) => {
    const { page = 1, limit = 50, ...filters } = req.query; 

    const rowsData = cachedData["rows_data.json"];
    const enrichedData = rowsData.map(row => ({
        id: row.id,
        severity: sanitizeData(cachedData["severity.json"][row.severity_id]?.number),
        city: sanitizeData(cachedData["cities.json"][row.city_id]?.city),
        county: sanitizeData(cachedData["counties.json"][row.county_id]?.county),
        state: sanitizeData(cachedData["states.json"][row.state_id]?.state),
        time_zone: sanitizeData(cachedData["time_zones.json"][row.time_zone_id]?.time_zone),
        temperature: sanitizeData(cachedData["temperatures.json"][row.temperature_id]?.temperature),
        visibility: sanitizeData(cachedData["visibility.json"][row.visibility_id]?.visibility),
        weather_condition: sanitizeData(cachedData["weather_conditions.json"][row.weather_condition_id]?.weather_condition),
        crossing: sanitizeData(cachedData["crossings.json"][row.crossing_id]?.crossing),
        traffic_signal: sanitizeData(cachedData["traffic_signals.json"][row.traffic_signal_id]?.traffic_signal),
        weather_timestamp: sanitizeData(cachedData["weather_timestamps.json"][row.weather_timestamp_id]?.weather_timestamp),
        humidity: sanitizeData(cachedData["humidity.json"][row.humidity_id]?.humidity),
        junction: sanitizeData(cachedData["junctions.json"][row.junction_id]?.junction),
        sunrise_sunset: sanitizeData(cachedData["sunrise_sunsets.json"][row.sunrise_sunset_id]?.sunrise_sunset),
    }));

    app.get("/api/geojson", (req, res) => {
        const geoJsonPath = path.join(__dirname, "data", "accidents.geojson");
        const limit = parseInt(req.query.limit) || 10000; 
    
        if (fs.existsSync(geoJsonPath)) {
            const geoJsonData = JSON.parse(fs.readFileSync(geoJsonPath, "utf-8"));
            
            // Limit the number of markers sent
            const limitedFeatures = geoJsonData.features.slice(0, limit);
    
            res.json({
                type: "FeatureCollection",
                features: limitedFeatures,
            });
        } else {
            res.status(404).json({ error: "GeoJSON data not found." });
        }
    });
    
    



    const filteredData = filterData(enrichedData, filters);

    const { paginatedData, totalPages } = paginateData(filteredData, parseInt(page), parseInt(limit));

    res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredData.length,
        totalPages,
        data: paginatedData,
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
