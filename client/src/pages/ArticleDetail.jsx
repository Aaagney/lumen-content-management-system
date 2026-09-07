import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/articles/${id}`)
      .then(res => setArticle(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!article) return <div className="container"><p>Loading article...</p></div>;

  return (
    <div className="container" style={{ maxWidth: '760px', marginTop: '32px' }}>
      <span className="badge badge-published" style={{ marginBottom: '12px' }}>{article.category_name}</span>
      <h1 style={{ fontSize: '38px', lineHeight: 1.2, margin: '12px 0' }}>{article.title}</h1>
      <p style={{ fontSize: '20px', color: '#555', lineHeight: 1.4 }}>{article.subtitle}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
        <img src={article.author_avatar} alt={article.author_name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
        <div>
          <strong style={{ display: 'block' }}>{article.author_name}</strong>
          <span style={{ fontSize: '13px', color: '#777' }}>Published • {article.read_time}</span>
        </div>
      </div>

      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '24px' }} />
      )}

      <div style={{ fontSize: '18px', lineHeight: 1.8, color: '#2D3748', whiteSpace: 'pre-line' }}>
        {article.content}
      </div>
    </div>
  );
}