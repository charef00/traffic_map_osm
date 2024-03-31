var ourRoutes;
var currentIndex = 0;
function loadRoutesData() {
    fetch('routesData') // Adjust URL as necessary
        .then(response => response.json())
        .then(data => {
            ourRoutes = data;
        })
        .catch(err => console.error('Error loading routes data:', err));
}
loadRoutesData();

function getSpeed(id, i) {
    // Find the route by ID
    const route = ourRoutes.find(route => route.id === id);

    // If the route doesn't exist, return -1
    if (!route) return -1;

    // Check if i is within the bounds of the Data array; if not, reset i to 0
    if (i >= route.Data.length) i = 0;

    // Return the data value at index i
    return route.Data[i];
}


var map = L.map('map').setView([31.6295, -7.9811], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variable to store the GeoJSON layer for easy removal and re-addition
var geoJsonLayer;

// Function to load GeoJSON data from the server and draw it on the map
function loadAndDrawRoutes() {
    fetch('/geojson')
        .then(response => response.json())
        .then(geoJsonData => {
            // Remove previous GeoJSON layer if it exists
            if (geoJsonLayer) {
                map.removeLayer(geoJsonLayer);
            }

            geoJsonLayer = L.geoJSON(geoJsonData, {
                style: function(feature) {
                    const speed = getSpeed(feature.properties.id+"x", currentIndex);
                    console.log(feature.properties.id);
                    // Only draw routes with valid speed; getColorForSpeed should handle -1 speed
                    return speed !== -1 ? { color: getColorForSpeed(speed) } : false;
                },
                filter: function(feature) {
                    // Extract numeric part of the ID
                    const featureIdNumeric = feature.properties.id.match(/\d+/g) ? feature.properties.id.match(/\d+/g)[0] : null;
                    // Check if this numeric ID is included in ourRoutes by comparing numeric parts
                    return ourRoutes.some(route => {
                        const routeIdNumeric = route.id.match(/\d+/g) ? route.id.match(/\d+/g)[0] : null;
                        return featureIdNumeric === routeIdNumeric && getSpeed(route.id, currentIndex) !== -1;
                    });
                },
                onEachFeature: function(feature, layer) {
                    if(feature.properties && feature.properties.name) {
                        layer.bindPopup(feature.properties.name);
                    }
                }
            }).addTo(map);
        })
        .catch(err => console.error('Error loading the GeoJSON data:', err));
}

// Utility function to generate random color
function getRandomColor() {
    var clrs=["#b30000","#ff6666","#ffff4d","#5cd65c"];
    return clrs[Math.floor(Math.random() * 4)];
}
function getColorForSpeed(speed) {
    if (speed === -1) return '#999'; // Default or error color
    else if (speed <= 10) return '#b30000';
    else if (speed <= 20) return '#ff6666';
    else if (speed <= 40) return '#ffff4d';
    else return '#5cd65c';
}

// Call the function to load and draw routes as soon as the script runs
loadAndDrawRoutes();

// Update routes with random colors every 500 milliseconds
setInterval(() => {
    currentIndex++;
    if(currentIndex>99)
    {
        currentIndex=0;
    }
    loadAndDrawRoutes(); // Re-draw routes with the next speed value
}, 5000); // Adjust the interval as needed

