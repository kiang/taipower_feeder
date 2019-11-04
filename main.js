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
        mc.clearMarkers();
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
    switch (city) {
        case 'TAIPEI':
            map.setCenter({lat: 25.053699, lng: 121.507837});
            break;
        case 'KAOHSIUNG':
            map.setCenter({lat: 22.643894, lng: 120.317828});
            break;
        case 'NEWTAIPEI':
            map.setCenter({lat: 25.053699, lng: 121.507837});
            break;
        case 'TAICHUNG':
            map.setCenter({lat: 24.167804, lng: 120.658214});
            break;
        case 'TAOYUAN':
            map.setCenter({lat: 24.9656572, lng: 121.222804});
            break;
        case 'TAINAN':
            map.setCenter({lat: 22.996169, lng: 120.201330});
            break;
        case 'CHANGHUA':
            map.setCenter({lat: 24.0755208, lng: 120.5277283});
            break;
        case 'CHIAYI':
            map.setCenter({lat: 23.4790323, lng: 120.4141912});
            break;
        case 'MIAOLI':
            map.setCenter({lat: 24.515109, lng: 120.8022719});
            break;
        case 'PINGTUNG':
            map.setCenter({lat: 22.6664029, lng: 120.446815});
            break;
        case 'YUNLIN':
            map.setCenter({lat: 23.6738625, lng: 120.294164});
            break;
    }
    mc = new MarkerClusterer(map, markers, {imagePath: 'images/m'});
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