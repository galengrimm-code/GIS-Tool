import * as turf from '@turf/turf';
import { normalizeGeoJSON } from './geoUtils';

export function clipLayerToBoundary(sourceGeoJSON, boundaryGeoJSON) {
  const source = normalizeGeoJSON(sourceGeoJSON);
  const boundary = normalizeGeoJSON(boundaryGeoJSON);

  if (!source || !boundary) {
    throw new Error('Invalid GeoJSON data');
  }

  // Union all boundary features into one polygon
  let boundaryPolygon;
  try {
    if (boundary.features.length === 1) {
      boundaryPolygon = boundary.features[0];
    } else {
      boundaryPolygon = boundary.features.reduce((acc, f) => {
        if (!acc) return f;
        return turf.union(acc, f);
      }, null);
    }
  } catch (e) {
    throw new Error('Failed to process boundary: ' + e.message);
  }

  if (!boundaryPolygon) {
    throw new Error('Could not create boundary polygon');
  }

  const clippedFeatures = [];
  const errors = [];

  source.features.forEach((feature, idx) => {
    try {
      const geomType = feature.geometry.type;

      if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
        const clipped = turf.intersect(
          turf.featureCollection([feature, boundaryPolygon])
        );
        if (clipped) {
          clipped.properties = { ...feature.properties };
          try {
            clipped.properties._area_acres = (turf.area(clipped) / 4046.86).toFixed(2);
          } catch (e) { /* ignore area calc errors */ }
          clippedFeatures.push(clipped);
        }
      } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
        if (turf.booleanIntersects(feature, boundaryPolygon)) {
          try {
            const boundaryLine = turf.polygonToLine(boundaryPolygon);
            const split = turf.lineSplit(feature, boundaryLine);

            if (split.features.length > 0) {
              split.features.forEach((segment) => {
                const midpoint = turf.along(segment, turf.length(segment) / 2);
                if (turf.booleanPointInPolygon(midpoint, boundaryPolygon)) {
                  segment.properties = { ...feature.properties };
                  clippedFeatures.push(segment);
                }
              });
            } else {
              // Line is fully inside
              clippedFeatures.push({ ...feature });
            }
          } catch (e) {
            // Fallback: check if any point is inside
            const coords = feature.geometry.coordinates;
            const points = geomType === 'LineString' ? coords : coords.flat();
            const anyInside = points.some((c) =>
              turf.booleanPointInPolygon(turf.point(c), boundaryPolygon)
            );
            if (anyInside) {
              clippedFeatures.push({ ...feature });
            }
          }
        }
      } else if (geomType === 'Point' || geomType === 'MultiPoint') {
        if (geomType === 'Point') {
          if (turf.booleanPointInPolygon(feature, boundaryPolygon)) {
            clippedFeatures.push({ ...feature });
          }
        } else {
          feature.geometry.coordinates.forEach((coord) => {
            if (turf.booleanPointInPolygon(turf.point(coord), boundaryPolygon)) {
              clippedFeatures.push({
                type: 'Feature',
                properties: { ...feature.properties },
                geometry: { type: 'Point', coordinates: coord },
              });
            }
          });
        }
      }
    } catch (e) {
      errors.push(`Feature ${idx}: ${e.message}`);
    }
  });

  if (errors.length > 0) {
    console.warn('Clip errors:', errors);
  }

  return {
    type: 'FeatureCollection',
    features: clippedFeatures,
  };
}
