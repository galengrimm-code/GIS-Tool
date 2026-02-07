import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import useProjectStore from '../../store/useProjectStore';
import { getLeafletLayer } from '../../hooks/useLayerSync';
import { downloadCSV } from '../../utils/fileDownload';
import { showToast } from '../../hooks/useToast';

export default function AttributeTableModal() {
  const modalData = useProjectStore((s) => s.modalData);
  const layers = useProjectStore((s) => s.layers);
  const closeModal = useProjectStore((s) => s.closeModal);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [highlightIdx, setHighlightIdx] = useState(null);

  const layer = layers.find((l) => l.id === modalData?.layerId);
  const features = layer?.geojson?.features || [];

  const columns = useMemo(() => {
    const cols = new Set();
    features.forEach((f) => {
      Object.keys(f.properties || {}).forEach((k) => cols.add(k));
    });
    return ['#', ...Array.from(cols)];
  }, [features]);

  const sortedFeatures = useMemo(() => {
    const indexed = features.map((f, i) => ({ ...f, _idx: i }));
    if (!sortColumn || sortColumn === '#') {
      return sortDir === 'asc' ? indexed : [...indexed].reverse();
    }
    return [...indexed].sort((a, b) => {
      const va = a.properties?.[sortColumn] ?? '';
      const vb = b.properties?.[sortColumn] ?? '';
      const numA = Number(va);
      const numB = Number(vb);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDir === 'asc' ? numA - numB : numB - numA;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [features, sortColumn, sortDir]);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  const handleRowClick = (featureIdx) => {
    setHighlightIdx(featureIdx);
    // Highlight on map
    const ll = getLeafletLayer(layer?.id);
    if (ll) {
      let i = 0;
      ll.eachLayer((sublayer) => {
        if (i === featureIdx) {
          if (sublayer.setStyle) {
            sublayer.setStyle({ color: '#ffeb3b', weight: 4, fillColor: '#ffeb3b', fillOpacity: 0.3 });
          }
        } else {
          // Reset style
          if (sublayer.setStyle && layer.style?.polygon) {
            sublayer.setStyle(layer.style.polygon);
          }
        }
        i++;
      });
    }
  };

  const handleRowDoubleClick = (featureIdx) => {
    const ll = getLeafletLayer(layer?.id);
    const map = window.__gisMap;
    if (ll && map) {
      let i = 0;
      ll.eachLayer((sublayer) => {
        if (i === featureIdx && sublayer.getBounds) {
          map.fitBounds(sublayer.getBounds(), { padding: [50, 50] });
        } else if (i === featureIdx && sublayer.getLatLng) {
          map.setView(sublayer.getLatLng(), 16);
        }
        i++;
      });
    }
  };

  const handleExportCSV = () => {
    const dataCols = columns.filter((c) => c !== '#');
    const header = dataCols.map((c) => `"${c}"`).join(',');
    const rows = features.map((f) =>
      dataCols.map((c) => {
        const val = String(f.properties?.[c] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    downloadCSV(csv, `${layer?.name || 'attributes'}.csv`);
    showToast('CSV exported', 'success');
  };

  if (!layer) return null;

  // Calculate summary
  const totalArea = features.reduce((sum, f) => {
    const area = f.properties?._area_acres;
    return area ? sum + parseFloat(area) : sum;
  }, 0);

  return (
    <ModalWrapper title={`Attributes: ${layer.name}`} width="max-w-4xl">
      <div className="space-y-3">
        {/* Summary bar */}
        <div className="flex items-center justify-between text-[11px] text-gis-text-muted">
          <span>{features.length} feature{features.length !== 1 ? 's' : ''}</span>
          {totalArea > 0 && (
            <span>Total area: {totalArea.toFixed(2)} acres</span>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 text-gis-accent hover:text-gis-accent-hover transition-colors"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="border border-gis-border rounded overflow-auto max-h-[400px]">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-gis-bg-tertiary">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-2 py-1.5 text-left font-medium text-gis-text-muted cursor-pointer
                      hover:text-gis-text-primary border-b border-gis-border whitespace-nowrap select-none"
                  >
                    {col}
                    {sortColumn === col && (
                      <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedFeatures.map((f, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => handleRowClick(f._idx)}
                  onDoubleClick={() => handleRowDoubleClick(f._idx)}
                  className={`cursor-pointer border-b border-gis-border/50 transition-colors
                    ${highlightIdx === f._idx
                      ? 'bg-yellow-500/10'
                      : 'hover:bg-gis-bg-tertiary/50'
                    }`}
                >
                  {columns.map((col) => (
                    <td key={col} className="px-2 py-1 text-gis-text-secondary font-mono whitespace-nowrap">
                      {col === '#'
                        ? f._idx + 1
                        : formatValue(f.properties?.[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModalWrapper>
  );
}

function formatValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toFixed(4);
  }
  return String(val);
}
