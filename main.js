var area, map, infowindow, feederData, mc;
var markers = [], feederMarkers = [];

$('#map-canvas').height(window.outerHeight / 2.2);

map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: {lat: 25.053699, lng: 121.507837}
});

infowindow = new google.maps.InfoWindow();

$.getJSON('result.json', function (data) {
    feederData = data;
    var block = $('.cityButtons');
    for (city in feederData) {
        block.append('<a href="#" onclick="showCity(\'' + city + '\'); return false;" class="btn btn-default">' + city + '</a>');
    }
});

function showCity(city) {
    if (mc) {
        mc.resetViewport();
    }
    markers = [];
    for (p in feederData[city]) {
        if (feederData[city][p].lat > 25.4 || feederData[city][p].lat < 21.9 || feederData[city][p].lng > 122.2 || feederData[city][p].lng < 119.4) {
            continue;
        }
        var marker = new google.maps.Marker({
            position: {
                lat: feederData[city][p].lat,
                lng: feederData[city][p].lng
            },
            icon: pinSymbol('#FF0000')
        });
        marker.data = feederData[city][p].feeders;
        marker.addListener('click', function () {
            var info = '';
            for (k in this.data) {
                info += '<a href="#" onclick="showFeeder(\'' + k + '\'); return false;">'
                info += k + '</a>:' + this.data[k] + '<br />';
            }
            infowindow.setContent(info);
            infowindow.open(map, this);
        });
        markers.push(marker);
    }
    mc = new MarkerClusterer(map, markers, {imagePath: 'http://googlemaps.github.io/js-marker-clusterer/images/m'});
}

function showFeeder(feeder) {
    for (k in feederMarkers) {
        feederMarkers[k].setMap(null);
    }
    feederMarkers = [];
    var bounds = new google.maps.LatLngBounds();
    for (k in markers) {
        if (markers[k].data[feeder]) {
            var p = markers[k].getPosition();
            var marker = new google.maps.Marker({
                position: p,
                icon: pinSymbol('#00FF00')
            });
            marker.data = markers[k].data;
            marker.addListener('click', function () {
                var info = '';
                for (k in this.data) {
                    info += '<a href="#" onclick="showFeeder(\'' + k + '\'); return false;">'
                    info += k + '</a>:' + this.data[k] + '<br />';
                }
                infowindow.setContent(info);
                infowindow.open(map, this);
            });
            marker.setMap(map);
            feederMarkers.push(marker);
            bounds.extend(p);
        }
    }
    map.fitBounds(bounds);
}

function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1,
    };
}