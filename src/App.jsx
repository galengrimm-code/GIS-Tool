import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import StatusBar from './components/layout/StatusBar';
import MapView from './components/map/MapView';
import ToastContainer from './components/ui/ToastContainer';
import ContextMenu from './components/ui/ContextMenu';
import ModalRouter from './ModalRouter';

export default function App() {
  return (
    <div className="h-screen grid grid-cols-[280px_1fr] grid-rows-[48px_1fr_32px]">
      <div className="col-span-2">
        <Header />
      </div>
      <Sidebar />
      <main className="relative overflow-hidden">
        <MapView />
      </main>
      <div className="col-span-2">
        <StatusBar />
      </div>

      {/* Overlays */}
      <ContextMenu />
      <ToastContainer />
      <ModalRouter />
    </div>
  );
}
