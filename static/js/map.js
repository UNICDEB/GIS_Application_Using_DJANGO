// require([
//     "esri/Map",
//     "esri/views/MapView",
//     "esri/Graphic",
//     "esri/symbols/SimpleMarkerSymbol",
//     "esri/geometry/Extent"
// ], function(Map, MapView, Graphic, SimpleMarkerSymbol, Extent) {

//     // Initialize the map with the default basemap
//     var map = new Map({
//         basemap: "streets-navigation-vector"
//     });

//     // Create a MapView instance (for 2D viewing)
//     var view = new MapView({
//         container: "map",  // Reference to the map container in the HTML
//         map: map,          // Reference to the map object created before the view
//         center: [0, 0],    // Initial center point (longitude, latitude)
//         zoom: 2            // Initial zoom level
//     });

//     // Array to hold multiple markers
//     var markerGraphics = [];
//     var locations = [];

//     // Event listener for the dropdown menu to change the basemap
//     document.getElementById('basemap-selector').addEventListener('change', function() {
//         map.basemap = this.value;
//     });

//     // Function to add a marker
//     window.addMarker = function() {
//         // Get latitude and longitude values from input fields
//         var lat = parseFloat(document.getElementById('latitude').value);
//         var lng = parseFloat(document.getElementById('longitude').value);

//         // Validate the inputs
//         if (isNaN(lat) || isNaN(lng)) {
//             alert("Please enter valid latitude and longitude values.");
//             return;
//         }

//         // Create a point geometry for the marker
//         var point = {
//             type: "point",       // Autocasts as new Point()
//             longitude: lng,
//             latitude: lat
//         };

//         // Create a simple marker symbol for the point
//         var markerSymbol = new SimpleMarkerSymbol({
//             color: [226, 119, 40],   // Orange color
//             outline: {               // White outline
//                 color: [255, 255, 255],
//                 width: 2
//             }
//         });

//         // Create a graphic and add the geometry and symbol to it
//         var markerGraphic = new Graphic({
//             geometry: point,
//             symbol: markerSymbol,
//             popupTemplate: {  // Popup template to show latitude and longitude
//                 title: "Location",
//                 content: "Latitude: " + lat + "<br>Longitude: " + lng
//             }
//         });

//         // Add the graphic (marker) to the map view
//         view.graphics.add(markerGraphic);

//         // Push marker and location to the arrays for later reference
//         markerGraphics.push(markerGraphic);
//         locations.push([lng, lat]);

//         // Adjust the map view to show all markers
//         adjustMapToFitMarkers();
//     };

//     // Function to adjust the map zoom and extent to fit all markers
//     function adjustMapToFitMarkers() {
//         if (locations.length > 1) {
//             // Calculate the extent (bounding box) based on all marker locations
//             var extent = new Extent({
//                 xmin: Math.min(...locations.map(l => l[0])),
//                 ymin: Math.min(...locations.map(l => l[1])),
//                 xmax: Math.max(...locations.map(l => l[0])),
//                 ymax: Math.max(...locations.map(l => l[1])),
//                 spatialReference: { wkid: 4326 }  // WGS 84
//             });

//             // Use the view.goTo() method to zoom and center the map to the extent
//             view.goTo(extent.expand(1.5));  // Expanding the extent slightly for padding
//         } else if (locations.length === 1) {
//             // If there's only one marker, center and zoom on it
//             view.goTo({
//                 center: locations[0],
//                 zoom: 15
//             });
//         }
//     }

//     // Function to clear all markers
//     window.clearMarkers = function() {
//         // Remove all marker graphics from the map
//         view.graphics.removeAll();

//         // Clear the marker and location arrays
//         markerGraphics = [];
//         locations = [];
//     };
// });

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Extent"
], function(Map, MapView, Graphic, SimpleMarkerSymbol, Extent) {

    // Initialize the map with the default basemap
    var map = new Map({
        basemap: "streets-navigation-vector"
    });

    // Create a MapView instance (for 2D viewing)
    var view = new MapView({
        container: "map",  // Reference to the map container in the HTML
        map: map,          // Reference to the map object created before the view
        center: [0 , 0],    // Initial center point (longitude, latitude)
        zoom: 2            // Initial zoom level
    });

    // Array to hold multiple markers and their locations
    var markerGraphics = [];
    var locations = [];

    // OpenWeatherMap API Key (Replace with your actual key)
    var apiKey = '91502d22ace3c1955e82ffa64da42e60';

    // Event listener for the dropdown menu to change the basemap
    document.getElementById('basemap-selector').addEventListener('change', function() {
        map.basemap = this.value;
    });

    // Function to fetch weather data (temperature, humidity, AQI)
    function fetchWeatherData(lat, lng, callback) {
        var weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
        var aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;

        // Fetch current weather data (temperature and humidity)
        fetch(weatherUrl)
            .then(response => response.json())
            .then(weatherData => {
                // Fetch AQI data after weather data
                fetch(aqiUrl)
                    .then(response => response.json())
                    .then(aqiData => {
                        var temperature = weatherData.main.temp;
                        var humidity = weatherData.main.humidity;
                        var aqi = aqiData.list[0].main.aqi;

                        callback({
                            temperature: temperature,
                            humidity: humidity,
                            aqi: aqi
                        });
                    });
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                callback(null);
            });
    }

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

        // Fetch weather data before creating the marker
        fetchWeatherData(lat, lng, function(weather) {
            if (!weather) {
                alert('Could not fetch weather data for this location.');
                return;
            }

            // Create a graphic and add the geometry, symbol, and popup template to it
            var markerGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                popupTemplate: {  // Popup template to show latitude, longitude, and weather data
                    title: "Location Information",
                    content: `
                        <b>Latitude:</b> ${lat}<br>
                        <b>Longitude:</b> ${lng}<br>
                        <b>Temperature:</b> ${weather.temperature} °C<br>
                        <b>Humidity:</b> ${weather.humidity} %<br>
                        <b>AQI Value:</b> ${weather.aqi} (Air Quality Index) <br>
                        <b>AQI:</b> ${getAQIDescription(weather.aqi)}
                    `
                }
            });

            // Add the graphic (marker) to the map view
            view.graphics.add(markerGraphic);

            // Push marker and location to the arrays for later reference
            markerGraphics.push(markerGraphic);
            locations.push([lng, lat]);

            // Adjust the map view to show all markers
            adjustMapToFitMarkers();
        });
    };

    // Function to adjust the map zoom and extent to fit all markers
    function adjustMapToFitMarkers() {
        if (locations.length > 1) {
            // Calculate the extent (bounding box) based on all marker locations
            var extent = new Extent({
                xmin: Math.min(...locations.map(l => l[0])),
                ymin: Math.min(...locations.map(l => l[1])),
                xmax: Math.max(...locations.map(l => l[0])),
                ymax: Math.max(...locations.map(l => l[1])),
                spatialReference: { wkid: 4326 }  // WGS 84
            });

            // Use the view.goTo() method to zoom and center the map to the extent
            view.goTo(extent.expand(1.5));  // Expanding the extent slightly for padding
        } else if (locations.length === 1) {
            // If there's only one marker, center and zoom on it
            view.goTo({
                center: locations[0],
                zoom: 15
            });
        }
    }

    // Function to clear all markers
    window.clearMarkers = function() {
        // Remove all marker graphics from the map
        view.graphics.removeAll();

        // Clear the marker and location arrays
        markerGraphics = [];
        locations = [];
    };

    // Helper function to convert AQI value to a description
    function getAQIDescription(aqi) {
        if (aqi == 1) return "Good";
        if (aqi == 2) return "Fair";
        if (aqi == 3) return "Moderate";
        if (aqi == 4) return "Poor";
        if (aqi == 5) return "Very Poor";
        return "Unknown";
    }
});
