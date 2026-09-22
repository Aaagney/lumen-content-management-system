import { useEffect, useState } from 'react';
import Badge from './Badge.jsx';
import { spamApi } from '../services/api.js';
import { formatDateTime } from '../utils/format.js';

const SIGNAL_LABELS = {
  duplicateContent: 'Duplicate content',
  excessiveActivity: 'Excessive activity',
  repeatedPosting: 'Repeated posting',
  suspiciousLinks: 'Suspicious links',
  excessiveLinks: 'Excessive links',
  promotionalContent: 'Promotional content',
  repeatedDomain: 'Repeated domain',
  previousViolations: 'Previous violations'
};

export default function DetectionDetailModal({ detectionId, onClose, onChanged, notify }) {
  const [detection, setDetection] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await spamApi.getDetection(detectionId);
      setDetection(d);
      const a = await spamApi.getUserActivity(d.userId);
      setActivity(a);
    } catch (err) {
      notify?.('Failed to load detection details', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectionId]);

  async function handleAction(action) {
    setBusy(true);
    try {
      await spamApi.takeAction(detectionId, { action, reason: reason || undefined, adminId: 'admin' });
      notify?.(`Detection marked as ${action}`, 'success');
      await load();
      onChanged?.();
    } catch (err) {
      notify?.(err?.response?.data?.error || 'Action failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveRestriction() {
    if (!detection) return;
    setBusy(true);
    try {
      await spamApi.unrestrictUser(detection.userId, { adminId: 'admin' });
      notify?.('Restriction removed', 'success');
      await load();
      onChanged?.();
    } catch (err) {
      notify?.('Failed to remove restriction', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Detection Details</h2>
            {detection && <div className="kv-label">{detection.contentType?.toUpperCase()} · {detection.id.slice(0, 8)}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {loading && <div className="loading-state">Loading details…</div>}

        {!loading && detection && (
          <>
            <div className="modal-section">
              <h3>Overview</h3>
              <div className="modal-grid">
                <div>
                  <div className="kv-label">User</div>
                  <div className="kv-value">{detection.userName} <span className="cell-sub">({detection.userId})</span></div>
                </div>
                <div>
                  <div className="kv-label">Detected</div>
                  <div className="kv-value">{formatDateTime(detection.createdAt)}</div>
                </div>
                <div>
                  <div className="kv-label">Risk Score</div>
                  <div className="kv-value">{detection.riskScore} / 100</div>
                </div>
                <div>
                  <div className="kv-label">Risk Level</div>
                  <div className="kv-value"><Badge value={detection.riskLevel} /></div>
                </div>
                <div>
                  <div className="kv-label">Action</div>
                  <div className="kv-value"><Badge value={detection.action} /></div>
                </div>
                <div>
                  <div className="kv-label">Status</div>
                  <div className="kv-value"><Badge value={detection.status} /></div>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Content</h3>
              <div className="content-preview">{detection.text}</div>
            </div>

            <div className="modal-section">
              <h3>Reasons</h3>
              {detection.reasons?.length ? (
                <ul className="reason-list">
                  {detection.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              ) : (
                <div className="cell-sub">No risk reasons — content looked clean.</div>
              )}
            </div>

            <div className="modal-section">
              <h3>Detected Signals</h3>
              <div className="signal-chip-row">
                {Object.entries(SIGNAL_LABELS).map(([key, label]) => (
                  <span key={key} className={`signal-chip${detection.signals?.[key] ? ' active' : ''}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {detection.matchedContentId && (
              <div className="modal-section">
                <h3>Duplicate Match</h3>
                <div className="modal-grid">
                  <div>
                    <div className="kv-label">Matched Content ID</div>
                    <div className="kv-value">{detection.matchedContentId.slice(0, 8)}…</div>
                  </div>
                  <div>
                    <div className="kv-label">Similarity Score</div>
                    <div className="kv-value">{Math.round((detection.similarityScore || 0) * 100)}%</div>
                  </div>
                </div>
              </div>
            )}

            {detection.suspiciousUrls?.length > 0 && (
              <div className="modal-section">
                <h3>Suspicious URLs</h3>
                <ul className="link-list">
                  {detection.suspiciousUrls.map((u, i) => (
                    <li key={i}>
                      {u.isIpBased && <span className="link-flag">IP</span>}
                      {u.isShortened && <span className="link-flag">SHORTENED</span>}
                      {u.isObfuscated && <span className="link-flag">OBFUSCATED</span>}
                      {u.url}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activity && (
              <div className="modal-section">
                <h3>Recent Activity ({detection.userName})</h3>
                <div className="modal-grid">
                  <div>
                    <div className="kv-label">Total content submitted</div>
                    <div className="kv-value">{activity.summary.totalContentSubmitted}</div>
                  </div>
                  <div>
                    <div className="kv-label">Previous violations (HIGH)</div>
                    <div className="kv-value">{activity.summary.highRiskCount}</div>
                  </div>
                  <div>
                    <div className="kv-label">Currently restricted</div>
                    <div className="kv-value">{activity.summary.isCurrentlyRestricted ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="kv-label">Blocked items</div>
                    <div className="kv-value">{activity.summary.blockedCount}</div>
                  </div>
                </div>
              </div>
            )}

            {detection.auditHistory?.length > 0 && (
              <div className="modal-section">
                <h3>Action History</h3>
                {detection.auditHistory.map((a) => (
                  <div className="audit-item" key={a.id}>
                    <div>
                      <div className="audit-action">{a.action}</div>
                      <div className="cell-sub">{a.reason}</div>
                    </div>
                    <div className="audit-time">{formatDateTime(a.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-section">
              <h3>Admin Action</h3>
              <input
                className="input"
                style={{ width: '100%', marginBottom: 10 }}
                placeholder="Optional note / reason for this action"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn success" disabled={busy} onClick={() => handleAction('ALLOW')}>Allow</button>
                <button className="btn warn" disabled={busy} onClick={() => handleAction('WARN')}>Warn</button>
                <button className="btn danger" disabled={busy} onClick={() => handleAction('BLOCK')}>Block</button>
                <button className="btn" disabled={busy} onClick={() => handleAction('RESTRICT')}>Temporarily Restrict</button>
                {activity?.summary?.isCurrentlyRestricted && (
                  <button className="btn" disabled={busy} onClick={handleRemoveRestriction}>Remove Restriction</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
