import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MAP_DEFAULTS } from '../utils/constants';

const useProjectStore = create(subscribeWithSelector((set, get) => ({
  // === Project Metadata ===
  project: {
    client: '',
    farm: '',
    field: '',
    created: null,
    modified: null,
  },

  // === Layers ===
  layers: [],
  layerIdCounter: 0,
  fieldBoundaryId: null,
  selectedLayerId: null,

  // === Map State ===
  mapCenter: MAP_DEFAULTS.center,
  mapZoom: MAP_DEFAULTS.zoom,
  currentBasemap: 'dark',
  coordinates: { lat: 0, lng: 0 },

  // === Tool State ===
  currentTool: 'pan',
  isDrawing: false,
  drawingInstruction: '',

  // === Modal State ===
  activeModal: null,
  modalData: null,

  // === Context Menu ===
  contextMenu: { visible: false, x: 0, y: 0, targetLayerId: null },

  // =====================
  // Project Actions
  // =====================
  createProject: (client, farm, field) => {
    const state = get();
    // Remove all layers
    set({
      project: {
        client,
        farm,
        field,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
      layers: [],
      layerIdCounter: 0,
      fieldBoundaryId: null,
      selectedLayerId: null,
    });
  },

  setProject: (project) => set({ project }),

  // =====================
  // Layer Actions
  // =====================
  addLayer: (layerData) => {
    const { layerIdCounter, layers } = get();
    const newId = layerIdCounter + 1;
    const newLayer = { ...layerData, id: newId };
    set({
      layers: [...layers, newLayer],
      layerIdCounter: newId,
    });
    return newId;
  },

  removeLayer: (layerId) => {
    const { layers, fieldBoundaryId, selectedLayerId } = get();
    set({
      layers: layers.filter((l) => l.id !== layerId),
      fieldBoundaryId: fieldBoundaryId === layerId ? null : fieldBoundaryId,
      selectedLayerId: selectedLayerId === layerId ? null : selectedLayerId,
    });
  },

  updateLayer: (layerId, updates) => {
    set({
      layers: get().layers.map((l) =>
        l.id === layerId ? { ...l, ...updates } : l
      ),
    });
  },

  setLayerVisibility: (layerId, visible) => {
    set({
      layers: get().layers.map((l) =>
        l.id === layerId ? { ...l, visible } : l
      ),
    });
  },

  setLayerStyle: (layerId, style) => {
    set({
      layers: get().layers.map((l) =>
        l.id === layerId ? { ...l, style } : l
      ),
    });
  },

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  setFieldBoundary: (layerId) => {
    const { layers, fieldBoundaryId } = get();
    // Clear old boundary flag
    const updated = layers.map((l) => ({
      ...l,
      isBoundary: l.id === layerId,
    }));
    set({ layers: updated, fieldBoundaryId: layerId });
  },

  // =====================
  // Map Actions
  // =====================
  setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  setBasemap: (basemap) => set({ currentBasemap: basemap }),
  setCoordinates: (coords) => set({ coordinates: coords }),

  // =====================
  // Tool Actions
  // =====================
  setTool: (tool) => set({ currentTool: tool }),
  setDrawingState: (isDrawing, instruction = '') =>
    set({ isDrawing, drawingInstruction: instruction }),

  // =====================
  // Modal Actions
  // =====================
  openModal: (modalName, data = null) =>
    set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // =====================
  // Context Menu Actions
  // =====================
  showContextMenu: (x, y, targetLayerId) =>
    set({ contextMenu: { visible: true, x, y, targetLayerId } }),
  hideContextMenu: () =>
    set({ contextMenu: { visible: false, x: 0, y: 0, targetLayerId: null } }),

  // =====================
  // Bulk State (for project load)
  // =====================
  loadState: (state) => set(state),
})));

export default useProjectStore;
