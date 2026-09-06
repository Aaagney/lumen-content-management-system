import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';

export default function ArticleCard({ article }) {
  return (
    <div className="card">
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          className="card-img"
        />
      )}

      <div className="card-body">
        <span
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1E3A2B',
            textTransform: 'uppercase'
          }}
        >
          {article.category || 'General'}
        </span>

        <h3 style={{ margin: '8px 0', fontSize: '18px' }}>
          <Link
            to={`/article/${article.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            {article.title}
          </Link>
        </h3>

        <p
          style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: 1.5,
            margin: '8px 0'
          }}
        >
          {article.category
            ? `Explore this ${article.category.toLowerCase()} article on Lumen.`
            : 'Explore this article on Lumen.'}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            fontSize: '12px',
            color: '#888'
          }}
        >
          <span>
            {article.author_name || 'Unknown Author'} •{' '}
            {article.read_time || '5 min'}
          </span>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Heart size={14} />
              {article.likes || 0}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Eye size={14} />
              {article.views || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}