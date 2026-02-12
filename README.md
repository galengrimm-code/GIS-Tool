# GIS Research Workbench

A browser-based GIS tool for viewing, drawing, clipping, and exporting geospatial data. Built with React, Leaflet, and Turf.js — runs entirely client-side with no backend or accounts required.

## Features

- **Interactive map** with dark, street, and satellite basemaps (CARTO / Esri)
- **Import layers** from GeoJSON, Shapefiles (.shp/.dbf/.shx or .zip), GeoTIFF, and unreferenced images
- **Drawing tools** — polygon, line, and point creation with vertex editing and deletion
- **Layer management** — toggle visibility, reorder, rename, style editing, and right-click context menus
- **Clip to boundary** — clip any vector layer to a designated field boundary polygon using Turf.js
- **Attribute table** — view and inspect feature properties per layer
- **Area calculations** — automatic acreage computation for polygon features
- **Export formats** — Shapefile (.zip with .shp/.shx/.dbf/.prj), GeoJSON, and CSV
- **Project save/load** — serialize full project state (layers, styles, map view) to a JSON file
- **Go To coordinates** — jump to a specific lat/lng location
- **Zoom to extent** — fit map view to all loaded layers
- **Dark UI** — purpose-built dark theme with IBM Plex typography

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 7 |
| Map | Leaflet 1.9 + react-leaflet 4 + leaflet-draw |
| Geospatial | @turf/turf 6, geotiff 2, shpjs 5 |
| State | Zustand 4 |
| Styling | Tailwind CSS 3 + custom dark theme |
| Icons | Lucide React |
| Bundling | JSZip (shapefile export packaging) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Install and Run

```bash
git clone https://github.com/galengrimm-code/GIS-Tool.git
cd GIS-Tool
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

Output goes to `dist/`.

## Usage

### Creating a Project

Click **New** in the header toolbar. Enter a client name, farm name, and field name. This metadata is saved with the project file.

### Importing Data

Click **Import** or the **+** button on the layer panel. Supported formats:

| Format | Notes |
|--------|-------|
| `.geojson` / `.json` | Standard GeoJSON FeatureCollection or single Feature |
| `.zip` | Zipped shapefile (must contain .shp + .dbf) |
| `.shp` + `.dbf` + `.shx` | Individual shapefile components (select all files) |
| `.tif` / `.tiff` | GeoTIFF raster (rendered to canvas overlay) |
| `.png` / `.jpg` | Unreferenced image (placed at current map extent) |

One layer can be designated as the **field boundary** for clip operations.

### Drawing

Use the toolbar on the right side of the map:

- **Pan** — default navigation mode
- **Draw Polygon** — click vertices, double-click to close
- **Draw Line** — click vertices, double-click to finish
- **Draw Point** — click to place
- **Edit** — drag vertices of existing drawn features
- **Delete** — click drawn features to remove them

### Exporting

- **Export** button in the header exports all drawn features as a zipped Shapefile
- Right-click a layer for additional options: export as Shapefile, export attributes as CSV
- **Save** serializes the entire project (all layers, styles, map state) to a `.json` file
- **Open** loads a previously saved project file

### Clip to Boundary

Right-click a vector layer and select **Clip to Boundary**. The layer's features are intersected against the designated field boundary polygon. Supports polygon, line, and point geometry types.

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Sidebar, StatusBar
│   ├── map/             # MapView, MapController, BasemapSwitcher, ToolBar, CoordinateDisplay
│   ├── modals/          # NewProject, ImportLayer, StyleEditor, AttributeTable, GoTo, Error
│   ├── sidebar/         # LayerPanel, LayerItem, FieldInfoPanel
│   └── ui/              # Toast, ContextMenu, ModalWrapper
├── hooks/
│   ├── useDrawingTools  # Leaflet.Draw integration
│   ├── useLayerSync     # Syncs Zustand layer state ↔ Leaflet map layers
│   └── useToast         # Toast notification system
├── store/
│   └── useProjectStore  # Zustand store (project, layers, map state, tools, modals)
├── utils/
│   ├── constants        # Basemap configs, map defaults, draw options
│   ├── importers        # Vector, GeoTIFF, and image import handlers
│   ├── projectIO        # Project save/load serialization
│   ├── clipOperations   # Turf.js clip-to-boundary logic
│   ├── shapefileWriter  # Binary shapefile (.shp/.shx/.dbf) generation
│   ├── csvExport        # Attribute table → CSV export
│   ├── areaCalculation  # Polygon acreage computation
│   ├── geoUtils         # GeoJSON normalization helpers
│   ├── stylePresets     # Default layer styles by geometry type
│   └── fileDownload     # Browser download utilities
├── App.jsx              # Root layout (header / sidebar / map / statusbar)
├── ModalRouter.jsx      # Modal dispatch and non-modal action handlers
├── main.jsx             # Entry point
└── index.css            # Tailwind directives + Leaflet overrides
```

## Configuration

No environment variables are required. All configuration lives in source:

- **Basemaps** — `src/utils/constants.js` (CARTO dark/streets, Esri satellite)
- **Map defaults** — center `[39.8, -96.5]`, zoom `6` (central US)
- **Draw styles** — `src/utils/constants.js` (colors, weights, fill opacity)
- **Theme colors** — `tailwind.config.js` (custom `gis-*` color palette)

## License

Private repository.
