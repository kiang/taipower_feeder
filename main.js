var area, map, feederData, infowindow;

$('#map-canvas').height(window.outerHeight / 2.2);

map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: {lat: 25.053699, lng: 121.507837}
});

infowindow = new google.maps.InfoWindow();

$.getJSON('result.json', function (data) {
    feederData = data;
    var markers = [];
    for (city in feederData) {
        for (p in feederData[city]) {
            var marker = new google.maps.Marker({
                position: {
                    lat: feederData[city][p].lat,
                    lng: feederData[city][p].lng
                }
            });
            marker.data = feederData[city][p].feeders;
            marker.addListener('click', function () {
                var info = '';
                for (k in this.data) {
                    info += k + ':' + this.data[k] + '<br />';
                }
                infowindow.setContent(info);
                infowindow.open(map, this);
            });
            markers.push(marker);
        }
    }
    var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'http://googlemaps.github.io/js-marker-clusterer/images/m'});
});