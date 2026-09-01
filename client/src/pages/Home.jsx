<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Eye, ThumbsUp } from "lucide-react";

function Home() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const fetched = await api.getArticles();
        setArticles(fetched);
      } catch (err) {
        console.error("Failed to load articles for home:", err);
      }
    };
    fetchArticles();
  }, []);

  // Find featured article (CRISPR one)
  const featured = articles.find(a => a.id === 1) || articles[0];
  const others = articles.filter(a => a.id !== (featured ? featured.id : null));

  return (
    <div>
      {/* Featured Article Card */}
      {featured && (
        <div className="featured-card">
          <div className="featured-img-container">
            <img 
              src={featured.image_url} 
              alt={featured.title} 
              className="featured-img" 
            />
            <div className="featured-overlay">
              <div className="tag-row">
                <span className="badge-featured">Featured</span>
                <span className="badge-tag">{featured.category}</span>
              </div>
              <h1 className="featured-title">{featured.title}</h1>
              <p className="featured-desc">
                A quiet revolution in molecular biology has produced a tool precise enough to correct a single letter in the three-billion-character book of human DNA.
              </p>
              <div className="featured-meta">
                Priya Mehta &nbsp;•&nbsp; {featured.read_time} read &nbsp;•&nbsp; {featured.views.toLocaleString()} views
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Title */}
      <h2 className="serif-title" style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Latest Articles</h2>

      {/* Articles Feed List */}
      <div className="articles-feed">
        {others.map((art) => (
          <div key={art.id} className="article-row-card">
            <div className="article-row-left">
              {art.image_url && (
                <img src={art.image_url} alt={art.title} className="article-row-img" />
              )}
              <div className="article-row-details">
                <h3 className="article-row-title">{art.title}</h3>
                <div className="article-row-meta">
                  <span>{art.category}</span>
                  <span>•</span>
                  <span>{art.read_time} read</span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                    <Eye size={12} /> {art.views}
                  </span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                    <ThumbsUp size={12} /> {art.likes}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="article-row-right">
              <span className={`status-badge ${art.status === 'Published' ? 'published' : 'pending'}`}>
                {art.status}
              </span>
            </div>
          </div>
=======
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
>>>>>>> origin/main
        ))}
      </div>
    </div>
  );
<<<<<<< HEAD
}

export default Home;
=======
}
>>>>>>> origin/main
