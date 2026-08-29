import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/ContentList';
import AddContent from './pages/AddContent';
import EditContent from './pages/EditContent';
import ContentDetails from './pages/ContentDetails';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="layout-wrapper">
          <Sidebar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/content" element={<ContentList />} />
              <Route path="/content/add" element={<AddContent />} />
              <Route path="/content/edit/:id" element={<EditContent />} />
              <Route path="/content/view/:id" element={<ContentDetails />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;