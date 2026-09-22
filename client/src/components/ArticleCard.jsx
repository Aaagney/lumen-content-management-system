import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Flag } from 'lucide-react';
import ReportModal from './ReportModal';

export default function ArticleCard({ article }) {
  const [reporting, setReporting] = useState(false);

  return (
    <div className="card">
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="card-img" />
      )}
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1E3A2B', textTransform: 'uppercase' }}>
            {article.category_name || 'General'}
          </span>
          <button
            onClick={() => setReporting(true)}
            title="Report this article"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <Flag size={14} />
          </button>
        </div>

        <h3 style={{ margin: '8px 0', fontSize: '18px' }}>
          <Link to={`/article/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {article.title}
          </Link>
        </h3>
        <p style={{ color: '#666', fontSize: '14px', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.subtitle || (article.content ? article.content.substring(0, 100) + '...' : '')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: '#888' }}>
          <small style={{ color: '#666' }}>
            By <Link to={`/profile/${article.author_id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
              {article.author_name || `Author #${article.author_id}`}
            </Link>
          </small>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span><Heart size={14} /> {article.likes_count || 0}</span>
            <span><Bookmark size={14} /> {article.bookmarks_count || 0}</span>
          </div>
        </div>
      </div>

      {reporting && (
        <ReportModal
          isOpen={reporting}
          onClose={() => setReporting(false)}
          targetType="article"
          targetId={article.id}
          targetTitle={article.title}
        />
      )}
    </div>
  );
}