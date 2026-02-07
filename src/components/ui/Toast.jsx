import { X } from 'lucide-react';

const typeStyles = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-gis-accent',
};

export default function Toast({ toast, onRemove }) {
  return (
    <div
      className={`bg-gis-bg-secondary border border-gis-border border-l-4 ${typeStyles[toast.type] || typeStyles.info}
        rounded px-3 py-2.5 text-xs text-gis-text-primary shadow-lg flex items-center gap-2
        animate-[slideInRight_0.2s_ease]`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gis-text-muted hover:text-gis-text-primary transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}
