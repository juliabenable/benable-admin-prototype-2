import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useAppState';
import TopNav from './components/TopNav';
import ToastContainer from './components/Toast';
import DemoPanel from './components/DemoPanel';
import CreatorProgram from './pages/CreatorProgram';
import Campaigns from './pages/Campaigns';
import DraftPortal from './pages/DraftPortal';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <TopNav />
        <main>
          <Routes>
            <Route path="/admin/creator-program" element={<CreatorProgram />} />
            <Route path="/admin/campaigns" element={<Campaigns />} />
            <Route path="/admin/campaigns/:campaignId" element={<Campaigns />} />
            <Route path="/admin/draft-portal" element={<DraftPortal />} />
            <Route path="*" element={<Navigate to="/admin/creator-program" replace />} />
          </Routes>
        </main>
        <ToastContainer />
        <DemoPanel />
      </AppProvider>
    </HashRouter>
  );
}
