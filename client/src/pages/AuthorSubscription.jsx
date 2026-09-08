import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  CreditCard, 
  RefreshCw,
  Zap,
  Award,
  BookOpen
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/subscribe';

export default function AuthorSubscription({ currentRole = 'Priya Mehta (author)' }) {
  // Extract Author info based on current active role
  const isAuthor = currentRole.includes('(author)');
  const isReader = currentRole.includes('(reader)');
  const isAdmin = currentRole.includes('(admin)');
  
  // Mapping demo author names to IDs
  const getAuthorId = (roleStr) => {
    if (roleStr.includes('Priya')) return '1';
    if (roleStr.includes('Thomas')) return '2';
    if (roleStr.includes('Amara')) return '3';
    return '1';
  };

  const authorId = getAuthorId(currentRole);
  const authorName = currentRole.replace(/\s*\([^)]*\)/, '');

  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [subStatus, setSubStatus] = useState('None');
  const [remainingDays, setRemainingDays] = useState(0);
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [selectedPlanForSub, setSelectedPlanForSub] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Fetch plans, status, and history
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [plansRes, statusRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/plans`),
        axios.get(`${API_BASE}/status/${authorId}`).catch(() => ({ data: { hasActiveSubscription: false, status: 'None' } })),
        axios.get(`${API_BASE}/history/${authorId}`).catch(() => ({ data: { history: [] } })),
      ]);

      if (plansRes.data?.plans) {
        setPlans(plansRes.data.plans);
      }

      if (statusRes.data?.hasActiveSubscription) {
        setActiveSub(statusRes.data.subscription);
        setSubStatus(statusRes.data.status);
        setRemainingDays(statusRes.data.remainingDays || 0);
      } else {
        setActiveSub(null);
        setSubStatus('None');
        setRemainingDays(0);
      }

      if (historyRes.data?.history) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error('Error loading subscription data:', err);
      showToast('error', 'Could not load subscription details. Please verify backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Subscribe Action
  const handleConfirmSubscribe = async () => {
    if (!selectedPlanForSub) return;

    try {
      setActionLoading(true);
      const res = await axios.post(`${API_BASE}/${authorId}`, {
        plan: selectedPlanForSub.name,
        authorName: authorName,
        duration: selectedPlanForSub.duration || '1 Month',
      });

      showToast('success', res.data.message || `Successfully subscribed to ${selectedPlanForSub.name}!`);
      setSelectedPlanForSub(null);
      await fetchData();
    } catch (err) {
      console.error('Subscription error:', err);
      const msg = err.response?.data?.message || 'Failed to complete subscription. Please try again.';
      showToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Action
  const handleConfirmCancel = async () => {
    try {
      setActionLoading(true);
      const res = await axios.delete(`${API_BASE}/${authorId}`);

      showToast('success', res.data.message || 'Your subscription has been cancelled.');
      setShowCancelModal(false);
      await fetchData();
    } catch (err) {
      console.error('Cancellation error:', err);
      const msg = err.response?.data?.message || 'Failed to cancel subscription.';
      showToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container">
      {/* Toast feedback banner */}
      {toast && (
        <div className={`toast-banner toast-${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'info' && <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="sub-hero">
        <div className="sub-eyebrow">
          <Sparkles size={14} /> Author Membership Tiers
        </div>
        <h1 className="sub-title">Author Subscriptions & Publishing Plans</h1>
        <p className="sub-subtitle">
          Supercharge your author profile with higher publishing limits, priority editorial reviews,
          interactive quiz attachments, and direct reader monetization.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid var(--border-color)', padding: '6px 16px', borderRadius: '24px', marginTop: '20px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Current Author:</span>
          <strong>{authorName}</strong>
          <span className="badge badge-published" style={{ textTransform: 'capitalize' }}>
            {isAuthor ? 'Author Account' : isReader ? 'Reader (Preview Mode)' : 'Admin'}
          </span>
        </div>
      </div>

      {/* Reader Notice if current role is reader */}
      {isReader && (
        <div className="toast-banner toast-info" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <div>
              <strong>Note for Readers:</strong> You are currently browsing as a reader. Author subscription plans are designed for content authors. Switch your role to an Author in the top right to test author publishing privileges.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. CURRENT ACTIVE SUBSCRIPTION SECTION
          ========================================================================= */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px' }}>Loading subscription details...</p>
        </div>
      ) : activeSub && subStatus === 'Active' ? (
        <div className="active-sub-banner">
          <div className="active-sub-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-active">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#03543F' }}></span>
                  ACTIVE SUBSCRIPTION
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Ref: {activeSub.transactionId || 'LUMEN-SUB'}
                </span>
              </div>
              <h2 style={{ fontSize: '28px', margin: '0 0 6px', color: 'var(--brand-green)' }}>
                {activeSub.plan} Author Tier
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
                Subscribed by <strong>{activeSub.authorName || authorName}</strong> • {activeSub.currency}{activeSub.price} {activeSub.duration || '/month'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                className="btn btn-danger-outline" 
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          <div className="active-sub-details-grid">
            <div className="active-sub-metric">
              <div className="active-sub-metric-label">Billing Cycle</div>
              <div className="active-sub-metric-val">{activeSub.currency}{activeSub.price} / month</div>
            </div>
            <div className="active-sub-metric">
              <div className="active-sub-metric-label">Start Date</div>
              <div className="active-sub-metric-val">{formatDate(activeSub.startDate)}</div>
            </div>
            <div className="active-sub-metric">
              <div className="active-sub-metric-label">Renewal / Expiry Date</div>
              <div className="active-sub-metric-val">{formatDate(activeSub.endDate)}</div>
            </div>
            <div className="active-sub-metric">
              <div className="active-sub-metric-label">Time Remaining</div>
              <div className="active-sub-metric-val" style={{ color: 'var(--brand-green)' }}>
                {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'} Left
              </div>
            </div>
          </div>

          {activeSub.features && activeSub.features.length > 0 && (
            <div style={{ marginTop: '16px', background: '#FAF8F5', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--brand-green)', display: 'block', marginBottom: '8px' }}>
                Included Plan Privileges:
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                {activeSub.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <Check size={14} color="#1E3A2B" /> {feat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '28px', textAlign: 'center', marginBottom: '48px' }}>
          <ShieldCheck size={36} color="var(--brand-green)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '20px' }}>No Active Subscription</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            You are currently on the free author tier. Choose a plan below to activate verified author perks and priority publishing.
          </p>
        </div>
      )}

      {/* =========================================================================
          2. SUBSCRIPTION PLANS SECTION
          ========================================================================= */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '26px', margin: '0 0 4px' }}>Available Author Plans</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
              Select a tier that fits your publishing goals. Upgrade or cancel anytime.
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={fetchData}
            title="Refresh plans and status"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => {
            const isCurrentPlan = activeSub && activeSub.status === 'Active' && activeSub.plan.toLowerCase() === plan.name.toLowerCase();

            return (
              <div 
                key={plan.id} 
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    Most Popular
                  </div>
                )}

                <div className="pricing-card-header">
                  <div className="pricing-tagline">{plan.tagline}</div>
                  <h3 className="pricing-plan-name">{plan.name}</h3>
                  <div className="pricing-desc">{plan.description}</div>

                  <div className="pricing-price-box">
                    <span className="pricing-currency">{plan.currency}</span>
                    <span className="pricing-price">{plan.price}</span>
                    <span className="pricing-period">{plan.period}</span>
                  </div>
                </div>

                <ul className="pricing-features-list">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="pricing-feature-item">
                      <CheckCircle size={16} className="pricing-feature-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  {isCurrentPlan ? (
                    <button 
                      className="btn btn-secondary" 
                      disabled 
                      style={{ width: '100%', cursor: 'default', background: '#DEF7EC', color: '#03543F', borderColor: '#BCF0DA' }}
                    >
                      <Check size={16} /> Current Plan
                    </button>
                  ) : (
                    <button 
                      className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ width: '100%' }}
                      onClick={() => setSelectedPlanForSub(plan)}
                    >
                      <span>Subscribe to {plan.name}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. SUBSCRIPTION HISTORY SECTION
          ========================================================================= */}
      <div className="history-container">
        <div className="history-header">
          <div>
            <h2 style={{ fontSize: '22px', margin: '0 0 4px' }}>Subscription History</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
              Past membership records, renewals, and invoices for <strong>{authorName}</strong>.
            </p>
          </div>
          <span className="badge badge-draft">
            {history.length} {history.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            No previous subscription history found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Plan Tier</th>
                  <th>Transaction ID</th>
                  <th>Billed Amount</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => {
                  const statusClass = 
                    item.status === 'Active' ? 'badge-active' :
                    item.status === 'Cancelled' ? 'badge-cancelled' : 'badge-expired';

                  return (
                    <tr key={item._id || index}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{item.plan}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.duration || 'Monthly'}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>
                          {item.transactionId || 'TXN-' + (index + 101)}
                        </span>
                      </td>
                      <td>
                        <strong>{item.currency || '$'}{item.price}</strong>
                      </td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>{formatDate(item.endDate)}</td>
                      <td>
                        <span className={`badge ${statusClass}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. CONFIRM SUBSCRIBE MODAL
          ========================================================================= */}
      {selectedPlanForSub && (
        <div className="modal-overlay" onClick={() => !actionLoading && setSelectedPlanForSub(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} color="var(--brand-green)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '22px' }}>Confirm Subscription</h3>
              </div>
              <button 
                onClick={() => setSelectedPlanForSub(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                disabled={actionLoading}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#FAF8F5', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedPlanForSub.name} Plan</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--brand-green)' }}>
                  {selectedPlanForSub.currency}{selectedPlanForSub.price} <small style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>/month</small>
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {selectedPlanForSub.description}
              </p>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Author:</span>
                  <strong>{authorName} (ID: {authorId})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                  <strong>30 Days (Instant Activation)</strong>
                </div>
              </div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', color: '#1E40AF', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} />
              <span>Academic demo project — no real credit card charge will occur.</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedPlanForSub(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmSubscribe}
                disabled={actionLoading}
              >
                {actionLoading ? 'Activating...' : `Confirm & Activate ${selectedPlanForSub.name}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. CONFIRM CANCELLATION MODAL
          ========================================================================= */}
      {showCancelModal && activeSub && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#DC2626' }}>
              <AlertCircle size={28} />
              <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--text-primary)' }}>Cancel Subscription?</h3>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to cancel your <strong>{activeSub.plan}</strong> subscription? 
              You will lose access to priority editorial review, quiz attachments, and author badges.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
              >
                Keep My Subscription
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmCancel}
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
