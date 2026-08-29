import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchContentStats, fetchAllContent, deleteContent } from '../services/api';
import ContentTable from '../components/ContentTable';
import Modal from '../components/Modal';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, categories: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([fetchContentStats(), fetchAllContent()]);
      if (sRes.success) setStats(sRes.data);
      if (cRes.success) setRecentItems(cRes.data.slice(0, 5));
    } catch (err) {
      setError('Failed to connect to backend server. Make sure Node.js & MySQL are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteContent(itemToDelete.id);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      setError('Failed to delete content.');
    }
  };

  return (
    <div className="main-content">
      <div className="actions-bar">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back, Loga Shree S!</p>
        </div>
        <Link to="/content/add" className="btn-green">+ Create Content</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total Articles</div>
          <div className="stat-card-num">{loading ? '...' : stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Published</div>
          <div className="stat-card-num">{loading ? '...' : stats.published}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Drafts</div>
          <div className="stat-card-num">{loading ? '...' : stats.draft}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Categories</div>
          <div className="stat-card-num">{loading ? '...' : stats.categories}</div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Articles</h2>
      {recentItems.length > 0 ? (
        <ContentTable items={recentItems} onDeleteClick={(item) => setItemToDelete(item)} />
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No records available.</p>
      )}

      <Modal
        isOpen={Boolean(itemToDelete)}
        title="Confirm Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
        confirmText="Delete Content"
      >
        Delete <strong>"{itemToDelete?.title}"</strong>?
      </Modal>
    </div>
  );
};

export default Dashboard;