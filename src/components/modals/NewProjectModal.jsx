import { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import useProjectStore from '../../store/useProjectStore';
import { getLeafletLayerMap } from '../../hooks/useLayerSync';
import { showToast } from '../../hooks/useToast';

export default function NewProjectModal() {
  const [client, setClient] = useState('');
  const [farm, setFarm] = useState('');
  const [field, setField] = useState('');
  const createProject = useProjectStore((s) => s.createProject);
  const closeModal = useProjectStore((s) => s.closeModal);

  const handleCreate = () => {
    if (!client.trim()) {
      showToast('Please enter a client name', 'error');
      return;
    }

    // Remove all Leaflet layers
    const map = window.__gisMap;
    const layerMap = getLeafletLayerMap();
    if (map) {
      for (const [, ll] of layerMap) {
        if (map.hasLayer(ll)) map.removeLayer(ll);
      }
      layerMap.clear();
    }

    createProject(client.trim(), farm.trim(), field.trim());
    closeModal();
    showToast('Project created', 'success');
  };

  return (
    <ModalWrapper title="New Project">
      <div className="space-y-3">
        <FormField label="Client" value={client} onChange={setClient} placeholder="Client name" autoFocus />
        <FormField label="Farm" value={farm} onChange={setFarm} placeholder="Farm name" />
        <FormField label="Field" value={field} onChange={setField} placeholder="Field name" />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={closeModal} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleCreate} className="btn-primary">
            Create Project
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function FormField({ label, value, onChange, placeholder, autoFocus }) {
  return (
    <div>
      <label className="block text-xs text-gis-text-muted mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-gis-bg-primary border border-gis-border rounded px-3 py-2 text-xs text-gis-text-primary
          placeholder-gis-text-muted focus:outline-none focus:border-gis-accent transition-colors"
      />
    </div>
  );
}
