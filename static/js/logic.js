var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesdata = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
});


function createFeatures(earthquakeData) {
//Pop-up box
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p> Magnitude: " + feature.properties.mag + "</p>" +
        "<p> Depth: " + feature.geometry.coordinates[2] + " km</p>" +
        "<p>" + new Date(feature.properties.time) + "</p>"
        );
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer : function(feature, latlng) {
            return L.circleMarker(latlng);
    },
    style: styleInfo
    });

    createMap(earthquakes);
    }


function createMap(earthquakes) {

    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "satellite-streets-v11",
        accessToken: API_KEY
    });

    var greyscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Satellite": satellitemap,
        "Greyscale": greyscalemap,
        "Dark Map": darkmap
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [greyscalemap, earthquakes]
    });

    var colors = ['#95F9C3', '#69BCA5', '#519A95', '#245B77', '#0B3866', '#0B3866'];

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            depths = [-10,10,50,100,150],
            labels = [];

        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + colors[i] + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + " km"+ '<br>' : '+ km');
        }
        return div;
    };
    legend.addTo(myMap);

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

//Styling marker
function styleInfo(feature) {
    return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColor(feature.geometry.coordinates[2]),
    stroke: true,
    weight: 0.5,
    radius: getRadius(feature.properties.mag)
}};


//Color gradient
    function getColor(depth) {
    return depth > 150 ? '#95F9C3' :
            depth > 100  ? '#69BCA5' :
            depth > 50  ? '#519A95' :
            depth > 10  ? '#245B77' :
            depth > -10   ? '#0B3866' :
            '#0B3866';
}

    function getRadius(magnitude) {
        if (magnitude === 0) {
        return 1;
    }
        return magnitude * 5
    }