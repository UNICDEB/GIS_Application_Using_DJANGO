require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Extent",
    "esri/geometry/Polygon",
    "esri/symbols/SimpleFillSymbol",
    "esri/layers/GraphicsLayer"
], function(Map, MapView, Graphic, SimpleMarkerSymbol, Extent, Polygon, SimpleFillSymbol, GraphicsLayer) {

    const API_KEY = "91502d22ace3c1955e82ffa64da42e60";  // Replace with your actual API key from OpenWeather or similar

    // Initialize the map with the default basemap
    var map = new Map({
        basemap: "streets-navigation-vector"
    });

    // Create a MapView instance (for 2D viewing)
    var view = new MapView({
        container: "map",  // Reference to the map container in the HTML
        map: map,          // Reference to the map object created before the view
        center: [73.8567, 15.2993],    // Center on Goa
        zoom: 10            // Initial zoom level for Goa
    });

    // Graphics Layer for AQI-based polygons
    var aqiLayer = new GraphicsLayer();
    map.add(aqiLayer);

    // Hardcoded Goa locations
    var goaLocations = [
        {lat: 15.2993, lng: 73.8567, name: 'Panaji'},
        {lat: 15.2719, lng: 73.9860, name: 'Vasco da Gama'},
        {lat: 15.3959, lng: 73.8127, name: 'Mapusa'},
        {lat: 15.5520, lng: 73.7512, name: 'Pernem'},
        {lat: 15.5015, lng: 73.8241, name: 'Bicholim'},
        {lat: 15.4137, lng: 74.0080, name: 'Ponda'},
        {lat: 15.4927, lng: 73.8234, name: 'Margao'}
    ];

    // Array to hold user-added markers and their locations
    var userMarkerGraphics = [];
    var userLocations = [];

    // Array to hold the hardcoded Goa markers
    var hardcodedMarkers = [];

    // Event listener for the dropdown menu to change the basemap
    document.getElementById('basemap-selector').addEventListener('change', function() {
        map.basemap = this.value;
    });

    // Function to fetch weather and AQI data
    async function fetchWeatherAQI(lat, lng) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`);
        const data = await response.json();
        return {
            temp: data.main.temp - 273.15, // Convert from Kelvin to Celsius
            humidity: data.main.humidity,
            aqi: Math.floor(Math.random() * 500) // Placeholder: replace with actual AQI API call
        };
    }

    // Function to add a hardcoded marker
    async function addHardcodedMarker(lat, lng, name) {
        const weatherData = await fetchWeatherAQI(lat, lng);
        var point = {
            type: "point",
            longitude: lng,
            latitude: lat
        };

        var markerSymbol = new SimpleMarkerSymbol({
            color: [0, 0, 255],  // Blue for hardcoded markers
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        });

        var markerGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
            popupTemplate: {
                title: name,
                content: `
                    <b>Temperature:</b> ${weatherData.temp.toFixed(1)} °C<br/>
                    <b>Humidity:</b> ${weatherData.humidity} %<br/>
                    <b>AQI:</b> ${weatherData.aqi}
                `
            }
        });

        view.graphics.add(markerGraphic);
        hardcodedMarkers.push(markerGraphic);

        // Add color-coded AQI shading
        addAqiShading(lat, lng, weatherData.aqi);
    }

    // Add all hardcoded Goa locations
    goaLocations.forEach(function(location) {
        addHardcodedMarker(location.lat, location.lng, location.name);
    });

    // Function to add color shading based on AQI value
    function addAqiShading(lat, lng, aqi) {
        var aqiColor;
        if (aqi < 50) {
            aqiColor = [0, 255, 0, 0.4];  // Green for low AQI
        } else if (aqi < 100) {
            aqiColor = [255, 255, 0, 0.4]; // Yellow for moderate AQI
        } else {
            aqiColor = [255, 0, 0, 0.4];   // Red for high AQI
        }

        var polygon = new Polygon({
            rings: [
                [lng - 0.02, lat - 0.02],
                [lng + 0.02, lat - 0.02],
                [lng + 0.02, lat + 0.02],
                [lng - 0.02, lat + 0.02]
            ]
        });

        var polygonSymbol = new SimpleFillSymbol({
            color: aqiColor,
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        });

        var polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: polygonSymbol
        });

        aqiLayer.add(polygonGraphic);
    }

    // Add user marker and rearrange view
    async function addMarker() {
        var lat = parseFloat(document.getElementById('latitude').value);
        var lng = parseFloat(document.getElementById('longitude').value);

        if (!isNaN(lat) && !isNaN(lng)) {
            const weatherData = await fetchWeatherAQI(lat, lng);
            var point = {
                type: "point",
                longitude: lng,
                latitude: lat
            };

            var markerSymbol = new SimpleMarkerSymbol({
                color: [255, 0, 0],  // Red for user-added markers
                outline: {
                    color: [255, 255, 255],
                    width: 2
                }
            });

            var markerGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                popupTemplate: {
                    title: "User Added Location",
                    content: `
                        <b>Temperature:</b> ${weatherData.temp.toFixed(1)} °C<br/>
                        <b>Humidity:</b> ${weatherData.humidity} %<br/>
                        <b>AQI:</b> ${weatherData.aqi}
                    `
                }
            });

            view.graphics.add(markerGraphic);
            userMarkerGraphics.push(markerGraphic);
            userLocations.push([lng, lat]);

            // Add AQI shading for the user-added marker
            addAqiShading(lat, lng, weatherData.aqi);

            // Rearrange view to show all markers
            rearrangeMapView();
        } else {
            alert("Please enter valid latitude and longitude!");
        }
    }

    // Rearrange map to fit all hardcoded and user-added markers
    function rearrangeMapView() {
        var allLocations = [
            ...goaLocations.map(loc => [loc.lng, loc.lat]),
            ...userLocations
        ];

        if (allLocations.length > 0) {
            var extent = new Extent({
                xmin: Math.min(...allLocations.map(loc => loc[0])),
                ymin: Math.min(...allLocations.map(loc => loc[1])),
                xmax: Math.max(...allLocations.map(loc => loc[0])),
                ymax: Math.max(...allLocations.map(loc => loc[1]))
            });

            view.goTo(extent.expand(1.5));  // Slightly expand the extent to fit all markers nicely
        }
    }

    // Clear all user-added markers
    function clearUserMarkers() {
        userMarkerGraphics.forEach(function(graphic) {
            view.graphics.remove(graphic);
        });
        userMarkerGraphics = [];
        userLocations = [];

        rearrangeMapView();  // Adjust view after clearing user markers
    }

    // Initial rearrangement to fit all Goa locations
    rearrangeMapView();
});
