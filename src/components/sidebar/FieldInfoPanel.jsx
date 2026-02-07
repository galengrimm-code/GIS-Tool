import useProjectStore from '../../store/useProjectStore';
import { calculateGeoJSONAreaAcres } from '../../utils/areaCalculation';
import { useMemo } from 'react';

export default function FieldInfoPanel() {
  const project = useProjectStore((s) => s.project);
  const layers = useProjectStore((s) => s.layers);
  const fieldBoundaryId = useProjectStore((s) => s.fieldBoundaryId);

  const boundaryLayer = layers.find((l) => l.id === fieldBoundaryId);

  const { area, center } = useMemo(() => {
    if (!boundaryLayer?.geojson) return { area: null, center: null };
    const acres = calculateGeoJSONAreaAcres(boundaryLayer.geojson);
    // Calculate center from features
    let latSum = 0, lngSum = 0, count = 0;
    for (const f of boundaryLayer.geojson.features || []) {
      if (!f.geometry) continue;
      const coords = f.geometry.coordinates;
      const ring = f.geometry.type === 'Polygon' ? coords[0] :
                   f.geometry.type === 'MultiPolygon' ? coords[0][0] : null;
      if (ring) {
        for (const c of ring) {
          lngSum += c[0];
          latSum += c[1];
          count++;
        }
      }
    }
    return {
      area: acres,
      center: count > 0 ? { lat: latSum / count, lng: lngSum / count } : null,
    };
  }, [boundaryLayer]);

  return (
    <div className="border-b border-gis-border">
      <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gis-text-muted bg-gis-bg-tertiary">
        Field Information
      </div>
      <div className="px-4 py-3">
        {project.client ? (
          <div className="space-y-1.5 text-xs">
            <InfoRow label="Client" value={project.client} />
            <InfoRow label="Farm" value={project.farm} />
            <InfoRow label="Field" value={project.field} />
            {area !== null && (
              <InfoRow label="Area" value={`${area.toFixed(1)} ac`} />
            )}
            {center && (
              <InfoRow
                label="Center"
                value={`${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`}
              />
            )}
          </div>
        ) : (
          <p className="text-gis-text-muted text-xs italic text-center py-3">
            No project loaded
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-gis-text-muted">{label}</span>
      <span className="text-gis-text-primary font-mono text-[11px]">{value}</span>
    </div>
  );
}
