import { MoreVertical, Eye, EyeOff } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';

const GEOM_ICONS = {
  polygon: 'bg-gis-accent/30 border-2 border-gis-accent rounded-sm',
  line: 'bg-transparent border-t-2 border-amber-500 rotate-45',
  point: 'bg-emerald-500 rounded-full',
  raster: 'bg-gradient-to-br from-red-400 via-yellow-400 to-green-400 rounded-sm',
  image: 'bg-gradient-to-br from-gray-500 to-gray-400 border border-dashed border-gis-text-muted rounded-sm',
};

export default function LayerItem({ layer }) {
  const selectedLayerId = useProjectStore((s) => s.selectedLayerId);
  const selectLayer = useProjectStore((s) => s.selectLayer);
  const setLayerVisibility = useProjectStore((s) => s.setLayerVisibility);
  const showContextMenu = useProjectStore((s) => s.showContextMenu);
  const openModal = useProjectStore((s) => s.openModal);

  const isSelected = selectedLayerId === layer.id;
  const iconClass = GEOM_ICONS[layer.geomType] || GEOM_ICONS.polygon;

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, layer.id);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    showContextMenu(rect.right, rect.top, layer.id);
  };

  return (
    <div
      onClick={() => selectLayer(layer.id)}
      onContextMenu={handleContextMenu}
      onDoubleClick={() => openModal('style', { layerId: layer.id })}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
        ${isSelected
          ? 'bg-gis-bg-tertiary border border-gis-accent'
          : 'hover:bg-gis-bg-tertiary border border-transparent'
        }`}
    >
      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLayerVisibility(layer.id, !layer.visible);
        }}
        className="text-gis-text-muted hover:text-gis-text-primary transition-colors shrink-0"
      >
        {layer.visible ? (
          <Eye size={14} className="text-gis-accent" />
        ) : (
          <EyeOff size={14} />
        )}
      </button>

      {/* Geometry type icon */}
      <div className={`w-3.5 h-3.5 shrink-0 ${iconClass}`} />

      {/* Layer name */}
      <span className="flex-1 text-xs truncate">
        {layer.name}
        {layer.isBoundary && (
          <span className="ml-1 text-[10px] text-gis-accent">[B]</span>
        )}
      </span>

      {/* Menu button */}
      <button
        onClick={handleMenuClick}
        className="opacity-0 group-hover:opacity-100 text-gis-text-muted hover:text-gis-text-primary transition-all shrink-0"
      >
        <MoreVertical size={14} />
      </button>
    </div>
  );
}
