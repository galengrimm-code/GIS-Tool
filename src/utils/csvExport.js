import { downloadCSV } from './fileDownload';

export function exportAttributesCSV(features, layerName) {
  if (!features || features.length === 0) return '';

  const columns = new Set();
  features.forEach((f) => {
    Object.keys(f.properties || {}).forEach((k) => columns.add(k));
  });
  const cols = Array.from(columns);

  const header = cols.map((c) => `"${c}"`).join(',');
  const rows = features.map((f) =>
    cols
      .map((c) => {
        const val = String(f.properties?.[c] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');
  downloadCSV(csv, `${layerName || 'attributes'}.csv`);
  return csv;
}
