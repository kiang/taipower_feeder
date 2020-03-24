var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });
var jsonFiles, filesLength, fileKey = 0;

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
for (var z = 0; z < 20; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}

var stylePool = {
  selected: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 8,
      fill: new ol.style.Fill({
        color: '#ff0000'
      }),
      stroke: new ol.style.Stroke({
        color: '#000',
        width: 3
      })
    })
  }),
  normal: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: '#ffdd57'
      }),
      stroke: new ol.style.Stroke({
        color: '#000',
        width: 1
      })
    })
  })
};
function pointStyleFunction(f) {
  if(f !== currentFeature) {
    return stylePool.normal;
  } else {
    return stylePool.selected;
  }
}
var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.221507, 23.000694]),
  zoom: 14
});

var vectorPoints = new ol.layer.Vector({
  style: pointStyleFunction
});

var baseLayer = new ol.layer.Tile({
    source: new ol.source.WMTS({
        matrixSet: 'EPSG:3857',
        format: 'image/png',
        url: 'https://wmts.nlsc.gov.tw/wmts',
        layer: 'EMAP',
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: true,
        attributions: '<a href="http://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
    }),
    opacity: 0.8
});

var map = new ol.Map({
  layers: [baseLayer, vectorPoints],
  target: 'map',
  view: appView
});

map.addControl(sidebar);
var pointClicked = false;
map.on('singleclick', function(evt) {
  content.innerHTML = '';
  pointClicked = false;
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if(false === pointClicked) {
      var targetHash = '#' + feature.getId();
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      pointClicked = true;
    }
  });
});
$('#selectCity').change(function(e) {
  e.preventDefault();
  var targetHash = '#' + $(this).val() + '_GO';
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
});

var previousFeature = false;
var currentFeature = false;
var currentCity = '';
var cityPool = {};
var cityCenter = {
  'CHANGHUA': [120.541719, 24.074767],
  'CHIAYI': [120.430085, 23.477332],
  'HSINCHU': [120.988528, 24.804498],
  'HUALIEN': [121.606658, 23.999479],
  'KAOHSIUNG': [120.317828, 22.643894],
  'KEELUNG': [121.729295, 25.119679],
  'MIAOLI': [120.831858, 24.509743],
  'NANTOU': [120.873994, 23.860689],
  'NEWTAIPEI': [121.507837, 25.053699],
  'PINGTUNG': [120.501103, 22.674185],
  'TAICHUNG': [120.658214, 24.167804],
  'TAINAN': [120.221507, 23.000694],
  'TAIPEI': [121.507837, 25.053699],
  'TAITUNG': [121.124322, 22.793229],
  'TAOYUAN': [121.215697, 24.951902],
  'YILAN': [121.771097, 24.752504],
  'YUNLIN': [120.324720, 23.689980]
};
var currentFeeder = '';
function showFeeder(feederId) {
  var keys = feederId.split('_');
  if(keys.length === 2) {
    if(keys[1] === 'GO') {
      currentFeeder = '';
    } else {
      currentFeeder = feederId;
    }
    if(currentCity !== keys[0]) {
      currentCity = keys[0];
      if(!cityPool[currentCity]) {
        cityPool[currentCity] = new ol.source.Vector({
          format: new ol.format.KML({
            featureProjection: appView.getProjection(),
            extractStyles: false
          }),
          url: 'kml/' + currentCity + '.kml'
        });
      }
      vectorPoints.setSource(cityPool[currentCity]);
      appView.setCenter(ol.proj.fromLonLat(cityCenter[currentCity]));
    } else {
      selectFeeder(feederId);
    }
  }
}

var selectFeeder = function(feederId) {
  var vSource = vectorPoints.getSource();
  if(null !== vSource) {
    var features = vectorPoints.getSource().getFeatures();
    for(k in features) {
      if(features[k].getId() === feederId) {
        var p = features[k].getProperties();
        currentFeature = features[k];
        features[k].setStyle(pointStyleFunction(features[k]));
        if(false !== previousFeature) {
          previousFeature.setStyle(pointStyleFunction(previousFeature));
        }
        previousFeature = currentFeature;
        var message = '<table class="table table-dark">';
        message += '<tbody>';
        message += '<tr><th scope="row">Feeder Name</th><td>' + p.name + '</td></tr>';
        message += '</tbody></table>';
        sidebarTitle.innerHTML = p.name;
        content.innerHTML = message;
        sidebar.open('home');
      }
    }
  }
}

var geolocation = new ol.Geolocation({
  projection: appView.getProjection()
});

geolocation.setTracking(true);

geolocation.on('error', function(error) {
  console.log(error.message);
});

var positionFeature = new ol.Feature();

positionFeature.setStyle(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: '#3399CC'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    })
  })
}));

var firstPosDone = false;
geolocation.on('change:position', function() {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
  if(false === firstPosDone) {
    appView.setCenter(coordinates);
    firstPosDone = true;
  }
});

new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [positionFeature]
  })
});

$('#btn-geolocation').click(function () {
  var coordinates = geolocation.getPosition();
  if(coordinates) {
    appView.setCenter(coordinates);
  } else {
    alert('目前使用的設備無法提供地理資訊');
  }
  return false;
});

routie(':feederId', showFeeder);
if(currentCity === '') {
  sidebar.open('settings');
}