import JSZip from 'jszip';
import { downloadBlob } from './fileDownload';
import { normalizeGeoJSON, getAllCoords } from './geoUtils';
import { showToast } from '../hooks/useToast';

export async function exportLayerAsShapefile(geojson, filename) {
  try {
    let fc = normalizeGeoJSON(geojson);
    if (!fc) throw new Error('Invalid GeoJSON');

    // Add default properties if missing
    fc.features.forEach((f, i) => {
      if (!f.properties) f.properties = {};
      if (!f.properties.name) f.properties.name = `Feature_${i + 1}`;
      if (!f.properties.id) f.properties.id = i + 1;
    });

    await createAndDownloadShapefile(fc, filename.replace(/[^a-zA-Z0-9_-]/g, '_'));
  } catch (error) {
    console.error('Shapefile export error:', error);
    showToast('Export failed: ' + error.message, 'error');
  }
}

export async function exportDrawnItemsAsShapefile(drawnItems) {
  if (!drawnItems || drawnItems.getLayers().length === 0) {
    showToast('No features to export', 'warning');
    return;
  }
  const geojson = drawnItems.toGeoJSON();
  await exportLayerAsShapefile(geojson, 'drawn_features');
}

async function createAndDownloadShapefile(geojson, filename) {
  const zip = new JSZip();

  const polygons = geojson.features.filter(
    (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
  );
  const lines = geojson.features.filter(
    (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
  );
  const points = geojson.features.filter(
    (f) => f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
  );

  if (polygons.length > 0) {
    const shpData = writeShapefile(polygons, 5);
    zip.file(`${filename}_polygons.shp`, shpData.shp);
    zip.file(`${filename}_polygons.shx`, shpData.shx);
    zip.file(`${filename}_polygons.dbf`, shpData.dbf);
    zip.file(`${filename}_polygons.prj`, getPrjContent());
  }

  if (lines.length > 0) {
    const shpData = writeShapefile(lines, 3);
    zip.file(`${filename}_lines.shp`, shpData.shp);
    zip.file(`${filename}_lines.shx`, shpData.shx);
    zip.file(`${filename}_lines.dbf`, shpData.dbf);
    zip.file(`${filename}_lines.prj`, getPrjContent());
  }

  if (points.length > 0) {
    const shpData = writeShapefile(points, 1);
    zip.file(`${filename}_points.shp`, shpData.shp);
    zip.file(`${filename}_points.shx`, shpData.shx);
    zip.file(`${filename}_points.dbf`, shpData.dbf);
    zip.file(`${filename}_points.prj`, getPrjContent());
  }

  zip.file(`${filename}.geojson`, JSON.stringify(geojson, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${filename}.zip`);
  showToast('Shapefile downloaded', 'success');
}

function getPrjContent() {
  return 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]';
}

function writeShapefile(features, shapeType) {
  let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;

  features.forEach((f) => {
    const coords = getAllCoords(f.geometry);
    coords.forEach((c) => {
      xMin = Math.min(xMin, c[0]);
      yMin = Math.min(yMin, c[1]);
      xMax = Math.max(xMax, c[0]);
      yMax = Math.max(yMax, c[1]);
    });
  });

  const shpParts = [];
  const shxRecords = [];
  let shpOffset = 50;

  features.forEach((feature, idx) => {
    const recordData = writeShapeRecord(feature.geometry, shapeType, idx + 1);
    const recordLength = recordData.byteLength / 2;
    shxRecords.push({ offset: shpOffset, length: recordLength });
    shpParts.push(recordData);
    shpOffset += recordLength + 4;
  });

  // SHP Header
  const shpHeader = new ArrayBuffer(100);
  const shpHeaderView = new DataView(shpHeader);
  shpHeaderView.setInt32(0, 9994, false);
  const totalShpLength = shpParts.reduce((sum, p) => sum + p.byteLength + 8, 0) + 100;
  shpHeaderView.setInt32(24, totalShpLength / 2, false);
  shpHeaderView.setInt32(28, 1000, true);
  shpHeaderView.setInt32(32, shapeType, true);
  shpHeaderView.setFloat64(36, xMin, true);
  shpHeaderView.setFloat64(44, yMin, true);
  shpHeaderView.setFloat64(52, xMax, true);
  shpHeaderView.setFloat64(60, yMax, true);

  const shp = new Uint8Array(totalShpLength);
  shp.set(new Uint8Array(shpHeader), 0);
  let offset = 100;
  shpParts.forEach((part, idx) => {
    const recHeader = new ArrayBuffer(8);
    const recView = new DataView(recHeader);
    recView.setInt32(0, idx + 1, false);
    recView.setInt32(4, part.byteLength / 2, false);
    shp.set(new Uint8Array(recHeader), offset);
    offset += 8;
    shp.set(new Uint8Array(part), offset);
    offset += part.byteLength;
  });

  // SHX file
  const shxLength = 100 + shxRecords.length * 8;
  const shx = new Uint8Array(shxLength);
  const shxView = new DataView(shx.buffer);
  shxView.setInt32(0, 9994, false);
  shxView.setInt32(24, shxLength / 2, false);
  shxView.setInt32(28, 1000, true);
  shxView.setInt32(32, shapeType, true);
  shxView.setFloat64(36, xMin, true);
  shxView.setFloat64(44, yMin, true);
  shxView.setFloat64(52, xMax, true);
  shxView.setFloat64(60, yMax, true);

  shxRecords.forEach((rec, idx) => {
    shxView.setInt32(100 + idx * 8, rec.offset, false);
    shxView.setInt32(100 + idx * 8 + 4, rec.length, false);
  });

  // DBF file
  const dbf = writeDbf(features);

  return { shp, shx, dbf };
}

function writeShapeRecord(geometry, shapeType) {
  if (shapeType === 1) {
    const coords = geometry.type === 'Point' ? geometry.coordinates : geometry.coordinates[0];
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    view.setInt32(0, 1, true);
    view.setFloat64(4, coords[0], true);
    view.setFloat64(12, coords[1], true);
    return buffer;
  }

  if (shapeType === 3 || shapeType === 5) {
    let rings;
    if (geometry.type === 'Polygon') rings = geometry.coordinates;
    else if (geometry.type === 'MultiPolygon') rings = geometry.coordinates.flat();
    else if (geometry.type === 'LineString') rings = [geometry.coordinates];
    else if (geometry.type === 'MultiLineString') rings = geometry.coordinates;

    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    let totalPoints = 0;
    rings.forEach((ring) => {
      ring.forEach((c) => {
        xMin = Math.min(xMin, c[0]);
        yMin = Math.min(yMin, c[1]);
        xMax = Math.max(xMax, c[0]);
        yMax = Math.max(yMax, c[1]);
      });
      totalPoints += ring.length;
    });

    const bufferSize = 4 + 32 + 4 + 4 + rings.length * 4 + totalPoints * 16;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    let offset = 0;
    view.setInt32(offset, shapeType, true); offset += 4;
    view.setFloat64(offset, xMin, true); offset += 8;
    view.setFloat64(offset, yMin, true); offset += 8;
    view.setFloat64(offset, xMax, true); offset += 8;
    view.setFloat64(offset, yMax, true); offset += 8;
    view.setInt32(offset, rings.length, true); offset += 4;
    view.setInt32(offset, totalPoints, true); offset += 4;

    let pointIndex = 0;
    rings.forEach((ring) => {
      view.setInt32(offset, pointIndex, true); offset += 4;
      pointIndex += ring.length;
    });

    rings.forEach((ring) => {
      ring.forEach((c) => {
        view.setFloat64(offset, c[0], true); offset += 8;
        view.setFloat64(offset, c[1], true); offset += 8;
      });
    });

    return buffer;
  }

  return new ArrayBuffer(0);
}

function writeDbf(features) {
  const fields = new Set(['id', 'name']);
  features.forEach((f) => {
    Object.keys(f.properties || {}).forEach((k) => fields.add(k));
  });
  const fieldList = Array.from(fields).slice(0, 10);

  const numRecords = features.length;
  const numFields = fieldList.length;
  const headerSize = 32 + numFields * 32 + 1;
  const recordSize = 1 + numFields * 20;
  const fileSize = headerSize + numRecords * recordSize + 1;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint8(0, 3);
  const now = new Date();
  view.setUint8(1, now.getFullYear() - 1900);
  view.setUint8(2, now.getMonth() + 1);
  view.setUint8(3, now.getDate());
  view.setUint32(4, numRecords, true);
  view.setUint16(8, headerSize, true);
  view.setUint16(10, recordSize, true);

  let offset = 32;
  fieldList.forEach((fieldName) => {
    const nameBytes = new TextEncoder().encode(fieldName.substring(0, 10).toUpperCase());
    bytes.set(nameBytes, offset);
    view.setUint8(offset + 11, 67); // 'C'
    view.setUint8(offset + 16, 20);
    offset += 32;
  });
  view.setUint8(offset, 0x0d);
  offset++;

  features.forEach((f) => {
    view.setUint8(offset, 0x20);
    offset++;
    fieldList.forEach((fieldName) => {
      const value = String(f.properties[fieldName] || '').substring(0, 20).padEnd(20, ' ');
      const valueBytes = new TextEncoder().encode(value);
      bytes.set(valueBytes, offset);
      offset += 20;
    });
  });

  view.setUint8(offset, 0x1a);
  return buffer;
}
