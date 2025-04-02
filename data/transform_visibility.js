const fs = require('fs');

const inputFile = 'visibility.json'; // Giriş dosyası
const outputFile = 'transformed_visibility.json'; // Çıkış dosyası

try {
    // Dosyayı oku
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    // Dönüşüm işlemi
    const transformedData = {};
    data.forEach(item => {
        transformedData[item.id] = {
            visibility: item.visibility.trim() !== "" ? item.visibility : "N/A"
        };
    });

    // Sonucu yaz
    fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2));
    console.log(`Dönüşüm başarılı! Çıkış dosyası: ${outputFile}`);
} catch (error) {
    console.error('Hata:', error.message);
}
