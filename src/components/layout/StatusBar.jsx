import useProjectStore from '../../store/useProjectStore';

export default function StatusBar() {
  const layers = useProjectStore((s) => s.layers);

  return (
    <footer className="bg-gis-bg-secondary border-t border-gis-border flex items-center px-4 gap-4 h-8 min-h-[32px] text-[11px]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-gis-text-muted">Ready</span>
      </div>

      <div className="text-gis-text-muted">
        Layers: <span className="text-gis-text-secondary font-mono">{layers.length}</span>
      </div>

      <div className="ml-auto text-gis-text-muted font-mono">
        EPSG:4326 / WGS84
      </div>
    </footer>
  );
}
