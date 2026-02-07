import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_DEFAULTS, BASEMAPS } from '../../utils/constants';
import useProjectStore from '../../store/useProjectStore';
import MapController from './MapController';
import BasemapSwitcher from './BasemapSwitcher';
import CoordinateDisplay from './CoordinateDisplay';
import DrawingInstructions from './DrawingInstructions';
import ToolBar from './ToolBar';

export default function MapView() {
  const currentBasemap = useProjectStore((s) => s.currentBasemap);
  const bm = BASEMAPS[currentBasemap];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={MAP_DEFAULTS.center}
        zoom={MAP_DEFAULTS.zoom}
        zoomControl={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          key={currentBasemap}
          url={bm.url}
          attribution={bm.attribution}
          subdomains={bm.subdomains || ''}
          maxZoom={bm.maxZoom}
        />
        <MapController />
      </MapContainer>

      {/* Map overlays — positioned absolutely over the map */}
      <ToolBar />
      <BasemapSwitcher />
      <CoordinateDisplay />
      <DrawingInstructions />
    </div>
  );
}
