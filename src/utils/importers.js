import shp from 'shpjs';
import GeoTIFF from 'geotiff';
import { normalizeGeoJSON, detectGeometryType } from './geoUtils';
import { getDefaultStyle } from './stylePresets';

export async function importVectorLayer(files, name, isBoundary = false) {
  const fileArray = Array.isArray(files) ? files : [files];
  const file = fileArray[0];
  const ext = file.name.split('.').pop().toLowerCase();
  let geojson;

  if (ext === 'geojson' || ext === 'json') {
    const text = await file.text();
    geojson = JSON.parse(text);
  } else if (ext === 'zip') {
    const arrayBuffer = await file.arrayBuffer();
    geojson = await shp(arrayBuffer);
  } else if (ext === 'shp' || ext === 'dbf' || ext === 'shx') {
    const shapefileData = {};
    for (const f of fileArray) {
      const fExt = f.name.split('.').pop().toLowerCase();
      const buffer = await f.arrayBuffer();
      if (fExt === 'shp') shapefileData.shp = buffer;
      else if (fExt === 'dbf') shapefileData.dbf = buffer;
      else if (fExt === 'shx') shapefileData.shx = buffer;
      else if (fExt === 'prj') shapefileData.prj = await f.text();
    }

    if (!shapefileData.shp) {
      throw new Error('Missing .shp file');
    }
    if (!shapefileData.dbf) {
      throw new Error('Missing .dbf file');
    }

    geojson = shp.combine([
      shp.parseShp(shapefileData.shp, shapefileData.prj),
      shp.parseDbf(shapefileData.dbf),
    ]);
  } else {
    throw new Error('Unsupported file format. Use .geojson, .json, .zip, or .shp + .dbf');
  }

  const fc = normalizeGeoJSON(geojson);
  if (!fc) throw new Error('Could not parse GeoJSON');

  const geomType = detectGeometryType(fc);
  const style = getDefaultStyle(geomType, isBoundary);

  return {
    name,
    type: 'vector',
    geomType,
    isBoundary,
    visible: true,
    geojson: fc,
    style,
  };
}

export async function importGeoTiff(file, name) {
  const arrayBuffer = await file.arrayBuffer();
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  const bbox = image.getBoundingBox();
  const bounds = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];

  const rasters = await image.readRasters();
  const width = image.getWidth();
  const height = image.getHeight();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);

  const numBands = rasters.length;
  for (let i = 0; i < width * height; i++) {
    if (numBands >= 3) {
      imageData.data[i * 4] = rasters[0][i];
      imageData.data[i * 4 + 1] = rasters[1][i];
      imageData.data[i * 4 + 2] = rasters[2][i];
      imageData.data[i * 4 + 3] = numBands >= 4 ? rasters[3][i] : 255;
    } else {
      const val = rasters[0][i];
      imageData.data[i * 4] = val;
      imageData.data[i * 4 + 1] = val;
      imageData.data[i * 4 + 2] = val;
      imageData.data[i * 4 + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const imageUrl = canvas.toDataURL();

  return {
    name,
    type: 'raster',
    geomType: 'raster',
    isBoundary: false,
    visible: true,
    imageUrl,
    bounds,
    opacity: 1,
    geojson: null,
    style: null,
    metadata: { width, height, bands: numBands },
  };
}

export async function importUnreferencedImage(file, name) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Default bounds: current map view
        const map = window.__gisMap;
        let bounds;
        if (map) {
          const b = map.getBounds();
          bounds = [[b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]];
        } else {
          bounds = [[38, -98], [41, -94]];
        }

        resolve({
          name,
          type: 'image',
          geomType: 'image',
          isBoundary: false,
          visible: true,
          imageUrl: e.target.result,
          bounds,
          opacity: 0.7,
          geojson: null,
          style: null,
          metadata: { width: img.width, height: img.height, georeferenced: false },
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
