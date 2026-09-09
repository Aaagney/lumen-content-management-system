import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

export default function ArticleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    // Uses the shared http client so a logged-in token (if any) is sent —
    // needed for an author/admin to view a not-yet-published article here.
    http.get(`/api/articles/${id}`)
      .then(res => setArticle(res.data))
      .catch(err => setError(err.response?.data?.message || 'Could not load this article.'))
      .finally(() => setLoading(false));
    http.get(`/api/quizzes/article/${id}`).then(res => setQuizzes(res.data || [])).catch(() => setQuizzes([]));
  }, [id]);

  if (loading) return <div className="container"><p>Loading article...</p></div>;
  if (error) return <div className="container"><p style={{ color: 'crimson' }}>{error}</p></div>;
  if (!article) return null;

  const isOwner = user && Number(user.id) === Number(article.author_id);
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="container" style={{ maxWidth: '760px', marginTop: '32px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <span className="badge badge-published">{article.category_name}</span>
        {article.status !== 'Published' && (
          <span className={`badge badge-${article.status.toLowerCase().replace(/\s+/g, '-')}`}>{article.status}</span>
        )}
        {isOwner && (
          <Link to={`/write?edit=${article.id}`} className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '13px', padding: '4px 10px' }}>
            Edit article
          </Link>
        )}
      </div>

      <h1 style={{ fontSize: '38px', lineHeight: 1.2, margin: '12px 0' }}>{article.title}</h1>
      <p style={{ fontSize: '20px', color: '#555', lineHeight: 1.4 }}>{article.subtitle}</p>

      {article.admin_note && (isOwner || isAdmin) && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px 16px', margin: '12px 0', fontSize: '14px', color: '#9A3412' }}>
          <strong>Reviewer note:</strong> {article.admin_note}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
        <img src={article.author_avatar} alt={article.author_name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
        <div>
          <strong style={{ display: 'block' }}>{article.author_name}</strong>
          <span style={{ fontSize: '13px', color: '#777' }}>{article.status} • {article.read_time} min read</span>
        </div>
      </div>

      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '24px' }} />
      )}

      <div style={{ fontSize: '18px', lineHeight: 1.8, color: '#2D3748', whiteSpace: 'pre-line' }}>
        {article.content}
      </div>

      {quizzes.length > 0 && (
        <div style={{ marginTop: '32px', padding: '20px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <h2>Test your knowledge</h2>
          {quizzes.map(q => <div key={q.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}><div><strong>{q.title}</strong><div style={{fontSize:13,color:'#666'}}>{q.description}</div></div><Link className="btn btn-primary" to={`/quiz/${q.id}`}>Take Quiz</Link></div>)}
        </div>
      )}

      <CommentSection articleId={article.id} />
    </div>
  );
}
