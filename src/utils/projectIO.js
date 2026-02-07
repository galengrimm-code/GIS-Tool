import useProjectStore from '../store/useProjectStore';
import { getLeafletLayerMap, getLeafletLayer } from '../hooks/useLayerSync';
import { downloadJSON } from './fileDownload';
import { showToast } from '../hooks/useToast';

export function saveProject() {
  const store = useProjectStore.getState();

  if (!store.project.client) {
    showToast('No project to save', 'warning');
    return;
  }

  const map = window.__gisMap;
  const center = map ? map.getCenter() : { lat: 39.8, lng: -96.5 };
  const zoom = map ? map.getZoom() : 6;

  const exportData = {
    version: '2.0',
    project: store.project,
    mapState: {
      center: [center.lat, center.lng],
      zoom,
      basemap: store.currentBasemap,
    },
    fieldBoundaryId: store.fieldBoundaryId,
    layers: store.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      geomType: layer.geomType,
      isBoundary: layer.isBoundary,
      visible: layer.visible,
      geojson: layer.geojson,
      style: layer.style,
      bounds: layer.bounds,
      imageUrl: layer.imageUrl,
      opacity: layer.opacity,
      metadata: layer.metadata,
    })),
  };

  const filename = `${store.project.client}_${store.project.farm}_${store.project.field}.json`
    .replace(/[^a-zA-Z0-9_.-]/g, '_');

  downloadJSON(exportData, filename);
  showToast('Project saved', 'success');
}

export async function loadProject(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.project) {
      throw new Error('Invalid project file');
    }

    // Clear existing layers from map
    const map = window.__gisMap;
    const layerMap = getLeafletLayerMap();
    if (map) {
      for (const [, ll] of layerMap) {
        if (map.hasLayer(ll)) map.removeLayer(ll);
      }
      layerMap.clear();
    }

    const store = useProjectStore.getState();

    // Determine max layer ID
    const maxId = data.layers?.reduce((max, l) => Math.max(max, l.id || 0), 0) || 0;

    // Load state
    store.loadState({
      project: {
        ...data.project,
        modified: new Date().toISOString(),
      },
      layers: data.layers || [],
      layerIdCounter: maxId,
      fieldBoundaryId: data.fieldBoundaryId || null,
      selectedLayerId: null,
      currentBasemap: data.mapState?.basemap || 'dark',
    });

    // Restore map view
    if (map && data.mapState) {
      map.setView(data.mapState.center, data.mapState.zoom);
    }

    showToast('Project loaded', 'success');
  } catch (error) {
    console.error('Load error:', error);
    showToast('Failed to load project: ' + error.message, 'error');
  }
}

export function exportDrawnItems(drawnItems) {
  if (!drawnItems || drawnItems.getLayers().length === 0) {
    showToast('No drawn features to export', 'warning');
    return;
  }
  const geojson = drawnItems.toGeoJSON();
  downloadJSON(geojson, 'drawn_features.geojson');
  showToast('Features exported', 'success');
}
