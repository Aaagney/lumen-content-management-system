import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ChevronRight, 
  X,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');

  // Drawer / Review Modal
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [actionStatus, setActionStatus] = useState('Approved');
  const [adminNote, setAdminNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchAppeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/appeals');
      setAppeals(res.data);
    } catch (err) {
      console.error('Error fetching admin appeals:', err);
      setError(err.response?.data?.message || 'Failed to load appeals queue. Ensure admin account is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const openAppealDetails = (appeal) => {
    setSelectedAppeal(appeal);
    setActionStatus(appeal.status === 'Pending' ? 'Under Review' : appeal.status);
    setAdminNote(appeal.admin_note || '');
    setActionSuccess(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppeal) return;

    setSubmittingAction(true);
    setActionSuccess(null);

    try {
      await axios.put(`http://localhost:5000/api/appeals/${selectedAppeal.id}/status`, {
        status: actionStatus,
        admin_note: adminNote.trim()
      });

      setActionSuccess(`Appeal #${selectedAppeal.id} updated to "${actionStatus}".`);

      const updated = appeals.map((a) => {
        if (a.id === selectedAppeal.id) {
          return {
            ...a,
            status: actionStatus,
            admin_note: adminNote.trim()
          };
        }
        return a;
      });
      setAppeals(updated);
      setSelectedAppeal((prev) => ({
        ...prev,
        status: actionStatus,
        admin_note: adminNote.trim()
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appeal status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Metrics
  const totalCount = appeals.length;
  const pendingCount = appeals.filter((a) => a.status === 'Pending').length;
  const underReviewCount = appeals.filter((a) => a.status === 'Under Review').length;
  const approvedCount = appeals.filter((a) => a.status === 'Approved').length;

  const filteredAppeals = appeals.filter((a) => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="container" style={{ maxWidth: '1200px', marginTop: '28px', marginBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="icon-badge-amber">
              <Scale size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.5px' }}>
              Appeals Management Queue
            </h1>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '15px' }}>
            Review user disputes and reconsideration requests for moderated content.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/reports" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View Reports Queue
          </Link>
          <button
            className="btn btn-primary"
            onClick={fetchAppeals}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="figma-stats-grid">
        <div className="figma-stat-card">
          <div className="figma-stat-label">TOTAL APPEALS</div>
          <div className="figma-stat-value">{totalCount}</div>
          <div className="figma-stat-subtext">Disputed moderation decisions</div>
        </div>

        <div className="figma-stat-card stat-pending">
          <div className="figma-stat-label">PENDING REVIEW</div>
          <div className="figma-stat-value text-amber">{pendingCount}</div>
          <div className="figma-stat-subtext text-amber">Appeals awaiting review</div>
        </div>

        <div className="figma-stat-card stat-under-review">
          <div className="figma-stat-label">UNDER REVIEW</div>
          <div className="figma-stat-value text-blue">{underReviewCount}</div>
          <div className="figma-stat-subtext text-blue">Appeals in active reconsideration</div>
        </div>

        <div className="figma-stat-card stat-resolved">
          <div className="figma-stat-label">APPROVED</div>
          <div className="figma-stat-value text-green">{approvedCount}</div>
          <div className="figma-stat-subtext text-green">Overturned / granted appeals</div>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error" style={{ margin: '20px 0' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs-container" style={{ marginTop: '24px', marginBottom: '16px' }}>
        {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
            {status === 'All' && ` (${appeals.length})`}
            {status !== 'All' && ` (${appeals.filter((a) => a.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Appellant</th>
              <th>Grounds for Appeal</th>
              <th>Linked Report</th>
              <th>Submitted</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                  <RefreshCw size={20} className="spin" style={{ marginBottom: '8px' }} />
                  <div>Loading appeals...</div>
                </td>
              </tr>
            ) : filteredAppeals.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                  No appeals currently found matching this status.
                </td>
              </tr>
            ) : (
              filteredAppeals.map((appeal) => (
                <tr key={appeal.id} className={selectedAppeal?.id === appeal.id ? 'row-selected' : ''}>
                  <td style={{ fontWeight: 700, color: '#64748B' }}>
                    #{appeal.id}
                  </td>
                  <td>
                    <span className={`badge badge-${appeal.status.toLowerCase().replace(' ', '-')}`}>
                      {appeal.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={appeal.appellant_avatar || 'https://via.placeholder.com/24'}
                        alt=""
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{appeal.appellant_name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1E293B' }}>
                      {appeal.reason}
                    </div>
                    {appeal.description && (
                      <div style={{ fontSize: '12px', color: '#64748B', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {appeal.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#475569' }}>
                      Report #{appeal.report_id} ({appeal.reported_type})
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {new Date(appeal.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openAppealDetails(appeal)}
                      style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Review <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Drawer / Modal */}
      {selectedAppeal && (
        <div className="modal-backdrop" onClick={() => setSelectedAppeal(null)}>
          <div className="modal-content drawer-style" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-badge-amber">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                    Appeal #{selectedAppeal.id} Review
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Disputing Report #{selectedAppeal.report_id} • Filed on {new Date(selectedAppeal.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedAppeal(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', maxHeight: 'calc(85vh - 70px)', overflowY: 'auto' }}>
              {actionSuccess && (
                <div className="alert-banner alert-success" style={{ marginBottom: '16px' }}>
                  <CheckCircle size={16} />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Status Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Current Appeal Status</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge badge-${selectedAppeal.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedAppeal.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Appellant</span>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {selectedAppeal.appellant_name} ({selectedAppeal.appellant_role})
                  </div>
                </div>
              </div>

              {/* Appellant Ground & Explanation */}
              <div className="detail-section">
                <div className="detail-section-title">
                  <Scale size={15} />
                  <span>Appellant Grounds & Argument</span>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A', marginBottom: '6px' }}>
                    {selectedAppeal.reason}
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {selectedAppeal.description || 'No detailed statement provided.'}
                  </p>
                </div>
              </div>

              {/* Linked Original Report */}
              <div className="detail-section" style={{ marginTop: '20px' }}>
                <div className="detail-section-title">
                  <FileText size={15} />
                  <span>Original Report #{selectedAppeal.report_id} Summary</span>
                </div>
                <div style={{ background: '#FAF8F5', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginTop: '8px', fontSize: '13px' }}>
                  <div><strong>Entity Type:</strong> {selectedAppeal.reported_type?.toUpperCase()} #{selectedAppeal.reported_id}</div>
                  <div><strong>Report Reason:</strong> {selectedAppeal.report_reason}</div>
                  <div><strong>Report Status:</strong> {selectedAppeal.report_status}</div>
                  {selectedAppeal.report_description && (
                    <div style={{ marginTop: '6px', color: '#64748B' }}>
                      <strong>Reporter Note:</strong> "{selectedAppeal.report_description}"
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Action Form */}
              <form onSubmit={handleStatusUpdate} style={{ marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Resolution Decision</h4>

                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  Set Appeal Status
                </label>
                <select
                  className="select-field"
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved (Grant appeal & overturn / adjust)</option>
                  <option value="Rejected">Rejected (Uphold original moderation decision)</option>
                </select>

                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  Administrator Response Note
                </label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="Explain the appeal determination to the user..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{ minHeight: '80px', marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedAppeal(null)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingAction}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {submittingAction ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={14} />}
                    {submittingAction ? 'Saving...' : 'Confirm Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
