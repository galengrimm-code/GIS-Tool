import { X } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';

export default function DrawingInstructions() {
  const isDrawing = useProjectStore((s) => s.isDrawing);
  const instruction = useProjectStore((s) => s.drawingInstruction);
  const setTool = useProjectStore((s) => s.setTool);

  if (!isDrawing || !instruction) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-gis-bg-secondary border border-gis-accent rounded flex items-center gap-3 px-4 py-2 text-xs text-gis-text-primary shadow-lg">
      <span>{instruction}</span>
      <button
        onClick={() => setTool('pan')}
        className="flex items-center gap-1 px-2 py-0.5 border border-gis-border rounded text-[11px] text-gis-text-secondary hover:bg-gis-bg-tertiary hover:text-gis-text-primary transition-colors"
      >
        <X size={12} />
        Cancel
      </button>
    </div>
  );
}
