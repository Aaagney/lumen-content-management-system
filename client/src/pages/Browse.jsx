import React, { useState, useEffect } from 'react';
import http from '../api/http';
import ArticleCard from '../components/ArticleCard';
import { Search } from 'lucide-react';

const categories = ['All', 'Science', 'Technology', 'Environment', 'Health', 'History'];

export default function Browse() {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = () => {
    setLoading(true);
    setError('');
    http.get(`/api/articles?category=${activeCategory}&search=${searchQuery}`)
      .then(res => setArticles(res.data))
      .catch(() => setError('Could not load articles.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  return (
    <div className="container">
      <h1>Browse Articles</h1>
      <p style={{ color: '#666' }}>Explore insightful longform writing across science, technology, and the world.</p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', margin: '20px 0' }}>
        <input 
          type="text" 
          placeholder="Search articles..." 
          className="input-field" 
          style={{ margin: 0 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={18} /> Search
        </button>
      </form>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="article-grid">
        {articles.map(art => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
      {loading && <p style={{ color: '#888', marginTop: '16px' }}>Loading articles...</p>}
      {error && <p style={{ color: 'crimson', marginTop: '16px' }}>{error}</p>}
      {!loading && !error && articles.length === 0 && (
        <p style={{ color: '#888', marginTop: '16px' }}>No articles match your search.</p>
      )}
    </div>
  );
}