// Goes to: client/src/components/admin/ReviewQueue.jsx
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
      <div className="admin-queue-heading">REVIEW QUEUE ({articles.length})</div>
      <div className="admin-queue-list">
        {articles.length === 0 && (
          <p className="admin-muted">Nothing waiting on review right now.</p>
        )}
        {articles.map((article) => (
          <div
            key={article.id}
            className={`admin-queue-card ${selectedId === article.id ? "active" : ""}`}
            onClick={() => onSelect(article.id)}
          >
            <div>
              <h3>{article.title}</h3>
              <div className="admin-meta">
                {article.author} · {article.category} · {article.readTime}
              </div>
            </div>
            <span className={`admin-status-badge ${article.status}`}>{STATUS_LABELS[article.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
