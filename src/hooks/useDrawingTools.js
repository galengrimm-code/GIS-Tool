import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import useProjectStore from '../store/useProjectStore';
import { DRAW_OPTIONS } from '../utils/constants';
import { calculatePolygonAreaAcres } from '../utils/areaCalculation';

// Shared drawn items group — persists across re-renders
let drawnItemsGroup = null;

export function getDrawnItems() {
  return drawnItemsGroup;
}

export default function useDrawingTools(map) {
  const drawHandlerRef = useRef(null);
  const drawnItemsRef = useRef(null);

  // Initialize drawn items group
  useEffect(() => {
    if (!map) return;

    if (!drawnItemsGroup) {
      drawnItemsGroup = new L.FeatureGroup();
    }
    drawnItemsRef.current = drawnItemsGroup;

    if (!map.hasLayer(drawnItemsGroup)) {
      map.addLayer(drawnItemsGroup);
    }

    return () => {
      // Don't remove on cleanup — persist across re-renders
    };
  }, [map]);

  // React to tool changes
  useEffect(() => {
    if (!map) return;

    const unsub = useProjectStore.subscribe(
      (state) => state.currentTool,
      (currentTool, prevTool) => {
        // Cleanup previous handler
        if (drawHandlerRef.current) {
          drawHandlerRef.current.disable();
          drawHandlerRef.current = null;
        }

        // Disable editing on all layers
        if (drawnItemsRef.current) {
          drawnItemsRef.current.eachLayer((layer) => {
            if (layer.editing) layer.editing.disable();
            layer.off('click', handleDeleteClick);
          });
        }

        const store = useProjectStore.getState();

        switch (currentTool) {
          case 'drawPolygon': {
            const handler = new L.Draw.Polygon(map, DRAW_OPTIONS.polygon);
            handler.enable();
            drawHandlerRef.current = handler;
            store.setDrawingState(true, 'Click to add vertices. Double-click or click first point to finish polygon.');
            break;
          }
          case 'drawLine': {
            const handler = new L.Draw.Polyline(map, DRAW_OPTIONS.polyline);
            handler.enable();
            drawHandlerRef.current = handler;
            store.setDrawingState(true, 'Click to add points. Double-click to finish line.');
            break;
          }
          case 'drawPoint': {
            const markerIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="width:12px;height:12px;background:#4caf50;border:2px solid #2e7d32;border-radius:50%;"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            });
            const handler = new L.Draw.Marker(map, { icon: markerIcon });
            handler.enable();
            drawHandlerRef.current = handler;
            store.setDrawingState(true, 'Click to place point.');
            break;
          }
          case 'edit': {
            if (!drawnItemsRef.current || drawnItemsRef.current.getLayers().length === 0) {
              store.setTool('pan');
              return;
            }
            drawnItemsRef.current.eachLayer((layer) => {
              if (layer.editing) layer.editing.enable();
            });
            store.setDrawingState(true, 'Drag vertices to edit. Press Escape or click Pan to finish.');
            break;
          }
          case 'delete': {
            if (!drawnItemsRef.current || drawnItemsRef.current.getLayers().length === 0) {
              store.setTool('pan');
              return;
            }
            drawnItemsRef.current.eachLayer((layer) => {
              layer.on('click', handleDeleteClick);
            });
            store.setDrawingState(true, 'Click a drawn feature to delete it. Press Escape when done.');
            break;
          }
          default: {
            // pan or other
            store.setDrawingState(false, '');
            break;
          }
        }
      }
    );

    return unsub;
  }, [map]);

  // Handle draw created events
  useEffect(() => {
    if (!map) return;

    const handleCreated = (e) => {
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);

      // Add popup
      const popupContent = createFeaturePopup(layer, e.layerType);
      layer.bindPopup(popupContent);

      // Reset to pan
      useProjectStore.getState().setTool('pan');
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    return () => map.off(L.Draw.Event.CREATED, handleCreated);
  }, [map]);

  // Keyboard shortcut: Escape to cancel
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        const { isDrawing } = useProjectStore.getState();
        if (isDrawing) {
          useProjectStore.getState().setTool('pan');
        }
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);
}

function handleDeleteClick(e) {
  L.DomEvent.stopPropagation(e);
  if (drawnItemsGroup) {
    drawnItemsGroup.removeLayer(e.target);
  }
}

function createFeaturePopup(layer, type) {
  const div = document.createElement('div');
  div.style.cssText = 'font-family: IBM Plex Sans, sans-serif; font-size: 12px;';

  let areaHtml = '';
  if (type === 'polygon' && layer.getLatLngs) {
    const latlngs = layer.getLatLngs()[0];
    const acres = calculatePolygonAreaAcres(latlngs);
    areaHtml = `<div style="color:#a0a0a8;margin-bottom:8px;">Area: ${acres.toFixed(2)} acres</div>`;
  }

  div.innerHTML = `
    <div style="margin-bottom:6px;font-weight:500;">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
    ${areaHtml}
    <div style="display:flex;gap:4px;">
      <button onclick="window.dispatchEvent(new CustomEvent('gis:exportDrawnFeature', {detail: ${L.stamp(layer)}}))"
        style="padding:4px 8px;font-size:11px;cursor:pointer;background:#242428;color:#e8e8ec;border:1px solid #3a3a42;border-radius:3px;">
        Export SHP
      </button>
      ${type === 'polygon' ? `
        <button onclick="window.dispatchEvent(new CustomEvent('gis:setDrawnAsBoundary', {detail: ${L.stamp(layer)}}))"
          style="padding:4px 8px;font-size:11px;cursor:pointer;background:#242428;color:#e8e8ec;border:1px solid #3a3a42;border-radius:3px;">
          Set Boundary
        </button>
      ` : ''}
    </div>
  `;
  return div;
}
