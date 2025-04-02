const fs = require('fs');
const path = require('path');

// cities.json dosyasının yolunu al
const citiesFilePath = path.join(__dirname, 'cities.json');

// cities.json dosyasını oku ve dönüştür
fs.readFile(citiesFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading cities.json:", err);
        return;
    }

    try {
        // JSON verisini parse et
        const citiesData = JSON.parse(data);
        
        // Dönüştürülmüş veriyi hazırlamak
        const transformedCitiesData = {};

        citiesData.forEach(item => {
            transformedCitiesData[item.id] = { city: item.city };
        });

        // Dönüştürülmüş veriyi konsola yazdır
        console.log(transformedCitiesData);
        
        // Eğer dönüştürülmüş veriyi dosyaya kaydetmek isterseniz:
        fs.writeFileSync(path.join(__dirname, 'transformed_cities.json'), JSON.stringify(transformedCitiesData, null, 2));
        console.log("Transformed cities data saved to transformed_cities.json");

    } catch (err) {
        console.error("Error parsing cities.json:", err);
    }
});
