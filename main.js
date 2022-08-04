/**
 * Elements that make up the popup.
 */
var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

var wmsSource = new ol.source.TileWMS({
  url: "https://wahazards.com/geoserver/MIHazard/wms",
  params: { LAYERS: "MIHazard:offmap_english_3857", TILED: true },
  serverType: "geoserver",
  crossOrigin: "anonymous",
});

var wmsLayer = new ol.layer.Tile({
  source: wmsSource,
});

var view = new ol.View({
  center: [8224874.424091285, 2095170.0987497186],
  zoom: 12,
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    wmsLayer,
  ],
  overlays: [overlay],
  target: "map",
  view: view,
});

map.on("singleclick", function (evt) {
  var coordinate = evt.coordinate;
  document.getElementById("info").innerHTML = "";
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = wmsSource.getGetFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    "EPSG:3857",
    { INFO_FORMAT: "application/json" }
  );
  if (url) {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        feat = data.features[0];
        //
        string = `
        <table class="table table-bordered">
        <tbody>
      
        `;

        allcolums = Object.keys(feat.properties);
        for (i = 0; i < allcolums.length; i++) {
          string += `
            <tr>
        <td>${allcolums[i]}</td>
        <td>${feat.properties[allcolums[i]]}</td>
      </tr>
            `;
        }
        string += " </tbody></table>";
        document.getElementById("info").innerHTML = string;
        overlay.setPosition(coordinate);
      });

    //   '<iframe seamless src="' + url + '"></iframe>';
  }
});
