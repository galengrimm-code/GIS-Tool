import { useEffect, useRef } from 'react';
import L from 'leaflet';
import useProjectStore from '../store/useProjectStore';
import { getDrawnItems } from './useDrawingTools';
import { normalizeGeoJSON } from '../utils/geoUtils';
import { getDefaultStyle } from '../utils/stylePresets';

// Global map of layerId -> L.Layer
const leafletLayerMap = new Map();

export function getLeafletLayer(layerId) {
  return leafletLayerMap.get(layerId);
}

export function getLeafletLayerMap() {
  return leafletLayerMap;
}

export default function useLayerSync(map) {
  const prevLayersRef = useRef([]);

  // Sync store layers to Leaflet map
  useEffect(() => {
    if (!map) return;

    const unsub = useProjectStore.subscribe(
      (state) => state.layers,
      (layers) => {
        const prevLayers = prevLayersRef.current;
        const prevIds = new Set(prevLayers.map((l) => l.id));
        const currentIds = new Set(layers.map((l) => l.id));

        // Remove layers that no longer exist
        for (const prev of prevLayers) {
          if (!currentIds.has(prev.id)) {
            const ll = leafletLayerMap.get(prev.id);
            if (ll && map.hasLayer(ll)) {
              map.removeLayer(ll);
            }
            leafletLayerMap.delete(prev.id);
          }
        }

        // Add or update layers
        for (const layer of layers) {
          const existingLL = leafletLayerMap.get(layer.id);

          if (!existingLL) {
            // New layer — create Leaflet layer
            const ll = createLeafletLayer(layer);
            if (ll) {
              leafletLayerMap.set(layer.id, ll);
              if (layer.visible) {
                ll.addTo(map);
              }
            }
          } else {
            // Check visibility changes
            const prevLayer = prevLayers.find((l) => l.id === layer.id);
            if (prevLayer) {
              if (layer.visible && !prevLayer.visible) {
                existingLL.addTo(map);
              } else if (!layer.visible && prevLayer.visible) {
                map.removeLayer(existingLL);
              }

              // Check style changes
              if (layer.style !== prevLayer.style && layer.style) {
                applyStyle(existingLL, layer);
              }
            }
          }
        }

        prevLayersRef.current = layers.map((l) => ({ ...l }));
      }
    );

    return unsub;
  }, [map]);

  // Zoom to extent handler
  useEffect(() => {
    const handleZoomExtent = () => {
      const { layers, fieldBoundaryId } = useProjectStore.getState();
      if (layers.length === 0) return;

      // Prefer boundary layer
      const boundaryLayer = layers.find((l) => l.id === fieldBoundaryId);
      if (boundaryLayer) {
        const ll = leafletLayerMap.get(boundaryLayer.id);
        if (ll && ll.getBounds) {
          map.fitBounds(ll.getBounds(), { padding: [50, 50] });
          return;
        }
      }

      // Fall back to all layers
      let bounds = null;
      for (const layer of layers) {
        const ll = leafletLayerMap.get(layer.id);
        if (ll) {
          let layerBounds;
          if (ll.getBounds) {
            layerBounds = ll.getBounds();
          } else if (layer.bounds) {
            layerBounds = L.latLngBounds(layer.bounds);
          }
          if (layerBounds && layerBounds.isValid()) {
            bounds = bounds ? bounds.extend(layerBounds) : layerBounds;
          }
        }
      }
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    window.addEventListener('gis:zoomExtent', handleZoomExtent);
    return () => window.removeEventListener('gis:zoomExtent', handleZoomExtent);
  }, [map]);

  // Set-drawn-as-boundary handler
  useEffect(() => {
    const handleSetBoundary = (e) => {
      const layerStamp = e.detail;
      const drawnItems = getDrawnItems();
      if (!drawnItems) return;

      const drawnLayer = drawnItems.getLayer(layerStamp);
      if (!drawnLayer) return;

      const geojson = drawnLayer.toGeoJSON();
      const fc = normalizeGeoJSON(geojson);
      if (!fc) return;

      const store = useProjectStore.getState();
      const style = getDefaultStyle('polygon', true);

      const layerId = store.addLayer({
        name: 'Drawn Boundary',
        type: 'vector',
        geomType: 'polygon',
        isBoundary: true,
        visible: true,
        geojson: fc,
        style,
      });

      store.setFieldBoundary(layerId);
      drawnItems.removeLayer(drawnLayer);
      map.closePopup();
    };

    window.addEventListener('gis:setDrawnAsBoundary', handleSetBoundary);
    return () => window.removeEventListener('gis:setDrawnAsBoundary', handleSetBoundary);
  }, [map]);
}

function createLeafletLayer(layer) {
  if (layer.type === 'vector' && layer.geojson) {
    const style = layer.style || getDefaultStyle(layer.geomType, layer.isBoundary);
    return L.geoJSON(layer.geojson, {
      style: style.polygon,
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, style.point);
      },
    });
  }

  if (layer.type === 'raster' && layer.imageUrl && layer.bounds) {
    return L.imageOverlay(layer.imageUrl, layer.bounds, {
      opacity: layer.opacity || 1,
    });
  }

  if (layer.type === 'image' && layer.imageUrl && layer.bounds) {
    return L.imageOverlay(layer.imageUrl, layer.bounds, {
      opacity: layer.opacity || 0.7,
      interactive: true,
    });
  }

  return null;
}

function applyStyle(leafletLayer, layer) {
  if (!layer.style) return;

  if (leafletLayer.setStyle) {
    leafletLayer.setStyle(layer.style.polygon);
  }

  // For point layers, we need to recreate with new radius
  if (layer.geomType === 'point' && layer.style.point) {
    const map = window.__gisMap;
    if (map && map.hasLayer(leafletLayer)) {
      map.removeLayer(leafletLayer);
      const newLL = L.geoJSON(layer.geojson, {
        style: layer.style.polygon,
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, layer.style.point);
        },
      });
      newLL.addTo(map);
      leafletLayerMap.set(layer.id, newLL);
    }
  }
}
