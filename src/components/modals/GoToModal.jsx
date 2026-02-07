import { useState } from 'react';
import L from 'leaflet';
import ModalWrapper from './ModalWrapper';
import useProjectStore from '../../store/useProjectStore';
import { getDrawnItems } from '../../hooks/useDrawingTools';
import { showToast } from '../../hooks/useToast';

export default function GoToModal() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [zoom, setZoom] = useState('');
  const [dropMarker, setDropMarker] = useState(false);
  const closeModal = useProjectStore((s) => s.closeModal);

  const handleGo = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const zoomNum = parseInt(zoom) || undefined;

    if (isNaN(latNum) || isNaN(lngNum)) {
      showToast('Please enter valid coordinates', 'error');
      return;
    }
    if (latNum < -90 || latNum > 90) {
      showToast('Latitude must be between -90 and 90', 'error');
      return;
    }
    if (lngNum < -180 || lngNum > 180) {
      showToast('Longitude must be between -180 and 180', 'error');
      return;
    }

    const map = window.__gisMap;
    if (map) {
      map.setView([latNum, lngNum], zoomNum || map.getZoom());

      if (dropMarker) {
        const marker = L.marker([latNum, lngNum], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="width:12px;height:12px;background:#4caf50;border:2px solid #2e7d32;border-radius:50%;"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        });
        const drawnItems = getDrawnItems();
        if (drawnItems) {
          drawnItems.addLayer(marker);
        }
        showToast('Marker placed', 'success');
      }
    }

    closeModal();
  };

  return (
    <ModalWrapper title="Go To Coordinates">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gis-text-muted mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="39.8"
              autoFocus
              className="w-full bg-gis-bg-primary border border-gis-border rounded px-3 py-2 text-xs text-gis-text-primary
                placeholder-gis-text-muted focus:outline-none focus:border-gis-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gis-text-muted mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-96.5"
              className="w-full bg-gis-bg-primary border border-gis-border rounded px-3 py-2 text-xs text-gis-text-primary
                placeholder-gis-text-muted focus:outline-none focus:border-gis-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gis-text-muted mb-1">Zoom Level (optional)</label>
          <input
            type="number"
            min="1"
            max="20"
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
            placeholder="Current zoom"
            className="w-full bg-gis-bg-primary border border-gis-border rounded px-3 py-2 text-xs text-gis-text-primary
              placeholder-gis-text-muted focus:outline-none focus:border-gis-accent transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-gis-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={dropMarker}
            onChange={(e) => setDropMarker(e.target.checked)}
            className="accent-gis-accent"
          />
          Drop marker at location
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleGo} className="btn-primary">Go</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
