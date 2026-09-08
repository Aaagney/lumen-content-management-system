import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getArticleById } from '../api/articleApi';
import QuizCard from '../components/QuizCard';

const getInitials = (name) => {
  if (!name) return 'A';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const parseArticleBody = (text) => {
  if (!text) return [];
  // Split into blocks by double newlines
  const blocks = text.split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('###')) {
        return { type: 'h3', content: trimmed.replace(/^###\s+/, '') };
      }
      if (trimmed.startsWith('##')) {
        return { type: 'h3', content: trimmed.replace(/^##\s+/, '') };
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return { type: 'h3', content: trimmed.replace(/^\*\*|\*\*$/g, '') };
      }
      return { type: 'p', content: trimmed };
    })
    .filter(Boolean);
};

const ArticleDetailPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const articleId = params.id || searchParams.get('id');

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      if (!articleId) {
        if (isMounted) {
          setError('No article ID provided');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getArticleById(articleId);
        if (isMounted) {
          setArticle(data);
          document.title = `${data.title} - Lumen`;
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        if (isMounted) {
          setError('The article you are looking for does not exist or may have been removed.');
          document.title = 'Article Not Found - Lumen';
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
      document.title = 'Browse Articles - Lumen';
    };
  }, [articleId]);

  if (loading) {
    return (
      <main className="main-content">
        <div className="detail-container">
          <Link to="/" className="back-btn">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to articles
          </Link>
          <h1 className="detail-title">Loading Article...</h1>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="main-content">
        <div className="detail-container">
          <Link to="/" className="back-btn">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to articles
          </Link>
          <div id="detailHeader">
            <h1 className="detail-title">Article Not Found</h1>
            <p className="detail-desc">{error || 'The requested article could not be loaded.'}</p>
          </div>
        </div>
      </main>
    );
  }

  const tagsList = article.tags ? article.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const bodyBlocks = parseArticleBody(article.content);
  const authorInitials = getInitials(article.author);
  const formattedViews = Number(article.views || 0).toLocaleString();
  const formattedLikes = Number(article.likes || 0).toLocaleString();

  return (
    <main className="main-content">
      <div className="detail-container">
        {/* Back Button */}
        <Link to="/" className="back-btn">
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to articles
        </Link>

        {/* Article Header details */}
        <div id="detailHeader">
          <div className="detail-header-meta">
            <span id="detailCategory" className="detail-category">
              {article.category}
            </span>
            <span className="detail-meta-divider">&middot;</span>
            <span id="detailReadingTime" className="detail-reading-time">
              {article.reading_time}
            </span>
            <span className="detail-meta-divider">&middot;</span>
            <span id="detailDate" className="detail-date">
              {article.published_date}
            </span>
          </div>

          <h1 id="detailTitle" className="detail-title">
            {article.title}
          </h1>
          <p id="detailDesc" className="detail-desc">
            {article.description}
          </p>
        </div>

        {/* Author Information block */}
        <div className="detail-author-block">
          <div className="detail-author-profile">
            <div id="detailAuthorAvatar" className="detail-author-avatar">
              {authorInitials}
            </div>
            <div className="detail-author-text">
              <span id="detailAuthorName" className="detail-author-name">
                {article.author}
              </span>
              <span id="detailAuthorBio" className="detail-author-bio">
                {article.author_description || 'Writer for Lumen CMS.'}
              </span>
            </div>
          </div>

          <div className="detail-stats">
            <div className="stat-item" title="Views">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span id="detailViews">{formattedViews}</span>
            </div>
            <div className="stat-item" title="Likes">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.722l1.293-7a2 2 0 00-2-2.278H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                />
              </svg>
              <span id="detailLikes">{formattedLikes}</span>
            </div>
          </div>
        </div>

        {/* Article Image */}
        <div className="detail-img-wrapper">
          <img
            id="detailImg"
            className="detail-img"
            src={article.image || 'images/crispr.png'}
            alt={article.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'images/crispr.png';
            }}
          />
        </div>

        {/* Article body content */}
        <article id="detailBody" className="detail-body">
          {bodyBlocks.map((block, idx) => {
            if (block.type === 'h3') {
              return <h3 key={idx}>{block.content}</h3>;
            }
            return <p key={idx}>{block.content}</p>;
          })}
        </article>

        {/* Tags Section */}
        {tagsList.length > 0 && (
          <div id="detailTags" className="detail-tags-section">
            {tagsList.map((tag, idx) => (
              <span key={idx} className="tag-pill">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Quiz Card */}
        <QuizCard
          articleId={article.id}
          articleTitle={article.title}
          articleCategory={article.category}
        />
      </div>
    </main>
  );
};

export default ArticleDetailPage;
