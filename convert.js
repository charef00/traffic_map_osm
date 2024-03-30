const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const { DOMParser } = require('xmldom');

function convertOsmToGeoJson(filePath, outputFilePath) {
    fs.readFile(filePath, 'utf8', (err, xmlData) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        // Parse the XML string to an XML Document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "application/xml");

        // Convert to GeoJSON
        const geoJson = osmtogeojson(xmlDoc);

        // Save the GeoJSON to a file
        fs.writeFile(outputFilePath, JSON.stringify(geoJson, null, 2), err => {
            if (err) {
                console.error("Error writing the GeoJSON file:", err);
            } else {
                console.log("GeoJSON file was saved.");
            }
        });
    });
}

// Adjust the file path as necessary
convertOsmToGeoJson('m.osm', 'output.geojson');
