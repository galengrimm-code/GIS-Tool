import useProjectStore from '../../store/useProjectStore';

const basemapOptions = [
  { key: 'dark', label: 'Dark', gradient: 'from-[#1a1a1e] to-[#2e2e34]' },
  { key: 'streets', label: 'Streets', gradient: 'from-gray-200 via-gray-300 to-gray-100' },
  { key: 'satellite', label: 'Satellite', gradient: 'from-green-900 via-green-800 to-green-700' },
];

export default function BasemapSwitcher() {
  const currentBasemap = useProjectStore((s) => s.currentBasemap);
  const setBasemap = useProjectStore((s) => s.setBasemap);

  return (
    <div className="absolute bottom-3 right-3 z-[1000] flex gap-1 bg-gis-bg-secondary border border-gis-border rounded p-1">
      {basemapOptions.map(({ key, label, gradient }) => (
        <button
          key={key}
          onClick={() => setBasemap(key)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[9px] transition-all border
            ${currentBasemap === key
              ? 'border-gis-accent text-gis-text-primary'
              : 'border-transparent text-gis-text-muted hover:bg-gis-bg-tertiary hover:text-gis-text-secondary'
            }`}
        >
          <div className={`w-8 h-5 rounded-sm border border-gis-border bg-gradient-to-br ${gradient}`} />
          {label}
        </button>
      ))}
    </div>
  );
}
