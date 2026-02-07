import {
  Hand,
  Maximize,
  Pentagon,
  Minus,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';

const tools = [
  { id: 'pan', icon: Hand, label: 'Pan' },
  { id: 'zoomExtent', icon: Maximize, label: 'Zoom to Extent' },
  { id: 'separator' },
  { id: 'drawPolygon', icon: Pentagon, label: 'Draw Polygon' },
  { id: 'drawLine', icon: Minus, label: 'Draw Line' },
  { id: 'drawPoint', icon: MapPin, label: 'Draw Point' },
  { id: 'separator2' },
  { id: 'edit', icon: Pencil, label: 'Edit Features' },
  { id: 'delete', icon: Trash2, label: 'Delete Features' },
];

export default function ToolBar() {
  const currentTool = useProjectStore((s) => s.currentTool);
  const setTool = useProjectStore((s) => s.setTool);

  const handleClick = (toolId) => {
    if (toolId === 'zoomExtent') {
      // Dispatch zoom event — handled by useLayerSync
      window.dispatchEvent(new CustomEvent('gis:zoomExtent'));
      return;
    }
    setTool(toolId);
  };

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      {tools.map((tool) => {
        if (tool.id.startsWith('separator')) {
          return (
            <div key={tool.id} className="h-px bg-gis-border mx-1" />
          );
        }

        const Icon = tool.icon;
        const isActive = currentTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => handleClick(tool.id)}
            title={tool.label}
            className={`w-9 h-9 flex items-center justify-center rounded border transition-all duration-150
              ${isActive
                ? 'bg-gis-accent text-white border-gis-accent'
                : 'bg-gis-bg-secondary text-gis-text-secondary border-gis-border hover:bg-gis-bg-tertiary hover:text-gis-text-primary hover:border-gis-text-muted'
              }`}
          >
            <Icon size={16} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}
