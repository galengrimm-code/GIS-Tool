export const BASEMAPS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    label: 'Dark',
  },
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    label: 'Streets',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    label: 'Satellite',
  },
};

export const MAP_DEFAULTS = {
  center: [39.8, -96.5],
  zoom: 6,
};

export const DRAW_OPTIONS = {
  polygon: {
    allowIntersection: false,
    showArea: true,
    shapeOptions: {
      color: '#4a9eff',
      weight: 3,
      fillOpacity: 0.2,
    },
  },
  polyline: {
    shapeOptions: {
      color: '#ff9800',
      weight: 3,
    },
  },
  marker: {
    icon: null, // Set at runtime with L.divIcon
  },
};

export const TOOL_NAMES = {
  pan: 'pan',
  drawPolygon: 'drawPolygon',
  drawLine: 'drawLine',
  drawPoint: 'drawPoint',
  edit: 'edit',
  delete: 'delete',
};
