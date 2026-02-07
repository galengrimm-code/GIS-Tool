import { useEffect, useRef } from 'react';
import {
  Maximize,
  Eye,
  EyeOff,
  Palette,
  Table,
  Square,
  Scissors,
  Download,
  Trash2,
} from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import { showToast } from '../../hooks/useToast';
import { getLeafletLayer } from '../../hooks/useLayerSync';
import { exportLayerAsShapefile } from '../../utils/shapefileWriter';
import { clipLayerToBoundary } from '../../utils/clipOperations';

export default function ContextMenu() {
  const { visible, x, y, targetLayerId } = useProjectStore((s) => s.contextMenu);
  const hideContextMenu = useProjectStore((s) => s.hideContextMenu);
  const layers = useProjectStore((s) => s.layers);
  const menuRef = useRef(null);

  const layer = layers.find((l) => l.id === targetLayerId);

  useEffect(() => {
    if (!visible) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        hideContextMenu();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [visible, hideContextMenu]);

  if (!visible || !layer) return null;

  const actions = [
    {
      icon: Maximize,
      label: 'Zoom to Layer',
      action: () => {
        const ll = getLeafletLayer(layer.id);
        const map = window.__gisMap;
        if (ll && ll.getBounds && map) {
          map.fitBounds(ll.getBounds(), { padding: [50, 50] });
        }
      },
    },
    {
      icon: layer.visible ? EyeOff : Eye,
      label: layer.visible ? 'Hide Layer' : 'Show Layer',
      action: () => {
        useProjectStore.getState().setLayerVisibility(layer.id, !layer.visible);
      },
    },
    {
      icon: Palette,
      label: 'Style Layer',
      action: () => {
        useProjectStore.getState().openModal('style', { layerId: layer.id });
      },
    },
    {
      icon: Table,
      label: 'View Attributes',
      action: () => {
        useProjectStore.getState().openModal('attributes', { layerId: layer.id });
      },
    },
    { divider: true },
    {
      icon: Square,
      label: 'Set as Field Boundary',
      action: () => {
        useProjectStore.getState().setFieldBoundary(layer.id);
        showToast('Field boundary updated', 'success');
      },
    },
    {
      icon: Scissors,
      label: 'Clip to Boundary',
      action: () => {
        const store = useProjectStore.getState();
        const boundaryLayer = store.layers.find((l) => l.id === store.fieldBoundaryId);
        if (!boundaryLayer) {
          showToast('No field boundary set', 'warning');
          return;
        }
        if (layer.id === store.fieldBoundaryId) {
          showToast('Cannot clip the boundary itself', 'warning');
          return;
        }
        try {
          const result = clipLayerToBoundary(layer.geojson, boundaryLayer.geojson);
          if (result && result.features && result.features.length > 0) {
            const clippedId = store.addLayer({
              name: `${layer.name} (Clipped)`,
              type: 'vector',
              geomType: layer.geomType,
              isBoundary: false,
              visible: true,
              geojson: result,
              style: layer.style,
            });
            showToast(`Clipped: ${result.features.length} features`, 'success');
            store.openModal('attributes', { layerId: clippedId });
          } else {
            showToast('No features within boundary', 'warning');
          }
        } catch (err) {
          showToast(`Clip failed: ${err.message}`, 'error');
        }
      },
    },
    { divider: true },
    {
      icon: Download,
      label: 'Export as Shapefile',
      action: () => {
        if (!layer.geojson) {
          showToast('No vector data to export', 'warning');
          return;
        }
        exportLayerAsShapefile(layer.geojson, layer.name);
      },
    },
    {
      icon: Trash2,
      label: 'Remove Layer',
      danger: true,
      action: () => {
        const ll = getLeafletLayer(layer.id);
        const map = window.__gisMap;
        if (ll && map && map.hasLayer(ll)) {
          map.removeLayer(ll);
        }
        useProjectStore.getState().removeLayer(layer.id);
        showToast('Layer removed', 'success');
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[4000] bg-gis-bg-secondary border border-gis-border rounded-md shadow-xl py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {actions.map((item, i) => {
        if (item.divider) {
          return <div key={i} className="h-px bg-gis-border mx-2 my-1" />;
        }
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => {
              item.action();
              hideContextMenu();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors
              ${item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-gis-text-secondary hover:bg-gis-bg-tertiary hover:text-gis-text-primary'
              }`}
          >
            <Icon size={13} strokeWidth={1.5} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
