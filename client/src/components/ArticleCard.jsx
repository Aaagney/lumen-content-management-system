import React from 'react';
import { Link } from 'react-router-dom';

const getInitials = (name) => {
  if (!name) return 'A';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const ArticleCard = ({ article }) => {
  const formattedViews = Number(article.views || 0).toLocaleString();
  const formattedLikes = Number(article.likes || 0).toLocaleString();
  const authorInitials = getInitials(article.author);

  return (
    <Link to={`/article/${article.id}`} className="article-card">
      <div className="card-img-wrapper">
        <img
          className="card-img"
          src={article.image || 'images/crispr.png'}
          alt={article.title}
          onError={(e) => {
            // Fallback gracefully if specific image is not available
            e.target.onerror = null;
            e.target.src = 'images/crispr.png';
          }}
        />
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="card-category">{article.category}</span>
          <span className="card-reading-time">{article.reading_time}</span>
        </div>
        <h2 className="card-title">{article.title}</h2>
        <p className="card-desc">{article.description}</p>
        <div className="card-footer">
          <div className="card-author-info">
            <div className="card-author-avatar">{authorInitials}</div>
            <span className="card-author-name">{article.author}</span>
          </div>
          <div className="card-stats">
            <div className="stat-item" title="Views">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{formattedViews}</span>
            </div>
            <div className="stat-item" title="Likes">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.722l1.293-7a2 2 0 00-2-2.278H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                />
              </svg>
              <span>{formattedLikes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
