// components/AdminDashboard.jsx
import React, { useState } from "react";
import StatsCards from "./StatsCards";
import ReviewQueue from "./ReviewQueue";
import ArticleDetailPanel from "./ArticleDetailPanel";
import {
  getReviewQueue,
  getStats,
  getArticleById,
  approveArticle,
  rejectArticle,
  requestChanges,
} from "../services/adminService";
import "../styles/admin.css";

export default function AdminDashboard() {
  // refreshKey forces a re-read from adminService after every action,
  // since the mock data lives outside React state.
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const queue = getReviewQueue();
  const stats = getStats();
  const selectedArticle = selectedId ? getArticleById(selectedId) : null;

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleApprove = (id) => {
    approveArticle(id);
    refresh();
  };

  const handleReject = (id, reason) => {
    rejectArticle(id, reason);
    refresh();
  };

  const handleRequestChanges = (id, note) => {
    requestChanges(id, note);
    refresh();
  };

  return (
    <div className="admin-module" key={refreshKey}>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Review and moderate article submissions.</p>
      </div>

      <StatsCards stats={stats} />

      <div className="review-layout">
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
