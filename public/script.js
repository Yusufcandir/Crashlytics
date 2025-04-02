let currentPage = 1; // Tracks the currently active page
const rowsPerPage = 10; // Number of rows to display per page
let totalPages = 1; // Total number of pages for pagination
let filters = {}; // Object to store current filter values
const markersPerPage = 10000; // Maximum number of markers displayed on the map per page
let map; // Reference to the map instance
let mapLayer; // Layer to hold the markers on the map

window.onload = function () {
    fetchAccidentData(currentPage); // Load accident data into the table
    initializeMap(); // Set up the map view
    fetchLimitedGeoJSON(); // Fetch and display a subset of geographical markers
    setupNavbarToggle(); // Set up the mobile menu toggle
};

// Attach an event listener to the prediction form
document.getElementById("prediction-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    const formData = {
        city: document.getElementById("city_input").value.trim(),
        county: document.getElementById("county_input").value.trim(),
        state: document.getElementById("state_input").value.trim(),
        time_zone: document.getElementById("time_zone").value.trim(),
        weather_condition: document.getElementById("weather_condition_input").value.trim(),
        crossing: document.getElementById("crossing").value === "True", // Convert to boolean
        junction: document.getElementById("junction").value === "True", // Convert to boolean
        traffic_signal: document.getElementById("traffic_signal").value === "True", // Convert to boolean
        humidity: parseInt(document.getElementById("humidity").value, 10), // Parse humidity as integer
        temperature: parseFloat(document.getElementById("temperature_input").value), // Parse temperature as float
        visibility: parseFloat(document.getElementById("visibility_input").value), // Parse visibility as float
    };

    try {
        const response = await fetch("/api/predict", {
            method: "POST", // HTTP POST request
            headers: { "Content-Type": "application/json" }, // Specify JSON format
            body: JSON.stringify(formData), // Send the form data
        });

        const result = await response.json();

        if (response.ok && result) {
            document.getElementById("predicted-severity-value").innerText = result.predicted_severity;
            document.getElementById("road-safety-score-value").innerText = result.road_safety_score;
        } else {
            // In case of error, show "N/A"
            document.getElementById("predicted-severity-value").innerText = " ";
            document.getElementById("road-safety-score-value").innerText = " ";
        }
        
    } catch (error) {
        console.error("Prediction error:", error); // Log any errors for debugging
        document.getElementById("prediction-result").innerText = "Prediction failed. Check server logs.";
    }
});

// Handle filter form submission
document.getElementById("filter-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Stop default form submission
    filters = {
        severity: document.getElementById("severity").value, // Selected severity filter
        city: document.querySelector('input[name="city"]').value, // City filter
        county: document.querySelector('input[name="county"]').value, // County filter
        state: document.querySelector('input[name="state"]').value, // State filter
        weather_condition: document.querySelector('input[name="weather_condition"]').value, // Weather filter
        visibility: document.querySelector('input[name="visibility"]').value, // Visibility filter
        temperature: document.querySelector('input[name="temperature"]').value, // Temperature filter
    };
    fetchAccidentData(1); // Reload data with new filters
});

// Fetch accident data from the server with the specified filters and page number
async function fetchAccidentData(pageNumber) {
    try {
        const queryParams = new URLSearchParams({
            page: pageNumber,
            limit: rowsPerPage, // Specify rows per page
            ...filters, // Apply filters
        });

        const response = await fetch(`/api/accidents?${queryParams.toString()}`); // Fetch accident data
        if (!response.ok) {
            alert("An error occurred while fetching data."); // Alert user in case of errors
            return;
        }

        const data = await response.json();
        totalPages = data.totalPages; // Update total page count
        currentPage = pageNumber; // Set current page

        appendTableData(data.data); // Populate table with data
        generatePaginationButtons(); // Update pagination controls
    } catch (error) {
        console.error("Error fetching accident data:", error); // Log any fetching errors
    }
}

// Populate table with accident data
function appendTableData(data) {
    const tableBody = document.getElementById("data-body");
    tableBody.innerHTML = ""; // Clear any existing rows

    if (!data || data.length === 0) {
        // If no data is available, display a placeholder row
        tableBody.innerHTML = `<tr><td colspan="17">No data available</td></tr>`;
        return;
    }

    data.forEach(accident => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${accident.id || "N/A"}</td>
            <td>${accident.severity || "N/A"}</td>
            <td>${accident.city || "N/A"}</td>
            <td>${accident.county || "N/A"}</td>
            <td>${accident.state || "N/A"}</td>
            <td>${accident.time_zone || "N/A"}</td>
            <td>${accident.weather_timestamp || "N/A"}</td>
            <td>${accident.temperature || "N/A"}</td>
            <td>${accident.humidity || "N/A"}</td>
            <td>${accident.visibility || "N/A"}</td>
            <td>${accident.weather_condition || "N/A"}</td>
            <td>${accident.crossing || "N/A"}</td>
            <td>${accident.junction || "N/A"}</td>
            <td>${accident.traffic_signal || "N/A"}</td>
            <td>${accident.sunrise_sunset || "N/A"}</td>
          
        `;
        tableBody.appendChild(row); // Add row to table body
    });
}

// Generate pagination buttons for the table
function generatePaginationButtons() {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear any existing pagination

    // Add "Previous" button
    const prevButton = document.createElement("button");
    prevButton.innerText = "Previous";
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    prevButton.onclick = () => fetchAccidentData(currentPage - 1); // Go to the previous page
    paginationContainer.appendChild(prevButton);

    // Add numbered page buttons
    const maxPagesToShow = 5; // Maximum number of visible buttons
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
        addPageButton(1, paginationContainer); // Add "1" button
        if (startPage > 2) addEllipsis(paginationContainer); // Add ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, paginationContainer, i === currentPage); // Add current page button
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) addEllipsis(paginationContainer); // Add ellipsis
        addPageButton(totalPages, paginationContainer); // Add last page button
    }

    // Add "Next" button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.onclick = () => fetchAccidentData(currentPage + 1); // Go to the next page
    paginationContainer.appendChild(nextButton);
}

// Helper function to add a page button
function addPageButton(page, container, isActive = false) {
    const button = document.createElement("button");
    button.innerText = page;
    button.className = isActive ? "active" : ""; // Highlight current page
    button.onclick = () => fetchAccidentData(page); // Fetch data for the selected page
    container.appendChild(button);
}

// Helper function to add an ellipsis
function addEllipsis(container) {
    const span = document.createElement("span");
    span.innerText = "..."; // Display ellipsis
    span.className = "dots";
    container.appendChild(span);
}

// Initialize the map with default settings
function initializeMap() {
    map = L.map("map").setView([39.8283, -98.5795], 5); // Set map center and zoom level
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, // Maximum zoom level
        attribution: "Map data &copy; OpenStreetMap contributors", // Add attribution
    }).addTo(map);
}

// Fetch and render a limited number of markers on the map
function fetchLimitedGeoJSON() {
    const limit = 10000; // Maximum number of markers to fetch
    fetch(`/api/geojson?limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            console.log(`Fetched ${data.features.length} markers.`); // Log the number of markers fetched
            updateMapMarkers(data); // Add markers to the map
        })
        .catch(error => console.error("Error fetching GeoJSON:", error)); // Handle errors
}

// Update the map markers based on GeoJSON data
function updateMapMarkers(geojson) {
    console.log("Updating markers...");

    // Remove any existing markers from the map
    if (mapLayer) {
        map.removeLayer(mapLayer);
    }

    // Create a new layer with the fetched markers
    mapLayer = L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
            const severity = feature.properties?.severity || "0"; // Default to "0" if severity is undefined
            let color = "gray"; // Default marker color

            // Set marker color based on severity level
            switch (severity) {
                case "1": color = "green"; break;
                case "2": color = "yellow"; break;
                case "3": color = "orange"; break;
                case "4": color = "red"; break;
            }

            return L.circleMarker(latlng, {
                radius: 8, // Marker size
                fillColor: color, // Fill color based on severity
                color: "#000", // Marker border color
                weight: 1, // Border weight
                opacity: 1, // Border opacity
                fillOpacity: 0.8, // Fill opacity
            });
        },
        onEachFeature: (feature, layer) => {
            // Add a popup to each marker
            layer.bindPopup(`
                <b>ID:</b> ${feature.properties?.id || "N/A"}<br>
                <b>Severity:</b> ${feature.properties?.severity || "N/A"}
            `);
        }
    });

    // Add the new marker layer to the map
    map.addLayer(mapLayer);
}

function setupNavbarToggle() {
    const menuToggle = document.getElementById("mobile-menu");
    const navbarMenu = document.querySelector(".navbar__menu");

    if (!menuToggle || !navbarMenu) {
        console.error("Menu toggle veya navbar menu elemanları bulunamadı.");
        return;
    }

    menuToggle.addEventListener("click", () => {
        navbarMenu.classList.toggle("active"); // "active" sınıfını ekler/kaldırır
    });

    // Menü dışına tıklama ile menüyü kapatma
    document.addEventListener("click", (event) => {
        if (!menuToggle.contains(event.target) && !navbarMenu.contains(event.target)) {
            navbarMenu.classList.remove("active");
        }
    });
}
