import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryPills from '../components/CategoryPills';
import ArticleGrid from '../components/ArticleGrid';
import { getArticles, searchArticles } from '../api/articleApi';

const BrowsePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const debounceTimerRef = useRef(null);

  const fetchArticlesData = async (query, category) => {
    try {
      setLoading(true);
      let data;
      if (query.trim() !== '') {
        data = await searchArticles(query, category);
      } else {
        data = await getArticles(category);
      }
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on searchQuery or activeCategory change with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchArticlesData(searchQuery, activeCategory);
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, activeCategory]);

  return (
    <main className="main-content">
      <div className="container">
        {/* Page Title Section */}
        <div className="page-title-section">
          <h1 className="page-title">Browse Articles</h1>
          <p className="page-subtitle">Explore curated long-form writing across science, technology, and the world.</p>
        </div>

        {/* Controls Row: Search & Filters */}
        <div className="controls-row">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <CategoryPills activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
        </div>

        {/* Articles Grid */}
        <ArticleGrid articles={articles} loading={loading} />
      </div>
    </main>
  );
};

export default BrowsePage;
