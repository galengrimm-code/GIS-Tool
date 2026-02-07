import { useRef } from 'react';
import useProjectStore from './store/useProjectStore';
import NewProjectModal from './components/modals/NewProjectModal';
import GoToModal from './components/modals/GoToModal';
import ErrorModal from './components/modals/ErrorModal';
import ImportLayerModal from './components/modals/ImportLayerModal';
import StyleEditorModal from './components/modals/StyleEditorModal';
import AttributeTableModal from './components/modals/AttributeTableModal';
import { saveProject, loadProject } from './utils/projectIO';
import { getDrawnItems } from './hooks/useDrawingTools';
import { exportDrawnItemsAsShapefile } from './utils/shapefileWriter';

export default function ModalRouter() {
  const activeModal = useProjectStore((s) => s.activeModal);
  const closeModal = useProjectStore((s) => s.closeModal);
  const openProjectRef = useRef(null);

  // Handle non-modal actions that were triggered via openModal
  if (activeModal === 'saveProject') {
    saveProject();
    closeModal();
    return null;
  }

  if (activeModal === 'openProject') {
    // Trigger file input
    if (!openProjectRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        if (e.target.files.length > 0) {
          await loadProject(e.target.files[0]);
        }
        openProjectRef.current = null;
      };
      openProjectRef.current = input;
    }
    openProjectRef.current.click();
    closeModal();
    return null;
  }

  if (activeModal === 'exportDrawn') {
    const drawnItems = getDrawnItems();
    exportDrawnItemsAsShapefile(drawnItems);
    closeModal();
    return null;
  }

  switch (activeModal) {
    case 'newProject':
      return <NewProjectModal />;
    case 'goTo':
      return <GoToModal />;
    case 'error':
      return <ErrorModal />;
    case 'import':
      return <ImportLayerModal />;
    case 'style':
      return <StyleEditorModal />;
    case 'attributes':
      return <AttributeTableModal />;
    default:
      return null;
  }
}
