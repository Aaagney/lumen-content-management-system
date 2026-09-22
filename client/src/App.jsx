import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SpamAbusePage from './pages/SpamAbusePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/spam-abuse" element={<SpamAbusePage />} />
          <Route path="/articles" element={<PlaceholderPage title="Articles" />} />
          <Route path="/quizzes" element={<PlaceholderPage title="Quizzes" />} />
          <Route path="/moderation" element={<PlaceholderPage title="Moderation" />} />
          <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="/users" element={<PlaceholderPage title="Users" />} />
          <Route path="/subscriptions" element={<PlaceholderPage title="Subscriptions" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<PlaceholderPage title="Not Found" />} />
        </Routes>
      </main>
    </div>
  );
}
