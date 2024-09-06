require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Extent",
    "esri/geometry/Polygon",
    "esri/symbols/SimpleFillSymbol"
], function(Map, MapView, Graphic, SimpleMarkerSymbol, Extent, Polygon, SimpleFillSymbol) {

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

            // Add the marker graphic to the map view
            view.graphics.add(markerGraphic);

            // Add AQI color layer (circle)
            addAQICircle(lat, lng, weather.aqi);

            // Push marker and location to the arrays for later reference
            markerGraphics.push(markerGraphic);
            locations.push([lng, lat]);

            // Adjust the map view to show all markers
            adjustMapToFitMarkers();
        });
    };

    // Function to add a circular layer to represent AQI coverage
    function addAQICircle(lat, lng, aqi) {
        // Determine color based on AQI value
        var color;
        if (aqi == 1) color = [0, 255, 0, 0.4];  // Green (Good)
        else if (aqi == 2) color = [255, 255, 0, 0.4];  // Yellow (Fair)
        else if (aqi == 3) color = [255, 165, 0, 0.4];  // Orange (Moderate)
        else if (aqi == 4) color = [255, 69, 0, 0.4];   // Red (Poor)
        else color = [139, 0, 0, 0.4];   // Dark Red (Very Poor)

        // Create a circular polygon by defining multiple points along the circumference
        var radius = 0.05;  // Smaller radius for the circle
        var points = [];

        for (var i = 0; i < 360; i += 10) {
            var angle = i * Math.PI / 180;
            var pointLng = lng + (radius * Math.cos(angle));
            var pointLat = lat + (radius * Math.sin(angle));
            points.push([pointLng, pointLat]);
        }

        // Complete the circle by connecting the last point to the first
        points.push(points[0]);

        // Define a polygon geometry with the calculated points (circle)
        var polygon = new Polygon({
            rings: points,
            spatialReference: { wkid: 4326 }
        });

        // Create a simple fill symbol for the circle
        var fillSymbol = new SimpleFillSymbol({
            color: color,
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        });

        // Create a graphic for the polygon (circle) and add it to the map view
        var circleGraphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol
        });

        view.graphics.add(circleGraphic);
    }

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

    // Function to clear all markers and layers
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
