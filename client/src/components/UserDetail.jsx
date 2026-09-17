import React from 'react';
import { UserCheck, Edit3, ShieldAlert, ShieldCheck, Shield, AlertCircle, FileText, Calendar, Mail, Award, CheckCircle2 } from 'lucide-react';

export default function UserDetail({
  user,
  history,
  loadingDetail,
  onOpenUpdateModal,
  onChangeStatus
}) {
  if (!user && !loadingDetail) {
    return (
      <div className="detail-panel empty-detail-state">
        <div className="empty-icon-wrap">
          <FileText size={32} />
        </div>
        <h3 className="empty-title">Select a user to review</h3>
        <p className="empty-desc">
          Click on any user from the directory to inspect their trust score, positive contributions, violations, and full reputation timeline.
        </p>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div className="detail-panel empty-detail-state">
        <div className="empty-icon-wrap">
          <UserCheck size={32} />
        </div>
        <h3 className="empty-title">Loading User Details...</h3>
        <p className="empty-desc">Fetching reputation score and history from MySQL database.</p>
      </div>
    );
  }

  const getTrustClass = (level) => {
    switch (level) {
      case 'Trusted':
        return 'trusted';
      case 'Low Trust':
        return 'low-trust';
      default:
        return 'normal';
    }
  };

  const getTrustLevelBadgeColor = (level) => {
    switch (level) {
      case 'Trusted':
        return { bg: '#E8F5E9', text: '#1B5E20', border: '#C8E6C9' };
      case 'Low Trust':
        return { bg: '#FFEBEE', text: '#B71C1C', border: '#FFCDD2' };
      default:
        return { bg: '#FFF8E1', text: '#8D5B00', border: '#FFE0B2' };
    }
  };

  const trustClass = getTrustClass(user.trust_level);
  const badgeStyle = getTrustLevelBadgeColor(user.trust_level);

  // Calculate percentage width for gauge
  const scorePercent = Math.max(0, Math.min(100, user.trust_score));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="detail-panel">
      {/* Header Banner */}
      <div className="detail-header-card">
        <div className="detail-user-profile">
          <div className={`detail-avatar-large ${trustClass}`}>
            {user.avatar_initials || user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="detail-name">{user.name}</h2>
            <div className="detail-sub">
              <span>{user.role}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={13} /> {user.email}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> Joined {user.joined_date || '2026'}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <select
            className="filter-select"
            value={user.account_status}
            onChange={(e) => onChangeStatus && onChangeStatus(user.id, e.target.value)}
            style={{ fontWeight: 600 }}
            title="Change Account Status"
          >
            <option value="Active">Active Account</option>
            <option value="Under Review">Under Review</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenUpdateModal}
          >
            <Edit3 size={15} />
            <span>Update Reputation</span>
          </button>
        </div>
      </div>

      {/* Trust Score & Gauge Box */}
      <div className="trust-score-card">
        <div className="trust-gauge-header">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Current Trust Standing
            </div>
            <div className="score-display-box">
              <span className="big-score-num">{user.trust_score}</span>
              <span className="max-score-text">/ 100</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              className="status-badge"
              style={{
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.text,
                borderColor: badgeStyle.border,
                fontSize: '13px',
                padding: '6px 14px'
              }}
            >
              {user.trust_level === 'Trusted' && <ShieldCheck size={15} />}
              {user.trust_level === 'Normal' && <Shield size={15} />}
              {user.trust_level === 'Low Trust' && <ShieldAlert size={15} />}
              {user.trust_level}
            </span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {user.trust_level === 'Trusted' && 'Eligible for auto-publishing'}
              {user.trust_level === 'Normal' && 'Standard editorial review'}
              {user.trust_level === 'Low Trust' && 'Restricted posting permissions'}
            </div>
          </div>
        </div>

        {/* Visual Gauge Bar */}
        <div className="gauge-bar-wrapper">
          <div className="gauge-track">
            <div
              className={`gauge-fill ${trustClass}`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <div className="gauge-markers">
            <span>0 Low Trust</span>
            <span style={{ marginLeft: '30%' }}>50 Normal</span>
            <span style={{ marginLeft: '15%' }}>80 Trusted</span>
            <span>100</span>
          </div>
        </div>

        {/* 3 Metric Breakdown Boxes */}
        <div className="breakdown-grid">
          <div className="breakdown-box">
            <span className="breakdown-label">Positive Contributions</span>
            <span className="breakdown-val" style={{ color: '#2E7D32' }}>
              +{user.positive_contributions}
            </span>
          </div>

          <div className="breakdown-box">
            <span className="breakdown-label">Confirmed Violations</span>
            <span className="breakdown-val" style={{ color: user.violations > 0 ? '#C62828' : 'var(--text-main)' }}>
              {user.violations}
            </span>
          </div>

          <div className="breakdown-box">
            <span className="breakdown-label">Reports Received</span>
            <span className="breakdown-val" style={{ color: user.reports_received > 0 ? '#E65100' : 'var(--text-main)' }}>
              {user.reports_received}
            </span>
          </div>
        </div>
      </div>

      {/* Reputation History Timeline Section */}
      <div className="history-section">
        <div className="history-header">
          <h3 className="history-title">
            Reputation Activity History ({history.length})
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Chronological audit log
          </span>
        </div>

        <div className="history-timeline">
          {history.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No reputation actions logged yet for this user.
            </div>
          ) : (
            history.map((item) => {
              const isPositive = item.points > 0;
              const isZero = item.points === 0;

              return (
                <div key={item.id} className="history-item">
                  <div className="history-left">
                    <div className="history-action-line">
                      <span className="history-action-name">{item.action}</span>
                    </div>
                    <p className="history-reason">{item.reason}</p>
                    <span className="history-date">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <div className="history-right">
                    <span className={`points-pill ${isPositive ? 'positive' : isZero ? 'neutral' : 'negative'}`}>
                      {isPositive ? `+${item.points}` : item.points} pts
                    </span>
                    <span className="score-transition">
                      {item.previous_score} → {item.new_score}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
