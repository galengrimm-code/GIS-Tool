export function calculatePolygonAreaAcres(latlngs) {
  if (!latlngs || latlngs.length < 3) return 0;

  // Shoelace formula on lat/lng coordinates
  let area = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const j = (i + 1) % latlngs.length;
    const p1 = latlngs[i];
    const p2 = latlngs[j];
    area += p1.lng * p2.lat;
    area -= p2.lng * p1.lat;
  }
  area = Math.abs(area) / 2;

  // Convert to acres (rough approximation for mid-latitudes)
  const centerLat =
    latlngs.reduce((sum, ll) => sum + ll.lat, 0) / latlngs.length;
  const latMiles = 69;
  const lngMiles = 69 * Math.cos((centerLat * Math.PI) / 180);
  const sqMiles = area * latMiles * lngMiles;
  return sqMiles * 640;
}

export function calculateGeoJSONAreaAcres(geojson) {
  if (!geojson || !geojson.features) return 0;

  let totalArea = 0;
  for (const feature of geojson.features) {
    if (!feature.geometry) continue;
    const type = feature.geometry.type;
    if (type === 'Polygon' || type === 'MultiPolygon') {
      const coords =
        type === 'Polygon'
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates;

      for (const polygon of coords) {
        const ring = polygon[0]; // outer ring
        if (!ring || ring.length < 3) continue;

        const latlngs = ring.map((c) => ({ lat: c[1], lng: c[0] }));
        totalArea += calculatePolygonAreaAcres(latlngs);
      }
    }
  }
  return totalArea;
}
