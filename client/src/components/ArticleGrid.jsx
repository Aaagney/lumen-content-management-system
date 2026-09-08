import React from 'react';
import ArticleCard from './ArticleCard';
import NoResults from './NoResults';

const ArticleGrid = ({ articles, loading }) => {
  if (loading) {
    return (
      <div className="articles-grid">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="skeleton-card">
            <div className="skeleton-img"></div>
            <div className="skeleton-body">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line title"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return <NoResults />;
  }

  return (
    <div id="articlesGrid" className="articles-grid">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleGrid;
