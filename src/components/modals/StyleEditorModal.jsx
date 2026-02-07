import { useState, useMemo, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import useProjectStore from '../../store/useProjectStore';
import { STYLE_PRESETS } from '../../utils/stylePresets';
import { showToast } from '../../hooks/useToast';

export default function StyleEditorModal() {
  const modalData = useProjectStore((s) => s.modalData);
  const layers = useProjectStore((s) => s.layers);
  const setLayerStyle = useProjectStore((s) => s.setLayerStyle);
  const closeModal = useProjectStore((s) => s.closeModal);

  const layer = layers.find((l) => l.id === modalData?.layerId);

  const [strokeColor, setStrokeColor] = useState('#9c27b0');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [fillColor, setFillColor] = useState('#9c27b0');
  const [fillOpacity, setFillOpacity] = useState(30);
  const [pointRadius, setPointRadius] = useState(6);

  // Initialize from current style
  useEffect(() => {
    if (layer?.style) {
      const ps = layer.style.polygon || {};
      const pts = layer.style.point || {};
      setStrokeColor(ps.color || '#9c27b0');
      setStrokeWidth(ps.weight || 2);
      setStrokeOpacity(ps.opacity ?? 1);
      setFillColor(ps.fillColor || '#9c27b0');
      setFillOpacity(Math.round((ps.fillOpacity ?? 0.3) * 100));
      setPointRadius(pts.radius || 6);
    }
  }, [layer]);

  const applyPreset = (presetKey) => {
    const preset = STYLE_PRESETS[presetKey];
    if (!preset) return;
    const ps = preset.polygon;
    const pts = preset.point;
    setStrokeColor(ps.color);
    setStrokeWidth(ps.weight);
    setFillColor(ps.fillColor);
    setFillOpacity(Math.round(ps.fillOpacity * 100));
    setPointRadius(pts.radius);
  };

  const handleApply = () => {
    if (!layer) return;
    const style = {
      polygon: {
        color: strokeColor,
        weight: strokeWidth,
        opacity: strokeOpacity,
        fillColor: fillColor,
        fillOpacity: fillOpacity / 100,
      },
      point: {
        radius: pointRadius,
        color: strokeColor,
        weight: strokeWidth,
        fillColor: fillColor,
        fillOpacity: fillOpacity / 100,
      },
    };
    setLayerStyle(layer.id, style);
    closeModal();
    showToast('Style applied', 'success');
  };

  if (!layer) return null;

  return (
    <ModalWrapper title={`Style: ${layer.name}`} width="max-w-sm">
      <div className="space-y-4">
        {/* Presets */}
        <div>
          <label className="block text-xs text-gis-text-muted mb-2">Quick Presets</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-2.5 py-1 text-[11px] bg-gis-bg-primary border border-gis-border rounded
                  hover:bg-gis-bg-tertiary hover:border-gis-text-muted transition-colors text-gis-text-secondary"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stroke */}
        <div className="space-y-2">
          <label className="block text-xs text-gis-text-muted">Stroke / Outline</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded border border-gis-border cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-20 bg-gis-bg-primary border border-gis-border rounded px-2 py-1 text-[11px] font-mono text-gis-text-primary"
            />
            <div className="flex-1">
              <span className="text-[10px] text-gis-text-muted">Width: {strokeWidth}px</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full accent-gis-accent"
              />
            </div>
          </div>
        </div>

        {/* Fill */}
        <div className="space-y-2">
          <label className="block text-xs text-gis-text-muted">Fill</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded border border-gis-border cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-20 bg-gis-bg-primary border border-gis-border rounded px-2 py-1 text-[11px] font-mono text-gis-text-primary"
            />
            <div className="flex-1">
              <span className="text-[10px] text-gis-text-muted">Opacity: {fillOpacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseInt(e.target.value))}
                className="w-full accent-gis-accent"
              />
            </div>
          </div>
        </div>

        {/* Point radius */}
        {(layer.geomType === 'point') && (
          <div className="space-y-2">
            <label className="block text-xs text-gis-text-muted">Point Radius: {pointRadius}px</label>
            <input
              type="range"
              min="3"
              max="20"
              value={pointRadius}
              onChange={(e) => setPointRadius(parseInt(e.target.value))}
              className="w-full accent-gis-accent"
            />
          </div>
        )}

        {/* Preview */}
        <div>
          <label className="block text-xs text-gis-text-muted mb-1">Preview</label>
          <div className="bg-gis-bg-primary border border-gis-border rounded p-3 flex items-center justify-center h-16">
            <div
              style={{
                width: 80,
                height: 40,
                borderRadius: 4,
                border: `${strokeWidth}px solid ${strokeColor}`,
                backgroundColor: fillColor,
                opacity: fillOpacity / 100,
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleApply} className="btn-primary">Apply Style</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
