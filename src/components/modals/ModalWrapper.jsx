import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';

export default function ModalWrapper({ title, children, width = 'max-w-md', onClose }) {
  const closeModal = useProjectStore((s) => s.closeModal);
  const overlayRef = useRef(null);

  const handleClose = onClose || closeModal;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 animate-[fadeIn_0.15s_ease]"
      style={{ animation: 'fadeIn 0.15s ease' }}
    >
      <div
        className={`bg-gis-bg-secondary border border-gis-border rounded-lg shadow-2xl ${width} w-full mx-4`}
        style={{ animation: 'scaleIn 0.2s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gis-border">
          <h3 className="text-sm font-medium text-gis-text-primary">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gis-text-muted hover:text-gis-text-primary transition-colors p-0.5 rounded hover:bg-gis-bg-tertiary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
