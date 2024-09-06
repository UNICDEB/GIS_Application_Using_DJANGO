require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol"
], function(Map, MapView, Graphic, SimpleMarkerSymbol) {

    // Initialize the map with the default basemap
    var map = new Map({
        basemap: "streets-navigation-vector"
    });

    // Create a MapView instance (for 2D viewing)
    var view = new MapView({
        container: "map",  // Reference to the map container in the HTML
        map: map,          // Reference to the map object created before the view
        center: [0, 0],    // Initial center point (longitude, latitude)
        zoom: 2            // Initial zoom level
    });

    // Array to hold multiple markers
    var markerGraphics = [];

    // Event listener for the dropdown menu to change the basemap
    document.getElementById('basemap-selector').addEventListener('change', function() {
        map.basemap = this.value;
    });

    // Function to add a marker
    window.addMarker = function() {
        // Get latitude and longitude values from input fields
        var lat = parseFloat(document.getElementById('latitude').value);
        var lng = parseFloat(document.getElementById('longitude').value);

        // Validate the inputs
        if (isNaN(lat) || isNaN(lng)) {
            alert("Please enter valid latitude and longitude values.");
            return;
        }

        // Create a point geometry for the marker
        var point = {
            type: "point",       // Autocasts as new Point()
            longitude: lng,
            latitude: lat
        };

        // Create a simple marker symbol for the point
        var markerSymbol = new SimpleMarkerSymbol({
            color: [226, 119, 40],   // Orange color
            outline: {               // White outline
                color: [255, 255, 255],
                width: 2
            }
        });

        // Create a graphic and add the geometry and symbol to it
        var markerGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
            popupTemplate: {  // Popup template to show latitude and longitude
                title: "Location",
                content: "Latitude: " + lat + "<br>Longitude: " + lng
            }
        });

        // Add the graphic (marker) to the map view
        view.graphics.add(markerGraphic);

        // Push marker to the array for later reference
        markerGraphics.push(markerGraphic);

        // Automatically adjust the map view to focus on the marker
        view.goTo({
            center: [lng, lat],
            zoom: 15
        });
    };

    // Function to clear all markers
    window.clearMarkers = function() {
        // Remove all marker graphics from the map
        view.graphics.removeAll();

        // Clear the marker array
        markerGraphics = [];
    };
});
