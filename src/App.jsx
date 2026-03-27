import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useAppState';
import TopNav from './components/TopNav';
import ToastContainer from './components/Toast';
import DemoPanel from './components/DemoPanel';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import Creators from './pages/Creators';
import ReviewQueue from './pages/ReviewQueue';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <TopNav />
        <main>
          <Routes>
            <Route path="/admin" element={<Home />} />
            <Route path="/admin/campaigns" element={<Campaigns />} />
            <Route path="/admin/campaigns/:campaignId" element={<Campaigns />} />
            <Route path="/admin/creators" element={<Creators />} />
            <Route path="/admin/review" element={<ReviewQueue />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
        <ToastContainer />
        <DemoPanel />
      </AppProvider>
    </HashRouter>
  );
}
