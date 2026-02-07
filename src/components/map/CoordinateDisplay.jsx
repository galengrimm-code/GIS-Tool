import useProjectStore from '../../store/useProjectStore';

export default function CoordinateDisplay() {
  const coordinates = useProjectStore((s) => s.coordinates);

  return (
    <div className="absolute bottom-3 left-3 z-[1000] bg-gis-bg-secondary border border-gis-border rounded px-2.5 py-1.5 font-mono text-[11px] text-gis-text-secondary">
      Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
    </div>
  );
}
