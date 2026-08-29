import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchContentById, deleteContent } from '../services/api';
import Modal from '../components/Modal';

const ContentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const res = await fetchContentById(id);
        if (res.success) setItem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteContent(id);
      navigate('/content');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="main-content"><p>Loading...</p></div>;
  if (!item) return <div className="main-content"><p>Not found.</p></div>;

  return (
    <div className="main-content">
      <div className="actions-bar">
        <Link to="/content" className="btn-secondary">← Back to List</Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/content/edit/${item.id}`} className="btn-green">Edit Article</Link>
          <button className="btn-secondary" style={{ color: '#ef4444' }} onClick={() => setShowDelete(true)}>Delete</button>
        </div>
      </div>

      <article className="featured-card">
        {item.image_url && (
          <div className="card-image-wrapper">
            <img src={item.image_url} alt={item.title} />
          </div>
        )}
        <div className="card-body">
          <div className="card-meta-header">{item.category} · {item.read_time}</div>
          <h1 className="card-title-serif" style={{ fontSize: '2rem' }}>{item.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>By {item.author}</p>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>{item.description}</div>
        </div>
      </article>

      <Modal isOpen={showDelete} title="Delete Content" onConfirm={handleDelete} onCancel={() => setShowDelete(false)} confirmText="Delete">
        Are you sure you want to delete this content item?
      </Modal>
    </div>
  );
};

export default ContentDetails;