import { useEffect, useRef, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import useProjectStore from '../../store/useProjectStore';
import useDrawingTools from '../../hooks/useDrawingTools';
import useLayerSync from '../../hooks/useLayerSync';

export default function MapController() {
  const map = useMap();

  // Store the map instance for external access
  const mapRef = useRef(map);
  mapRef.current = map;

  // Expose map instance globally for hooks that need it
  useEffect(() => {
    window.__gisMap = map;
    return () => { window.__gisMap = null; };
  }, [map]);

  // Track mouse coordinates
  useMapEvents({
    mousemove: (e) => {
      useProjectStore.getState().setCoordinates({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
    click: () => {
      useProjectStore.getState().hideContextMenu();
    },
  });

  // Drawing tools
  useDrawingTools(map);

  // Layer synchronization
  useLayerSync(map);

  return null;
}
