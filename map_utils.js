(function () {
  let map = null;
  let geoLayer = null;

  function initMap() {
    if (map) return;

    map = L.map("map", {
      center: [42.0, 12.5],
      zoom: 6,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    geoLayer = L.geoJSON(null).addTo(map);
  }

  function showFeatureOnMap(feature) {
    if (!map || !geoLayer) return;

    geoLayer.clearLayers();

    if (!feature || !feature.geometry) return;

    const layer = L.geoJSON(feature);
    geoLayer.addLayer(layer);

    try {
      const bounds = layer.getBounds();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (e) {
      if (feature.geometry.type === "Point") {
        const coords = feature.geometry.coordinates || [];
        const lng = coords[0];
        const lat = coords[1];
        if (typeof lat === "number" && typeof lng === "number") {
          map.setView([lat, lng], 14);
        }
      }
    }
  }

  // mini-mappe nelle card UR: rcg come outline, UR come poligono colorato
  function createMiniMap(containerId, rcgFeature, urFeature) {
    const el = document.getElementById(containerId);
    if (!el) return;

    // evita doppia init
    if (el._leaflet_id) return;

    const miniMap = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      tap: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(miniMap);

    const layers = [];

    if (rcgFeature && rcgFeature.geometry) {
      const rcgLayer = L.geoJSON(rcgFeature, {
        style: {
          color: "#555555",
          weight: 1,
          fill: false,
          dashArray: "4,2",
        },
      });
      rcgLayer.addTo(miniMap);
      layers.push(rcgLayer);
    }

    if (urFeature && urFeature.geometry) {
      const urLayer = L.geoJSON(urFeature, {
        style: {
          color: "#0d6efd",
          weight: 2,
          fillColor: "#0d6efd",
          fillOpacity: 0.25,
        },
      });
      urLayer.addTo(miniMap);
      layers.push(urLayer);
    }

    if (layers.length) {
      try {
        const group = L.featureGroup(layers);
        const bounds = group.getBounds();
        if (bounds && bounds.isValid()) {
          miniMap.fitBounds(bounds, { padding: [5, 5] });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  window.MapUtils = {
    initMap,
    showFeatureOnMap,
    createMiniMap,
  };
})();
