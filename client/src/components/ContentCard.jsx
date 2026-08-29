import React from 'react';
import { Link } from 'react-router-dom';

const ContentCard = ({ item, onDeleteClick }) => {
  const getInitials = (name) => {
    if (!name) return 'LS';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <article className="featured-card">
      {item.image_url && (
        <div className="card-image-wrapper">
          <img src={item.image_url} alt={item.title} />
        </div>
      )}

      <div className="card-body">
        <div className="card-meta-header">
          {item.category}
          <span className="read-time">· {item.read_time || '5 min read'}</span>
        </div>

        <h2 className="card-title-serif">{item.title}</h2>
        
        <p className="card-excerpt">{item.description}</p>

        <div className="card-footer">
          <div className="author-box">
            <div className="author-avatar">{getInitials(item.author)}</div>
            <span className="author-name">{item.author}</span>
          </div>

          <div className="card-stats">
            <div className="stat-item">
              👁️ {(item.views_count || 1200).toLocaleString()}
            </div>
            <div className="stat-item">
              👍 {item.likes_count || 95}
            </div>
            
            <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/content/view/${item.id}`} style={{ textDecoration: 'none', fontSize: '0.85rem', color: '#4b5563', fontWeight: '600' }}>
                View
              </Link>
              <Link to={`/content/edit/${item.id}`} style={{ textDecoration: 'none', fontSize: '0.85rem', color: 'var(--brand-green)', fontWeight: '600' }}>
                Edit
              </Link>
              <button 
                onClick={() => onDeleteClick(item)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ContentCard;