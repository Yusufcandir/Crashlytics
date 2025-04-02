const fs = require('fs');

const inputFile = 'weather_conditions.json'; // Giriş dosyası
const outputFile = 'transformed_weather_conditions.json'; // Çıkış dosyası

try {
    // Dosyayı oku
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    // Dönüşüm işlemi
    const transformedData = {};
    data.forEach(item => {
        transformedData[item.id] = {
            weather_condition: item.weather_condition.trim() !== "" ? item.weather_condition : "N/A"
        };
    });

    // Sonucu yaz
    fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2));
    console.log(`Dönüşüm başarılı! Çıkış dosyası: ${outputFile}`);
} catch (error) {
    console.error('Hata:', error.message);
}

