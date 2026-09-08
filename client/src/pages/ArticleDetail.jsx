import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_ENDPOINTS.ARTICLES}/${id}`)
      .then(res => {
        if (isMounted) setArticle(res.data);
      })
      .catch(err => console.error('Error fetching article:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    
    axios.get(`${API_ENDPOINTS.ARTICLES}/${id}/comments`)
      .then(res => {
        if (isMounted) setComments(res.data || []);
      })
      .catch(() => {
        if (isMounted) setComments([]);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}><p>Loading article...</p></div>;
  if (!article) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}><p>Article not found.</p></div>;

  return (
    <div className="container" style={{ maxWidth: '760px', marginTop: '32px' }}>
      {article.category_name && (
        <span className="badge badge-published" style={{ marginBottom: '12px' }}>{article.category_name}</span>
      )}
      <h1 style={{ fontSize: '36px', lineHeight: 1.25, margin: '12px 0' }}>{article.title}</h1>
      {article.subtitle && (
        <p style={{ fontSize: '18px', color: '#555', lineHeight: 1.4 }}>{article.subtitle}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        {article.author_avatar ? (
          <img src={article.author_avatar} alt={article.author_name} style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
        ) : null}
        <div>
          <strong style={{ display: 'block' }}>
            By <Link to={`/profile/${article.author_id || 1}`} style={{ color: 'var(--brand-green)', textDecoration: 'none' }}>
              {article.author_name || `Author #${article.author_id || 1}`}
            </Link>
          </strong>
          {article.read_time && <span style={{ fontSize: '13px', color: '#777' }}>Published • {article.read_time}</span>}
        </div>
      </div>

      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '24px', maxHeight: '400px', objectFit: 'cover' }} />
      )}

      <div style={{ fontSize: '17px', lineHeight: 1.8, color: '#2D3748', whiteSpace: 'pre-line' }}>
        {article.content}
      </div>

      <hr style={{ margin: '40px 0', borderColor: 'var(--border-color)' }} />

      <h3>Comments</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id || comment._id} style={{ padding: '14px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Link 
                to={`/profile/${comment.user_id}`} 
                style={{ fontWeight: 'bold', color: 'var(--brand-green)', textDecoration: 'none' }}
              >
                {comment.user_name || 'Reader'}
              </Link>
              <p style={{ margin: '6px 0 0 0', color: '#444' }}>{comment.content}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#777' }}>No comments yet.</p>
        )}
      </div>
    </div>
  );
}