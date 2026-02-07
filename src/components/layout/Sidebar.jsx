import FieldInfoPanel from '../sidebar/FieldInfoPanel';
import LayerPanel from '../sidebar/LayerPanel';

export default function Sidebar() {
  return (
    <aside className="bg-gis-bg-secondary border-r border-gis-border flex flex-col overflow-hidden w-[280px] min-w-[280px]">
      <FieldInfoPanel />
      <LayerPanel />
    </aside>
  );
}
