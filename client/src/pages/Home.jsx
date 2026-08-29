import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/articles')
      .then(res => {
        if (res.data.length > 0) {
          setFeatured(res.data[0]);
          setArticles(res.data.slice(1));
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      {featured && (
        <div style={{ background: '#1E3A2B', color: 'white', borderRadius: '12px', padding: '32px', marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>FEATURED</span>
            <h1 style={{ fontSize: '32px', margin: '16px 0 8px 0' }}>
              <Link to={`/article/${featured.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                {featured.title}
              </Link>
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '16px' }}>{featured.subtitle}</p>
            <div style={{ fontSize: '13px', color: '#A0AEC0', marginTop: '16px' }}>
              {featured.author_name} • {featured.read_time}
            </div>
          </div>
          <img src={featured.cover_image} alt={featured.title} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '8px' }} />
        </div>
      )}

      <h2>Recent Articles</h2>
      <div className="article-grid">
        {articles.map(art => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </div>
  );
}