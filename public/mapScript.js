


var map = L.map('map').setView([31.6295, -7.9811], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var lastClickedLayer;
var routeLayers = {};
// In your mapScript.js or embedded <script> tag
function updateSimulationLinkState() 
{
    // Dynamically create the URL with the query string
    const simulationUrl = `sim.html`;
    // Redirect the browser to the simulation URL
    window.location.href = simulationUrl;
    
}

// Function to generate random data for each route ID, with a flag to fill or empty the data array
function generateDataForRoutes(fillData) {
    const sidebarItems = document.querySelectorAll('.route-item');
    const routesData = Array.from(sidebarItems).map(item => {
        const id = item.textContent.replace('Route ID: ', '');
        const data = fillData ? Array.from({ length: 100 }, () => 5 * (Math.floor(Math.random() * 11) + 1)) : [];
        return {
            id: id,
            Data: data
        };
    });

    return routesData;
}

// Function to trigger download of the generated data as a JSON file
function downloadGeneratedData(fillData = true) {
    const data = generateDataForRoutes(fillData);
    if (data.length === 0) {
        alert("No route data available to download.");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "routesData.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function onEachFeature(feature, layer) {
    if (feature.geometry.type === 'LineString' && feature.properties && feature.properties.id) {
        layer.bindPopup('Route ID: ' + feature.properties.id);

        layer.on('click', function() {
            highlightRoute(feature.properties.id, true);
        });

        // Store reference to each route layer by its ID
        routeLayers[feature.properties.id] = layer;
    }
}

function loadGeoJson() {
    fetch('/geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    if(feature.geometry.type === 'LineString')
                    {
                        return {color: '#999'};
                    }else
                    {
                        return {color: '#3388ff'};
                    }
                },
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng) {
                    return L.featureGroup();
                } 
            }).addTo(map);
        })
        .catch(err => console.error('Error loading the GeoJSON data:', err));
}

function addToSidebar(id) {
    const sidebar = document.getElementById('sidebar');
    let itemExists = document.getElementById('route-item-' + id);
    if (!itemExists) {
        const item = document.createElement('div');
        item.id = 'route-item-' + id;
        item.className = 'route-item';
        item.innerHTML = `<span>Route ID: ${id}</span>`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.onclick = function(event) {
            event.stopPropagation(); // Prevent triggering the parent div's click event
            
            // Color the route with '#999' before deletion
            if (routeLayers[id]) {
                routeLayers[id].setStyle({ color: '#999' });
                setTimeout(() => {
                    //map.removeLayer(routeLayers[id]);
                    delete routeLayers[id]; // Remove reference from the object
                }, 300); // Delay to visually indicate the route's color change before removal
            }
            
            sidebar.removeChild(item);
        };
        item.appendChild(deleteButton);
        item.onclick = function() { highlightRoute(id); };
        sidebar.insertBefore(item, sidebar.firstChild); // Insert at the top of the sidebar
    }
}

function highlightRoute(id, deferDisplay = false) {
    if (lastClickedLayer) {
        lastClickedLayer.setStyle({ color: 'black' });
    }
    var layer = routeLayers[id];
    if (layer) {
        layer.setStyle({ color: 'red' });
        layer.openPopup();
        lastClickedLayer = layer;
    }
    addToSidebar(id, deferDisplay); // Add to sidebar if not already present
}
// Initial call to set the correct state when the page loads

loadGeoJson();


