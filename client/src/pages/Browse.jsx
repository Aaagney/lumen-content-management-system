import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { Search } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const categories = ['All', 'Science', 'Technology', 'Environment', 'Health', 'History'];

export default function Browse() {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = useCallback((category = activeCategory, search = searchQuery) => {
    axios.get(`${API_ENDPOINTS.ARTICLES}?category=${category}&search=${search}`)
      .then(res => setArticles(res.data))
      .catch(err => console.error('Error fetching articles:', err));
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchArticles(activeCategory, searchQuery);
  }, [activeCategory, fetchArticles, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(activeCategory, searchQuery);
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
    </div>
  );
}