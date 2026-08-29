// components/ReviewQueue.jsx
import React from "react";

const STATUS_LABELS = {
  pending: "Pending Review",
  changes_requested: "Changes Requested",
  published: "Published",
  rejected: "Rejected",
};

export default function ReviewQueue({ articles, selectedId, onSelect }) {
  return (
    <div>
      <div className="queue-heading">REVIEW QUEUE ({articles.length})</div>
      <div className="queue-list">
        {articles.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>
            Nothing waiting on review right now.
          </p>
        )}
        {articles.map((article) => (
          <div
            key={article.id}
            className={`queue-card ${selectedId === article.id ? "active" : ""}`}
            onClick={() => onSelect(article.id)}
          >
            <div>
              <h3>{article.title}</h3>
              <div className="meta">
                {article.author} · {article.category} · {article.readTime}
              </div>
            </div>
            <span className={`status-badge ${article.status}`}>
              {STATUS_LABELS[article.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
