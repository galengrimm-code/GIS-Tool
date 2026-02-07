import { Plus } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import LayerItem from './LayerItem';

export default function LayerPanel() {
  const layers = useProjectStore((s) => s.layers);
  const openModal = useProjectStore((s) => s.openModal);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gis-text-muted bg-gis-bg-tertiary flex items-center justify-between">
        <span>Layers</span>
        <button
          onClick={() => openModal('import')}
          className="text-gis-accent hover:bg-gis-bg-primary p-0.5 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {layers.length === 0 ? (
          <p className="text-gis-text-muted text-xs italic text-center py-6">
            No layers loaded
          </p>
        ) : (
          <div className="space-y-0.5">
            {[...layers].reverse().map((layer) => (
              <LayerItem key={layer.id} layer={layer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
