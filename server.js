const express = require('express');
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const { DOMParser } = require('xmldom');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/geojson', (req, res) => {
    fs.readFile('m.osm', 'utf8', (err, xmlData) => {
        if (err) {
            console.error("Error reading the OSM file:", err);
            res.status(500).send("Error reading the OSM file.");
            return;
        }

        const xmlDoc = new DOMParser().parseFromString(xmlData, "application/xml");
        const geoJson = osmtogeojson(xmlDoc);
        res.json(geoJson);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
