import ModalWrapper from './ModalWrapper';
import useProjectStore from '../../store/useProjectStore';

export default function ErrorModal() {
  const modalData = useProjectStore((s) => s.modalData);
  const closeModal = useProjectStore((s) => s.closeModal);

  const title = modalData?.title || 'Error';
  const message = modalData?.message || 'An unknown error occurred.';
  const details = modalData?.details || null;

  return (
    <ModalWrapper title={title}>
      <div className="space-y-3">
        <p className="text-xs text-gis-text-primary whitespace-pre-wrap">{message}</p>
        {details && (
          <pre className="text-[11px] font-mono text-gis-text-secondary bg-gis-bg-primary border border-gis-border rounded p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {details}
          </pre>
        )}
        <div className="flex justify-end pt-2">
          <button onClick={closeModal} className="btn-primary">OK</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
