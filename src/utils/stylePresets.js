export const STYLE_PRESETS = {
  boundary: {
    label: 'Boundary',
    polygon: { color: '#4a9eff', weight: 3, fillOpacity: 0.1, fillColor: '#4a9eff' },
    point: { radius: 6, color: '#2e7d32', weight: 2, fillColor: '#4a9eff', fillOpacity: 0.8 },
  },
  highlight: {
    label: 'Highlight',
    polygon: { color: '#ffeb3b', weight: 3, fillOpacity: 0.3, fillColor: '#ffeb3b' },
    point: { radius: 8, color: '#f57f17', weight: 2, fillColor: '#ffeb3b', fillOpacity: 0.9 },
  },
  problem: {
    label: 'Problem',
    polygon: { color: '#f44336', weight: 3, fillOpacity: 0.3, fillColor: '#f44336' },
    point: { radius: 8, color: '#b71c1c', weight: 2, fillColor: '#f44336', fillOpacity: 0.9 },
  },
  good: {
    label: 'Good',
    polygon: { color: '#4caf50', weight: 3, fillOpacity: 0.3, fillColor: '#4caf50' },
    point: { radius: 6, color: '#2e7d32', weight: 2, fillColor: '#4caf50', fillOpacity: 0.8 },
  },
  subtle: {
    label: 'Subtle',
    polygon: { color: '#9e9e9e', weight: 1, fillOpacity: 0.1, fillColor: '#9e9e9e' },
    point: { radius: 4, color: '#757575', weight: 1, fillColor: '#9e9e9e', fillOpacity: 0.5 },
  },
  bold: {
    label: 'Bold',
    polygon: { color: '#9c27b0', weight: 4, fillOpacity: 0.4, fillColor: '#9c27b0' },
    point: { radius: 10, color: '#6a1b9a', weight: 3, fillColor: '#9c27b0', fillOpacity: 0.9 },
  },
};

export function getDefaultStyle(geomType, isBoundary = false) {
  if (isBoundary) {
    return {
      polygon: { color: '#4a9eff', weight: 3, fillOpacity: 0.1, fillColor: '#4a9eff' },
      point: { radius: 6, color: '#2e7d32', weight: 2, fillColor: '#4a9eff', fillOpacity: 0.8 },
    };
  }

  switch (geomType) {
    case 'point':
      return {
        polygon: { color: '#4caf50', weight: 2, fillOpacity: 0.3, fillColor: '#4caf50' },
        point: { radius: 6, color: '#2e7d32', weight: 2, fillColor: '#4caf50', fillOpacity: 0.8 },
      };
    case 'line':
      return {
        polygon: { color: '#ff9800', weight: 3, fillOpacity: 0, fillColor: '#ff9800' },
        point: { radius: 6, color: '#e65100', weight: 2, fillColor: '#ff9800', fillOpacity: 0.8 },
      };
    default:
      return {
        polygon: { color: '#9c27b0', weight: 2, fillOpacity: 0.3, fillColor: '#9c27b0' },
        point: { radius: 6, color: '#6a1b9a', weight: 2, fillColor: '#9c27b0', fillOpacity: 0.8 },
      };
  }
}
