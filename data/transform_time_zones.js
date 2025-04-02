const fs = require('fs');
const path = require('path');

// time_zones.json dosyasının yolu
const timeZonesFilePath = path.join(__dirname, 'time_zones.json');

// time_zones.json dosyasını oku
fs.readFile(timeZonesFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading time_zones.json:", err);
        return;
    }

    try {
        const timeZones = JSON.parse(data);

        // Veriyi dönüştür
        const transformedData = {};
        timeZones.forEach(item => {
            transformedData[item.id] = {
                time_zone: item.time_zone.trim() || "N/A"
            };
        });

        // Dönüştürülmüş veriyi kaydet
        const outputFilePath = path.join(__dirname, 'transformed_time_zones.json');
        fs.writeFile(outputFilePath, JSON.stringify(transformedData, null, 2), (err) => {
            if (err) {
                console.error("Error writing transformed_time_zones.json:", err);
                return;
            }
            console.log('Transformed time zones data saved to transformed_time_zones.json');
        });
    } catch (parseError) {
        console.error("Error parsing time_zones.json:", parseError);
    }
});
