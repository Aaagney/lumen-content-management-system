// components/ArticleDetailPanel.jsx
import React, { useState, useEffect } from "react";

const STATUS_LABELS = {
  pending: "Pending Review",
  changes_requested: "Changes Requested",
  published: "Published",
  rejected: "Rejected",
};

// "idle" = showing the 3 action buttons
// "reject" / "changes" = showing the reason textarea for that action
export default function ArticleDetailPanel({ article, onApprove, onReject, onRequestChanges }) {
  const [mode, setMode] = useState("idle");
  const [reasonText, setReasonText] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  // reset local UI state whenever a different article is selected
  useEffect(() => {
    setMode("idle");
    setReasonText("");
    setShowQuiz(false);
  }, [article?.id]);

  if (!article) {
    return (
      <div className="detail-panel">
        <div className="empty-state">
          <p>Select an article to review</p>
        </div>
      </div>
    );
  }

  const canAct = article.status === "pending" || article.status === "changes_requested";

  const handleConfirmReject = () => {
    onReject(article.id, reasonText);
    setMode("idle");
    setReasonText("");
  };

  const handleConfirmChanges = () => {
    onRequestChanges(article.id, reasonText);
    setMode("idle");
    setReasonText("");
  };

  return (
    <div className="detail-panel">
      <div className="detail-cover">{article.coverImage}</div>
      <div className="detail-body">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2>{article.title}</h2>
          <span className={`status-badge ${article.status}`}>
            {STATUS_LABELS[article.status]}
          </span>
        </div>

        <div className="detail-meta">
          {article.author} · {article.category} · {article.readTime} read · Submitted{" "}
          {article.submittedDate}
        </div>

        <p className="detail-excerpt">{article.excerpt}</p>

        {article.quiz.attached && (
          <div className="quiz-chip" onClick={() => setShowQuiz((s) => !s)}>
            ❓ Quiz attached — {article.quiz.questionCount} question
            {article.quiz.questionCount > 1 ? "s" : ""}
          </div>
        )}

        {showQuiz && article.quiz.attached && (
          <div className="quiz-preview">
            <strong>Quiz preview</strong>
            <ol>
              {article.quiz.questions.map((q) => (
                <li key={q.id}>
                  {q.question}
                  <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                    Correct answer: {q.correctAnswer}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {article.reviewNote && (
          <div className="review-note-box">
            <strong>
              {article.status === "rejected" ? "Reason for rejection" : "Requested changes"}:
            </strong>{" "}
            {article.reviewNote}
            {article.reviewedBy && (
              <div style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
                — {article.reviewedBy}, {article.reviewedDate}
              </div>
            )}
          </div>
        )}

        {canAct && mode === "idle" && (
          <div className="action-row">
            <button className="btn btn-approve" onClick={() => onApprove(article.id)}>
              ✓ Approve
            </button>
            <button className="btn btn-changes" onClick={() => setMode("changes")}>
              ↻ Request Changes
            </button>
            <button className="btn btn-reject" onClick={() => setMode("reject")}>
              ✕ Reject
            </button>
          </div>
        )}

        {canAct && mode === "changes" && (
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 8 }}>Describe required changes</h3>
            <textarea
              className="reason-input"
              placeholder="Please expand the section on..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
            <div className="action-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setMode("idle")}>
                Cancel
              </button>
              <button
                className="btn btn-changes"
                disabled={!reasonText.trim()}
                onClick={handleConfirmChanges}
              >
                Confirm Change Request
              </button>
            </div>
          </div>
        )}

        {canAct && mode === "reject" && (
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 8 }}>Reason for rejection</h3>
            <textarea
              className="reason-input"
              placeholder="The article does not meet our standards because..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
            <div className="action-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setMode("idle")}>
                Cancel
              </button>
              <button
                className="btn btn-reject"
                disabled={!reasonText.trim()}
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
