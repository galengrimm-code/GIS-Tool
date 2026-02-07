export function normalizeGeoJSON(geojson) {
  if (!geojson) return null;

  if (geojson.type === 'FeatureCollection') {
    return geojson;
  }

  if (geojson.type === 'Feature') {
    return { type: 'FeatureCollection', features: [geojson] };
  }

  // Raw geometry
  if (geojson.type && geojson.coordinates) {
    return {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: geojson }],
    };
  }

  return null;
}

export function detectGeometryType(geojson) {
  const fc = normalizeGeoJSON(geojson);
  if (!fc || !fc.features || fc.features.length === 0) return 'polygon';

  const firstType = fc.features[0].geometry.type.toLowerCase();
  if (firstType.includes('point')) return 'point';
  if (firstType.includes('line')) return 'line';
  return 'polygon';
}

export function getAllCoords(geometry) {
  const coords = [];
  const extract = (c) => {
    if (typeof c[0] === 'number') {
      coords.push(c);
    } else {
      c.forEach(extract);
    }
  };
  if (geometry && geometry.coordinates) {
    extract(geometry.coordinates);
  }
  return coords;
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
