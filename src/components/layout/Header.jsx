import {
  FolderPlus,
  FolderOpen,
  Save,
  Import,
  Download,
  MapPin,
} from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';

export default function Header() {
  const project = useProjectStore((s) => s.project);
  const openModal = useProjectStore((s) => s.openModal);

  const projectLabel = project.client
    ? `${project.client} / ${project.farm} / ${project.field}`
    : 'No project';

  return (
    <header className="bg-gis-bg-secondary border-b border-gis-border flex items-center px-4 gap-2 h-12 min-h-[48px]">
      <span className="font-mono font-semibold text-sm text-gis-accent tracking-tight mr-4 select-none">
        GIS WORKBENCH
      </span>

      <nav className="flex gap-1.5">
        <HeaderButton icon={FolderPlus} label="New" onClick={() => openModal('newProject')} />
        <HeaderButton icon={FolderOpen} label="Open" onClick={() => openModal('openProject')} />
        <HeaderButton icon={Save} label="Save" onClick={() => openModal('saveProject')} />
        <div className="w-px bg-gis-border mx-1 self-stretch my-2" />
        <HeaderButton icon={Import} label="Import" onClick={() => openModal('import')} />
        <HeaderButton icon={Download} label="Export" onClick={() => openModal('exportDrawn')} />
        <div className="w-px bg-gis-border mx-1 self-stretch my-2" />
        <HeaderButton icon={MapPin} label="Go To" onClick={() => openModal('goTo')} />
      </nav>

      <span className="ml-auto font-mono text-xs text-gis-text-muted truncate max-w-[300px]">
        {projectLabel}
      </span>
    </header>
  );
}

function HeaderButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gis-text-secondary
        bg-transparent border border-gis-border rounded hover:bg-gis-bg-tertiary
        hover:text-gis-text-primary hover:border-gis-text-muted transition-all duration-150"
    >
      <Icon size={14} strokeWidth={1.5} />
      <span>{label}</span>
    </button>
  );
}
