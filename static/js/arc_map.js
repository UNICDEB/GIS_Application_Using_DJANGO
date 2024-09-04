require([
    "esri/WebScene",
    "esri/views/SceneView",
    "esri/widgets/LineOfSight",
    "esri/widgets/Expand",
    "esri/geometry/Point",
    "esri/Graphic",
    "esri/core/reactiveUtils"
], (WebScene, SceneView, LineOfSight, Expand, Point, Graphic, reactiveUtils) => {

    const scene = new WebScene({
        portalItem: {
            id: "82127fea11d6439abba3318cb93252f7" // Replace with your WebScene ID
        }
    });

    const view = new SceneView({
        map: scene,
        container: "viewDiv"
    });

    const lineOfSight = new LineOfSight({
        view: view,
        container: "losWidget"
    });

    const viewModel = lineOfSight.viewModel;

    reactiveUtils.watch(() => viewModel.observer, () => {
        setIntersectionMarkers();
    });

    viewModel.targets.on("change", (event) => {
        event.added.forEach((target) => {
            setIntersectionMarkers();
            reactiveUtils.watch(() => target.intersectedLocation, () => {
                setIntersectionMarkers();
            });
        });
        event.removed.forEach(() => {
            setIntersectionMarkers();
        });
    });

    const intersectionSymbol = {
        type: "point-3d",
        symbolLayers: [{
            type: "object",
            resource: { primitive: "inverted-cone" },
            material: { color: [255, 100, 100] },
            height: 10,
            depth: 10,
            width: 10,
            anchor: "relative",
            anchorPosition: { x: 0, y: 0, z: -0.7 }
        }]
    };

    function setIntersectionMarkers() {
        view.graphics.removeAll();
        viewModel.targets.forEach((target) => {
            if (target.intersectedLocation) {
                const graphic = new Graphic({
                    symbol: intersectionSymbol,
                    geometry: target.intersectedLocation
                });
                view.graphics.add(graphic);
            }
        });
    }

    window.markLocation = function () {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lon = parseFloat(document.getElementById('longitude').value);

        if (isNaN(lat) || isNaN(lon)) {
            alert("Please enter valid latitude and longitude values.");
            return;
        }

        viewModel.observer = new Point({
            latitude: lat,
            longitude: lon,
            z: 100
        });

        viewModel.targets = [
            createTarget(lat + 0.01, lon),
            createTarget(lat, lon + 0.01),
            createTarget(lat - 0.01, lon),
            createTarget(lat, lon - 0.01)
        ];

        view.goTo({
            center: [lon, lat],
            zoom: 16
        });
    };

    function createTarget(lat, lon, z) {
        return {
            location: new Point({
                latitude: lat,
                longitude: lon,
                z: z || 0
            })
        };
    }

    view.when(() => {
        const expand = new Expand({
            expandTooltip: "Expand line of sight widget",
            view: view,
            content: document.getElementById("losWidget"),
            expanded: true
        });

        view.ui.add(expand, "top-right");
    });
});
