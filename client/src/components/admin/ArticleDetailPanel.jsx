// Goes to: client/src/components/admin/ArticleDetailPanel.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, XCircle, HelpCircle, FileText } from "lucide-react";

const STATUS_LABELS = {
  pending: "Pending Review",
  changes_requested: "Changes Requested",
  published: "Published",
  rejected: "Rejected",
};

// "idle" = 3 action buttons | "reject" = rejection textarea | "changes" = change-request textarea
export default function ArticleDetailPanel({ article, onApprove, onReject, onRequestChanges }) {
  const [mode, setMode] = useState("idle");
  const [reasonText, setReasonText] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    setMode("idle");
    setReasonText("");
    setShowQuiz(false);
  }, [article?.id]);

  if (!article) {
    return (
      <div className="admin-detail-panel">
        <div className="admin-empty-state">
          <FileText size={40} />
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
    <div className="admin-detail-panel">
      <div className="admin-detail-cover">
        <img src={article.coverImage} alt={article.title} />
      </div>
      <div className="admin-detail-body">
        <div className="admin-detail-title-row">
          <h2>{article.title}</h2>
          <span className={`admin-status-badge ${article.status}`}>{STATUS_LABELS[article.status]}</span>
        </div>

        <div className="admin-meta admin-detail-meta">
          {article.author} · {article.category} · {article.readTime} read · Submitted {article.submittedDate}
        </div>

        <p className="admin-detail-excerpt">{article.excerpt}</p>

        {article.quiz.attached && (
          <div className="admin-quiz-chip" onClick={() => setShowQuiz((s) => !s)}>
            <HelpCircle size={15} /> Quiz attached — {article.quiz.questionCount} question
            {article.quiz.questionCount > 1 ? "s" : ""}
          </div>
        )}

        {showQuiz && article.quiz.attached && (
          <div className="admin-quiz-preview">
            <strong>Quiz preview</strong>
            <ol>
              {article.quiz.questions.map((q) => (
                <li key={q.id}>
                  {q.question}
                  <div className="admin-quiz-answer">Correct answer: {q.correctAnswer}</div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {article.reviewNote && (
          <div className="admin-review-note-box">
            <strong>{article.status === "rejected" ? "Reason for rejection" : "Requested changes"}:</strong>{" "}
            {article.reviewNote}
            {article.reviewedBy && (
              <div className="admin-review-note-meta">— {article.reviewedBy}, {article.reviewedDate}</div>
            )}
          </div>
        )}

        {canAct && mode === "idle" && (
          <div className="admin-action-row">
            <button className="admin-btn admin-btn-approve" onClick={() => onApprove(article.id)}>
              <CheckCircle2 size={16} /> Approve
            </button>
            <button className="admin-btn admin-btn-changes" onClick={() => setMode("changes")}>
              <RefreshCw size={16} /> Request Changes
            </button>
            <button className="admin-btn admin-btn-reject" onClick={() => setMode("reject")}>
              <XCircle size={16} /> Reject
            </button>
          </div>
        )}

        {canAct && mode === "changes" && (
          <div>
            <h3 className="admin-form-label">Describe required changes</h3>
            <textarea
              className="admin-reason-input"
              placeholder="Please expand the section on..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              autoFocus
            />
            <div className="admin-action-row admin-action-row-flat">
              <button className="admin-btn admin-btn-secondary" onClick={() => setMode("idle")}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-confirm" disabled={!reasonText.trim()} onClick={handleConfirmChanges}>
                Confirm Change Request
              </button>
            </div>
          </div>
        )}

        {canAct && mode === "reject" && (
          <div>
            <h3 className="admin-form-label">Reason for rejection</h3>
            <textarea
              className="admin-reason-input"
              placeholder="The article does not meet our standards because..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              autoFocus
            />
            <div className="admin-action-row admin-action-row-flat">
              <button className="admin-btn admin-btn-secondary" onClick={() => setMode("idle")}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-confirm" disabled={!reasonText.trim()} onClick={handleConfirmReject}>
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
