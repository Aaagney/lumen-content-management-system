import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bookmark } from 'lucide-react';

export default function ArticleCard({ article }) {
  return (
    <div className="card">
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="card-img" />
      )}
      <div className="card-body">
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1E3A2B', textTransform: 'uppercase' }}>
          {article.category_name || 'General'}
        </span>
        <h3 style={{ margin: '8px 0', fontSize: '18px' }}>
          <Link to={`/article/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {article.title}
          </Link>
        </h3>
        <p style={{ color: '#666', fontSize: '14px', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.subtitle || article.content.substring(0, 100) + '...'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: '#888' }}>
          <span>{article.author_name} • {article.read_time}</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><Heart size={14} /> {article.likes_count}</span>
            <span><Bookmark size={14} /> {article.bookmarks_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}