const fs = require('fs');

function extractKeyValuePairs(filePath, keysToExtract) {
    const extractedData = {};

    // Read file content
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');

    // Extract key-value pairs
    lines.forEach(line => {
        keysToExtract.forEach(key => {
            if (line.startsWith(key)) {
                const parts = line.split(':');
                if (parts.length === 2) {
                    extractedData[key] = parts[1].trim();
                }
            }
        });
    });

    return extractedData;
}

function saveToJson(data, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 4), 'utf-8');
}

// Example usage
const filePath = 'input.txt';  // Replace with your actual file
const outputPath = 'output.json';
const keysToExtract = ["Name", "Age", "Email", "Phone"]; // Define keys to extract

const data = extractKeyValuePairs(filePath, keysToExtract);
saveToJson(data, outputPath);

console.log(`Extracted data saved to ${outputPath}`);