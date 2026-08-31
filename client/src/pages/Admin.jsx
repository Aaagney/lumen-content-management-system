// Goes to: client/src/pages/Admin.jsx
import React, { useState } from "react";
import StatsCards from "../components/admin/StatsCards";
import ReviewQueue from "../components/admin/ReviewQueue";
import ArticleDetailPanel from "../components/admin/ArticleDetailPanel";
import {
  getReviewQueue,
  getStats,
  getArticleById,
  approveArticle,
  rejectArticle,
  requestChanges,
} from "../services/adminService";
import "../styles/admin.css";

export default function Admin() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const queue = getReviewQueue();
  const stats = getStats();
  const selectedArticle = selectedId ? getArticleById(selectedId) : null;

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleApprove = (id) => {
    approveArticle(id);
    setSelectedId(null);
    refresh();
  };

  const handleReject = (id, reason) => {
    rejectArticle(id, reason);
    setSelectedId(null);
    refresh();
  };

  const handleRequestChanges = (id, note) => {
    requestChanges(id, note);
    refresh();
  };

  return (
    <div className="admin-page" key={refreshKey}>
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
        <p>Review and moderate article submissions.</p>
      </div>

      <StatsCards stats={stats} />

      <div className="admin-review-layout">
        <ReviewQueue articles={queue} selectedId={selectedId} onSelect={setSelectedId} />
        <ArticleDetailPanel
          article={selectedArticle}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
        />
      </div>
    </div>
  );
}
