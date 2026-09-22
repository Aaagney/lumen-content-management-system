import React, { useState } from 'react';
import axios from 'axios';
import { Scale, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const COMMON_APPEAL_REASONS = [
  'Dispute Resolution Decision',
  'Factual Correction / Context Provided',
  'Misinterpretation of Content',
  'Accidental or False Flag',
  'Content Has Been Updated / Rectified',
  'Other Justification'
];

export default function AppealModal({ isOpen, onClose, report, onSuccess }) {
  const [reason, setReason] = useState(COMMON_APPEAL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedAppeal, setSubmittedAppeal] = useState(null);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = reason === 'Other Justification' ? customReason.trim() : reason;

    if (!finalReason) {
      setError('Please provide a reason for your appeal.');
      return;
    }

    if (!description.trim()) {
      setError('Please explain the basis of your appeal so administrators can re-evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:5000/api/appeals', {
        report_id: report.id,
        reason: finalReason,
        description: description.trim()
      });

      setSubmittedAppeal(res.data.appeal || res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit appeal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setReason(COMMON_APPEAL_REASONS[0]);
    setCustomReason('');
    setDescription('');
    setError(null);
    setSubmittedAppeal(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleResetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="icon-badge-amber">
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Submit an Appeal
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Request administrative review for Report #{report.id}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleResetAndClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submittedAppeal ? (
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DEF7EC', color: '#03543F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle size={28} />
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Appeal Registered</h4>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Your appeal has been submitted to senior administration. You can track updates and reviewer comments under My Appeals.
            </p>
            <button className="btn btn-primary" onClick={handleResetAndClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            {/* Reference banner */}
            <div style={{ background: '#FAF8F5', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>Reported Entity:</strong> {report.reported_type?.toUpperCase()} #{report.reported_id}</div>
              <div><strong>Original Flag Reason:</strong> {report.reason}</div>
              <div><strong>Current Status:</strong> <span className={`badge badge-${report.status?.toLowerCase().replace(' ', '-')}`}>{report.status}</span></div>
              {report.admin_note && (
                <div style={{ marginTop: '6px', color: '#666', fontStyle: 'italic' }}>
                  <strong>Admin Note:</strong> "{report.admin_note}"
                </div>
              )}
            </div>

            {error && (
              <div className="alert-banner alert-error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
              Reason for Appeal <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              className="select-field"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ marginBottom: reason === 'Other Justification' ? '8px' : '16px' }}
            >
              {COMMON_APPEAL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {reason === 'Other Justification' && (
              <input
                type="text"
                className="input-field"
                placeholder="Specify reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{ marginBottom: '16px' }}
              />
            )}

            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
              Explanation / Evidence <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              className="textarea-field"
              rows={4}
              placeholder="State clearly why this decision or report should be reconsidered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={600}
              style={{ minHeight: '100px', marginBottom: '4px' }}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#888', marginBottom: '20px' }}>
              {description.length}/600 characters
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleResetAndClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !description.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Scale size={16} />}
                {loading ? 'Submitting...' : 'Submit Appeal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
