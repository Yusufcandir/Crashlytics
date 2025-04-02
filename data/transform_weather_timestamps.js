const fs = require('fs');

const inputFile = 'weather_timestamps.json'; // Giriş dosyası
const outputFile = 'transformed_weather_timestamps.json'; // Çıkış dosyası

try {
    // Dosyayı oku
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    // Dönüşüm işlemi
    const transformedData = {};
    data.forEach(item => {
        transformedData[item.id] = {
            weather_timestamp: item.weather_timestamp || "N/A"
        };
    });

    // Sonucu yaz
    fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2));
    console.log(`Dönüşüm başarılı! Çıkış dosyası: ${outputFile}`);
} catch (error) {
    console.error('Hata:', error.message);
}
