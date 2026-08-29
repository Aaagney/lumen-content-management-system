import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllContent, deleteContent } from '../services/api';
import ContentCard from '../components/ContentCard';
import Modal from '../components/Modal';

const ContentList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [itemToDelete, setItemToDelete] = useState(null);

  const categories = ['Science', 'Technology', 'Environment', 'Health', 'History'];

  const loadContent = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await fetchAllContent(params);
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteContent(itemToDelete.id);
      setItemToDelete(null);
      loadContent();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content">
      <div className="actions-bar">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>Content Directory</h1>
        <Link to="/content/add" className="btn-green">
          + Add New Article
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading articles...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', margin: '2rem 0' }}>No content found in this category.</p>
      ) : (
        items.map(item => (
          <ContentCard key={item.id} item={item} onDeleteClick={(item) => setItemToDelete(item)} />
        ))
      )}

      {/* BROWSE BY CATEGORY Section (Matching Figma screenshot) */}
      <div className="category-section">
        <div className="category-title">Browse By Category</div>
        <div className="pill-container">
          <button 
            className={`pill-button ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill-button ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={Boolean(itemToDelete)}
        title="Confirm Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
        confirmText="Delete Content"
      >
        Are you sure you want to delete <strong>"{itemToDelete?.title}"</strong>?
      </Modal>
    </div>
  );
};

export default ContentList;