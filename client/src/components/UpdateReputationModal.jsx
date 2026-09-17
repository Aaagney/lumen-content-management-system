import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Shield, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';

const PRESETS = [
  {
    id: 'pos_contrib',
    label: 'Positive Contribution',
    action: 'Positive Contribution',
    points: 10,
    category: 'positive',
    defaultReason: 'Helpful community participation / peer review completed'
  },
  {
    id: 'approved_content',
    label: 'Approved Quality Content',
    action: 'Approved Quality Content',
    points: 5,
    category: 'positive',
    defaultReason: 'High quality article submission passed editorial review'
  },
  {
    id: 'minor_warn',
    label: 'Minor Warning',
    action: 'Minor Violation',
    points: -5,
    category: 'violation',
    defaultReason: 'Formatting issues or unverified references detected'
  },
  {
    id: 'confirmed_violation',
    label: 'Confirmed Violation',
    action: 'Confirmed Violation',
    points: -15,
    category: 'violation',
    defaultReason: 'Plagiarism, copyright issue, or hostile behavior confirmed'
  },
  {
    id: 'spam_abuse',
    label: 'Spam & Abuse Penalty',
    action: 'Spam & Abuse Violation',
    points: -25,
    category: 'violation',
    defaultReason: 'Automated spam links, scam promotions, or malicious content'
  },
  {
    id: 'confirmed_report',
    label: 'Confirmed User Report',
    action: 'Confirmed User Report',
    points: -10,
    category: 'report',
    defaultReason: 'User report verified and upheld by moderation team'
  },
  {
    id: 'custom',
    label: 'Custom Adjustment',
    action: 'Administrative Score Adjustment',
    points: 0,
    category: 'custom',
    defaultReason: ''
  }
];

export default function UpdateReputationModal({
  user,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) {
  if (!isOpen || !user) return null;

  const [selectedPresetId, setSelectedPresetId] = useState('pos_contrib');
  const [actionName, setActionName] = useState('Positive Contribution');
  const [points, setPoints] = useState(10);
  const [reason, setReason] = useState('Helpful community participation / peer review completed');
  const [actionCategory, setActionCategory] = useState('positive');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setActionName(preset.action);
    setPoints(preset.points);
    setReason(preset.defaultReason);
    setActionCategory(preset.category);
    setErrorMsg('');
  };

  const currentScore = user.trust_score || 0;
  const calculatedNewScore = Math.max(0, Math.min(100, currentScore + Number(points || 0)));

  const getCalculatedLevel = (score) => {
    if (score >= 80) return 'Trusted';
    if (score >= 50) return 'Normal';
    return 'Low Trust';
  };

  const newTrustLevel = getCalculatedLevel(calculatedNewScore);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!actionName.trim()) {
      setErrorMsg('Please specify an action name.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for the reputation change.');
      return;
    }

    onSubmit({
      action: actionName.trim(),
      points: Number(points),
      reason: reason.trim(),
      actionCategory
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Record Reputation Action</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Target User: <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && (
            <div style={{ padding: '8px 12px', background: '#FFEBEE', color: '#C62828', borderRadius: '6px', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          {/* Quick Presets */}
          <div className="form-group">
            <label className="form-label">Action Presets</label>
            <div className="preset-pills">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`preset-pill ${selectedPresetId === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(p)}
                >
                  {p.points > 0 ? `+${p.points}` : p.points < 0 ? p.points : '±'} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="action-name">Action Title</label>
            <input
              id="action-name"
              type="text"
              className="form-input"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              placeholder="e.g. Approved Quality Content, Confirmed Violation..."
              required
            />
          </div>

          {/* Points input */}
          <div className="form-group">
            <label className="form-label" htmlFor="points-input">
              Points Adjustment (use negative numbers for penalties)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                id="points-input"
                type="number"
                className="form-input"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min="-100"
                max="100"
                required
                style={{ width: '120px', fontWeight: 700 }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {points > 0 ? `Adds +${points} to user trust score` : points < 0 ? `Deducts ${Math.abs(points)} points from trust score` : 'No score change'}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label className="form-label" htmlFor="reason-textarea">Reason / Audit Log Note</label>
            <textarea
              id="reason-textarea"
              className="form-textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context on why this score adjustment was applied..."
              required
            />
          </div>

          {/* Live Score Preview */}
          <div className="score-preview-box">
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Score Projection
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{currentScore}</span>
                <span>→</span>
                <span className="preview-score-text" style={{ fontSize: '18px', color: calculatedNewScore >= 80 ? '#2E7D32' : calculatedNewScore >= 50 ? '#D97706' : '#C62828' }}>
                  {calculatedNewScore} / 100
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Projected Standing
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: newTrustLevel === 'Trusted' ? '#2E7D32' : newTrustLevel === 'Normal' ? '#D97706' : '#C62828'
              }}>
                {newTrustLevel}
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving to MySQL...' : 'Confirm & Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
