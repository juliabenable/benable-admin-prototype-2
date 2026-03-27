import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useAppState';
import TopNav from './components/TopNav';
import ToastContainer from './components/Toast';
import DemoPanel from './components/DemoPanel';
import Campaigns from './pages/Campaigns';
import DraftPortal from './pages/DraftPortal';
import ReviewQueue from './pages/ReviewQueue';
import Spreadsheet from './pages/Spreadsheet';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <TopNav />
        <main>
          <Routes>
            <Route path="/admin/campaigns" element={<Campaigns />} />
            <Route path="/admin/campaigns/:campaignId" element={<Campaigns />} />
            <Route path="/admin/draft-portal" element={<DraftPortal />} />
            <Route path="/admin/review" element={<ReviewQueue />} />
            <Route path="/admin/spreadsheet" element={<Spreadsheet />} />
            <Route path="*" element={<Navigate to="/admin/campaigns" replace />} />
          </Routes>
        </main>
        <ToastContainer />
        <DemoPanel />
      </AppProvider>
    </HashRouter>
  );
}
