import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Eye, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

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

  const featured = articles.find((a) => a.id === 1) || articles[0];

  const others = articles.filter(
    (a) => a.id !== (featured ? featured.id : null)
  );

  return (
    <div className="container">
      {featured && (
        <div className="featured-card">
          <div className="featured-img-container">
            {featured.image_url && (
              <img
                src={featured.image_url}
                alt={featured.title}
                className="featured-img"
              />
            )}

            <div className="featured-overlay">
              <div className="tag-row">
                <span className="badge-featured">Featured</span>
                <span className="badge-tag">
                  {featured.category || "General"}
                </span>
              </div>

              <h1 className="featured-title">
                <Link
                  to={`/article/${featured.id}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {featured.title}
                </Link>
              </h1>

              <p className="featured-desc">
                Explore this featured article on Lumen.
              </p>

              <div className="featured-meta">
                {featured.author_name || "Unknown Author"} &nbsp;•&nbsp;
                {featured.read_time || "5 min"} read &nbsp;•&nbsp;
                {(featured.views || 0).toLocaleString()} views
              </div>
            </div>
          </div>
        </div>
      )}

      <h2
        className="serif-title"
        style={{ fontSize: "1.8rem", marginBottom: "20px" }}
      >
        Latest Articles
      </h2>

      <div className="articles-feed">
        {others.map((art) => (
          <div key={art.id} className="article-row-card">
            <div className="article-row-left">
              {art.image_url && (
                <img
                  src={art.image_url}
                  alt={art.title}
                  className="article-row-img"
                />
              )}

              <div className="article-row-details">
                <h3 className="article-row-title">
                  <Link
                    to={`/article/${art.id}`}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {art.title}
                  </Link>
                </h3>

                <div className="article-row-meta">
                  <span>{art.category || "General"}</span>

                  <span>•</span>

                  <span>{art.read_time || "5 min"} read</span>

                  <span>•</span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <Eye size={12} />
                    {art.views || 0}
                  </span>

                  <span>•</span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <ThumbsUp size={12} />
                    {art.likes || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="article-row-right">
              <span
                className={`status-badge ${
                  art.status === "Published" ? "published" : "pending"
                }`}
              >
                {art.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;