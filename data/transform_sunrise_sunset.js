const fs = require('fs');
const path = require('path');

// sunrise_sunsets.json dosyasının yolu
const sunriseSunsetFilePath = path.join(__dirname, 'sunrise_sunsets.json');

// sunrise_sunsets.json dosyasını oku
fs.readFile(sunriseSunsetFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading sunrise_sunsets.json:", err);
        return;
    }

    try {
        const sunriseSunsets = JSON.parse(data);

        // Veriyi dönüştür ve boş alanları "Unknown" ile doldur
        const transformedData = sunriseSunsets.map(item => ({
            id: item.id,
            sunrise_sunset: item.sunrise_sunset.trim() || "Unknown"
        }));

        // Dönüştürülmüş veriyi kaydet
        const outputFilePath = path.join(__dirname, 'transformed_sunrise_sunsets.json');
        fs.writeFile(outputFilePath, JSON.stringify(transformedData, null, 2), (err) => {
            if (err) {
                console.error("Error writing transformed_sunrise_sunsets.json:", err);
                return;
            }
            console.log('Transformed sunrise sunset data saved to transformed_sunrise_sunsets.json');
        });
    } catch (parseError) {
        console.error("Error parsing sunrise_sunsets.json:", parseError);
    }
});
