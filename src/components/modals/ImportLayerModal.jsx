import { useState, useRef } from 'react';
import L from 'leaflet';
import { Upload } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import useProjectStore from '../../store/useProjectStore';
import { showToast } from '../../hooks/useToast';
import { importVectorLayer, importGeoTiff, importUnreferencedImage } from '../../utils/importers';

export default function ImportLayerModal() {
  const [layerType, setLayerType] = useState('boundary');
  const [layerName, setLayerName] = useState('');
  const [shapefileMode, setShapefileMode] = useState(false);
  const [files, setFiles] = useState([]);
  const [shpFile, setShpFile] = useState(null);
  const [dbfFile, setDbfFile] = useState(null);
  const [shxFile, setShxFile] = useState(null);
  const fileInputRef = useRef(null);
  const closeModal = useProjectStore((s) => s.closeModal);
  const addLayer = useProjectStore((s) => s.addLayer);
  const setFieldBoundary = useProjectStore((s) => s.setFieldBoundary);

  const isVector = layerType === 'boundary' || layerType === 'vector';

  const getAccept = () => {
    switch (layerType) {
      case 'boundary':
      case 'vector':
        return '.geojson,.json,.zip';
      case 'geotiff':
        return '.tif,.tiff';
      case 'image':
        return '.png,.jpg,.jpeg';
      default:
        return '*';
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    if (selected.length > 0 && !layerName) {
      setLayerName(selected[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleImport = async () => {
    const name = layerName || 'Unnamed Layer';
    const isBoundary = layerType === 'boundary';

    try {
      let layerData;

      if (shapefileMode && isVector) {
        if (!shpFile) {
          showToast('Please select a .shp file', 'error');
          return;
        }
        if (!dbfFile) {
          showToast('Please select a .dbf file', 'error');
          return;
        }
        const componentFiles = [shpFile, dbfFile];
        if (shxFile) componentFiles.push(shxFile);
        layerData = await importVectorLayer(componentFiles, name, isBoundary);
      } else {
        if (files.length === 0) {
          showToast('Please select a file', 'error');
          return;
        }

        switch (layerType) {
          case 'boundary':
          case 'vector':
            layerData = await importVectorLayer(files, name, isBoundary);
            break;
          case 'geotiff':
            layerData = await importGeoTiff(files[0], name);
            break;
          case 'image':
            layerData = await importUnreferencedImage(files[0], name);
            break;
        }
      }

      if (layerData) {
        const layerId = addLayer(layerData);

        if (isBoundary) {
          setFieldBoundary(layerId);
        }

        // Zoom to new layer
        const map = window.__gisMap;
        if (map && layerData.geojson) {
          const ll = L.geoJSON(layerData.geojson);
          const bounds = ll.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }

        closeModal();
        showToast(`Layer "${name}" imported successfully`, 'success');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast(`Import failed: ${error.message}`, 'error');
    }
  };

  return (
    <ModalWrapper title="Import Layer" width="max-w-lg">
      <div className="space-y-3">
        {/* Layer Type */}
        <div>
          <label className="block text-xs text-gis-text-muted mb-1">Layer Type</label>
          <select
            value={layerType}
            onChange={(e) => {
              setLayerType(e.target.value);
              setShapefileMode(false);
            }}
            className="w-full bg-gis-bg-primary border border-gis-border rounded px-3 py-2 text-xs text-gis-text-primary focus:outline-none focus:border-gis-accent"
          >
            <option value="boundary">Field Boundary</option>
            <option value="vector">Vector Layer</option>
            <option value="geotiff">GeoTIFF (Raster)</option>
            <option value="image">Unreferenced Image</option>
          </select>
        </div>

        {/* Layer Name */}
        <div>
          <label className="block text-xs text-gis-text-muted mb-1">Layer Name</label>
          <input
            type="text"
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            placeholder="Enter layer name"
            className="w-full bg-gis-bg-primary border border-gis-border rounded px-3 py-2 text-xs text-gis-text-primary
              placeholder-gis-text-muted focus:outline-none focus:border-gis-accent transition-colors"
          />
        </div>

        {/* Shapefile mode toggle */}
        {isVector && (
          <label className="flex items-center gap-2 text-xs text-gis-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={shapefileMode}
              onChange={(e) => setShapefileMode(e.target.checked)}
              className="accent-gis-accent"
            />
            Individual shapefile components (.shp + .dbf + .shx)
          </label>
        )}

        {/* File inputs */}
        {shapefileMode && isVector ? (
          <div className="space-y-2">
            <ShapefileInput label=".shp file (required)" accept=".shp" onFile={setShpFile} />
            <ShapefileInput label=".dbf file (required)" accept=".dbf" onFile={setDbfFile} />
            <ShapefileInput label=".shx file (optional)" accept=".shx" onFile={setShxFile} />
          </div>
        ) : (
          <div>
            <label className="block text-xs text-gis-text-muted mb-1">File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-gis-bg-primary border border-gis-border border-dashed rounded px-3 py-3 cursor-pointer
                hover:border-gis-accent transition-colors"
            >
              <Upload size={14} className="text-gis-text-muted" />
              <span className="text-xs text-gis-text-muted">
                {files.length > 0 ? files.map((f) => f.name).join(', ') : 'Click to select file'}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={getAccept()}
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-[10px] text-gis-text-muted mt-1">
              {isVector
                ? 'Supported: .geojson, .json, .zip (shapefile)'
                : layerType === 'geotiff'
                ? 'Supported: .tif, .tiff (GeoTIFF)'
                : 'Supported: .png, .jpg, .jpeg'}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleImport} className="btn-primary">Import</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function ShapefileInput({ label, accept, onFile }) {
  const ref = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      onFile(e.target.files[0]);
    } else {
      setFileName('');
      onFile(null);
    }
  };

  return (
    <div
      onClick={() => ref.current?.click()}
      className="flex items-center gap-2 bg-gis-bg-primary border border-gis-border rounded px-3 py-2 cursor-pointer
        hover:border-gis-accent transition-colors"
    >
      <Upload size={12} className="text-gis-text-muted shrink-0" />
      <span className={`text-xs ${fileName ? 'text-gis-text-primary' : 'text-gis-text-muted'}`}>
        {fileName || label}
      </span>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" />
    </div>
  );
}
