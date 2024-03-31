const express = require('express');
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const { DOMParser } = require('xmldom');
const multer  = require('multer');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;





app.use(bodyParser.json()); 
// Endpoint to save routesData.json
app.post('/save-routes-data', (req, res) => {
    const data = req.body;
    fs.writeFile('routesData.json', JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error("Error writing the file:", err);
            return res.status(500).send("Error writing the file.");
        }
        res.send("File saved successfully.");
    });
});
// Define storage options for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Define the directory where uploaded files will be stored
        const uploadDir = path.join(__dirname, 'public/data');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create a unique filename for the uploaded file
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to convert OSM XML data to GeoJSON
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
// Endpoint to delete routesData.json
app.delete('/delete-routes-data', (req, res) => {
    const filePath = path.join(__dirname, 'routesData.json'); // Adjust the path as needed

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log("File does not exist, no need to delete.");
            return res.status(200).send("File does not exist, no need to delete.");
        }

        // If the file exists, proceed with deletion
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting the file:", unlinkErr);
                return res.status(500).send("Error deleting the file.");
            }
            res.send("File deleted successfully.");
        });
    });
});
app.get('/routesData', (req, res) => {
    
    fs.readFile('routesData.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the routes data file:", err);
            return res.status(500).send("Error reading the routes data file.");
        }

        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            console.error("Error parsing the routes data file:", parseError);
            res.status(500).send("Error parsing the routes data file.");
        }
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
