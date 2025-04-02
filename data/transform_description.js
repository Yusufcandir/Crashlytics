const fs = require('fs');
const path = require('path');

// description.json dosyasının yolunu al
const descriptionFilePath = path.join(__dirname, 'description.json');

// description.json dosyasını oku ve dönüştür
fs.readFile(descriptionFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading description.json:", err);
        return;
    }

    try {
        // JSON verisini parse et
        const descriptionData = JSON.parse(data);
        
        // Dönüştürülmüş veriyi hazırlamak
        const transformedDescriptionData = {};

        descriptionData.forEach(item => {
            transformedDescriptionData[item.id] = { description: item.description };
        });

        // Dönüştürülmüş veriyi konsola yazdır
        console.log(transformedDescriptionData);
        
        // Eğer dönüştürülmüş veriyi dosyaya kaydetmek isterseniz:
        fs.writeFileSync(path.join(__dirname, 'transformed_description.json'), JSON.stringify(transformedDescriptionData, null, 2));
        console.log("Transformed description data saved to transformed_description.json");

    } catch (err) {
        console.error("Error parsing description.json:", err);
    }
});
