const fs = require('fs');
const path = require('path');

// states.json dosyasının yolu
const statesFilePath = path.join(__dirname, 'states.json');

// states.json dosyasını oku
fs.readFile(statesFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading states.json:", err);
        return;
    }

    try {
        const states = JSON.parse(data);

        // Veriyi dönüştür
        const transformedStates = {};
        states.forEach(state => {
            transformedStates[state.id] = state.state;
        });

        // Dönüştürülmüş veriyi kaydet
        const outputFilePath = path.join(__dirname, 'transformed_states.json');
        fs.writeFile(outputFilePath, JSON.stringify(transformedStates, null, 2), (err) => {
            if (err) {
                console.error("Error writing transformed_states.json:", err);
                return;
            }
            console.log('Transformed states data saved to transformed_states.json');
        });
    } catch (parseError) {
        console.error("Error parsing states.json:", parseError);
    }
});
