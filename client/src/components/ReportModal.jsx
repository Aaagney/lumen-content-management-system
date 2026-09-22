import React, { useState } from 'react';
import axios from 'axios';
import { Flag, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const REPORT_REASONS = [
  { value: 'Spam', label: 'Spam', desc: 'Promotional content, scams, or repetitive posts' },
  { value: 'Harassment', label: 'Harassment', desc: 'Disparaging, bullying, or intimidating remarks' },
  { value: 'Hate Speech', label: 'Hate Speech', desc: 'Attacks on identity, discrimination, or slurs' },
  { value: 'Inappropriate Content', label: 'Inappropriate Content', desc: 'Explicit, offensive, or graphic material' },
  { value: 'Suspicious Link', label: 'Suspicious Link', desc: 'Phishing, malware, or deceptive redirects' },
  { value: 'Misinformation', label: 'Misinformation', desc: 'Verifiably false claims or conspiracy theories' },
  { value: 'Privacy / Personal Information', label: 'Privacy / Personal Information', desc: 'Doxxing or unconsented private data' },
  { value: 'Other', label: 'Other', desc: 'Any other violation of Lumen community guidelines' }
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType, // 'article' | 'comment' | 'user'
  targetId,
  targetTitle = ''
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for the report.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:5000/api/reports', {
        reported_type: targetType,
        reported_id: parseInt(targetId, 10),
        reason,
        description: description.trim()
      });

      setSubmittedReport(res.data.report || res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit report. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setReason('');
    setDescription('');
    setError(null);
    setSubmittedReport(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleResetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="icon-badge-red">
              <Flag size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Report {targetType ? targetType.charAt(0).toUpperCase() + targetType.slice(1) : 'Content'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Help us maintain a safe and insightful publishing community
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleResetAndClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submittedReport ? (
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DEF7EC', color: '#03543F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle size={28} />
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Report Received</h4>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Thank you for reporting this {targetType}. Our moderation team reviews all flagged items in accordance with our editorial integrity guidelines.
            </p>
            <div style={{ background: '#FAF8F5', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
              <div><strong>Report ID:</strong> #{submittedReport.id}</div>
              <div><strong>Reason:</strong> {submittedReport.reason}</div>
              <div><strong>Status:</strong> <span className="badge badge-pending">Pending Review</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={handleResetAndClose}>
                Close
              </button>
              <Link to="/my-reports" className="btn btn-primary" onClick={handleResetAndClose} style={{ textDecoration: 'none' }}>
                View My Reports
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            {targetTitle && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#475569' }}>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Target: </span>
                <span style={{ fontStyle: 'italic' }}>"{targetTitle.length > 80 ? targetTitle.substring(0, 80) + '...' : targetTitle}"</span>
              </div>
            )}

            {error && (
              <div className="alert-banner alert-error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
              Why are you reporting this {targetType}? <span style={{ color: '#DC2626' }}>*</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: reason === r.value ? '2px solid var(--brand-green)' : '1px solid var(--border-color)',
                    background: reason === r.value ? '#F2F9F5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
              Additional Details <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '12px' }}>(Optional)</span>
            </label>
            <textarea
              className="textarea-field"
              rows={3}
              placeholder="Provide extra context, links, or timestamps that help us review this..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              style={{ minHeight: '80px', marginBottom: '4px' }}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#888', marginBottom: '20px' }}>
              {description.length}/500 characters
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleResetAndClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !reason}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Flag size={16} />}
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
