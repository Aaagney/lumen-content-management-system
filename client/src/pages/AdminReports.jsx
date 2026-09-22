import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Bot, 
  FileText, 
  MessageSquare, 
  User, 
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected report for review modal / drawer
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionStatus, setActionStatus] = useState('Resolved');
  const [adminNote, setAdminNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // AI simulation controls (for testing Phase 3 AI moderation readiness)
  const [simulateAi, setSimulateAi] = useState(false);
  const [simRiskScore, setSimRiskScore] = useState(78);
  const [simRiskLevel, setSimRiskLevel] = useState('High');
  const [simAiResult, setSimAiResult] = useState('Flagged');
  const [simAiReason, setSimAiReason] = useState('Content contains toxic harassment markers.');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      setError(err.response?.data?.message || 'Access denied or failed to load reports. Make sure an admin account is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setActionStatus(report.status === 'Pending' ? 'Under Review' : report.status);
    setAdminNote(report.admin_note || '');
    setActionSuccess(null);
    setSimulateAi(false);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmittingAction(true);
    setActionSuccess(null);

    const payload = {
      status: actionStatus,
      admin_note: adminNote.trim()
    };

    if (simulateAi) {
      payload.risk_score = parseFloat(simRiskScore);
      payload.risk_level = simRiskLevel;
      payload.ai_result = simAiResult;
      payload.ai_reason = simAiReason;
    }

    try {
      await axios.put(`http://localhost:5000/api/reports/${selectedReport.id}/status`, payload);
      setActionSuccess(`Report #${selectedReport.id} successfully updated to "${actionStatus}".`);

      // Refresh list and selected report
      const updatedList = reports.map((r) => {
        if (r.id === selectedReport.id) {
          return {
            ...r,
            status: actionStatus,
            admin_note: adminNote.trim(),
            ...(simulateAi ? {
              risk_score: parseFloat(simRiskScore),
              risk_level: simRiskLevel,
              ai_result: simAiResult,
              ai_reason: simAiReason
            } : {})
          };
        }
        return r;
      });
      setReports(updatedList);
      setSelectedReport((prev) => ({
        ...prev,
        status: actionStatus,
        admin_note: adminNote.trim(),
        ...(simulateAi ? {
          risk_score: parseFloat(simRiskScore),
          risk_level: simRiskLevel,
          ai_result: simAiResult,
          ai_reason: simAiReason
        } : {})
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Metrics summary
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved' || r.status === 'Rejected').length;

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (typeFilter !== 'All' && r.reported_type !== typeFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchReporter = r.reporter_name?.toLowerCase().includes(q);
      const matchReason = r.reason?.toLowerCase().includes(q);
      const matchTitle = r.entity_details?.title?.toLowerCase().includes(q);
      const matchSnippet = r.entity_details?.snippet?.toLowerCase().includes(q);
      const matchUserName = r.entity_details?.name?.toLowerCase().includes(q);
      if (!matchReporter && !matchReason && !matchTitle && !matchSnippet && !matchUserName) {
        return false;
      }
    }
    return true;
  });

  const getEntityIcon = (type) => {
    if (type === 'article') return <FileText size={15} />;
    if (type === 'comment') return <MessageSquare size={15} />;
    if (type === 'user') return <User size={15} />;
    return <ShieldAlert size={15} />;
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', marginTop: '28px', marginBottom: '80px' }}>
      {/* Header matching Figma Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="icon-badge-admin">
              <ShieldAlert size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.5px' }}>
              Moderation Dashboard & Reports
            </h1>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '15px' }}>
            Review flagged articles, comments, and users. Manage statuses and AI moderation checkpoints.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/appeals" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View Appeals Queue
          </Link>
          <button
            className="btn btn-primary"
            onClick={fetchReports}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* 4 Metric Stats Cards (Figma slate dark counters) */}
      <div className="figma-stats-grid">
        <div className="figma-stat-card">
          <div className="figma-stat-label">TOTAL REPORTS</div>
          <div className="figma-stat-value">{totalCount}</div>
          <div className="figma-stat-subtext">Cumulative moderation requests</div>
        </div>

        <div className="figma-stat-card stat-pending">
          <div className="figma-stat-label">PENDING ACTION</div>
          <div className="figma-stat-value text-amber">{pendingCount}</div>
          <div className="figma-stat-subtext text-amber">Immediate review required</div>
        </div>

        <div className="figma-stat-card stat-under-review">
          <div className="figma-stat-label">UNDER REVIEW</div>
          <div className="figma-stat-value text-blue">{underReviewCount}</div>
          <div className="figma-stat-subtext text-blue">Currently being investigated</div>
        </div>

        <div className="figma-stat-card stat-resolved">
          <div className="figma-stat-label">ACTIONED / RESOLVED</div>
          <div className="figma-stat-value text-green">{resolvedCount}</div>
          <div className="figma-stat-subtext text-green">Closed moderation tickets</div>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error" style={{ margin: '20px 0' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Control bar: Search + Filters */}
      <div className="control-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', margin: '24px 0 16px 0' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by reporter, reason, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ margin: 0, paddingLeft: '36px' }}
            />
          </div>

          <select
            className="select-field"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="All">All Types</option>
            <option value="Article">Articles</option>
            <option value="Comment">Comments</option>
            <option value="User">Users</option>
          </select>
        </div>

        {/* Status Filter Pills */}
        <div className="filter-tabs-container" style={{ margin: 0 }}>
          {['All', 'Pending', 'Under Review', 'Resolved', 'Rejected'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Report Queue Table / Card List */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Reported Entity</th>
              <th>Reason</th>
              <th>Reporter</th>
              <th>AI Risk (Placeholder)</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                  <RefreshCw size={20} className="spin" style={{ marginBottom: '8px' }} />
                  <div>Loading reports queue...</div>
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                  No reports found matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className={selectedReport?.id === report.id ? 'row-selected' : ''}>
                  <td style={{ fontWeight: 700, color: '#64748B' }}>
                    #{report.id}
                  </td>
                  <td>
                    <span className={`badge badge-${report.status.toLowerCase().replace(' ', '-')}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="entity-badge">
                        {getEntityIcon(report.reported_type)}
                        <span style={{ textTransform: 'capitalize' }}>{report.reported_type}</span>
                      </span>
                      <div style={{ fontWeight: 600, fontSize: '13px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.entity_details?.title || report.entity_details?.snippet || report.entity_details?.name || `Item #${report.reported_id}`}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '13px' }}>
                      {report.reason}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={report.reporter_avatar || 'https://via.placeholder.com/24'}
                        alt=""
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '13px' }}>{report.reporter_name}</span>
                    </div>
                  </td>
                  <td>
                    {report.risk_level ? (
                      <span className={`risk-pill risk-${report.risk_level.toLowerCase()}`}>
                        {report.risk_score ? `${report.risk_score}%` : ''} {report.risk_level}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                        Unscored
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openReportDetails(report)}
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

      {/* Report Review & Action Drawer / Modal */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-content drawer-style" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-badge-admin">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                    Report #{selectedReport.id} Moderation Details
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Filed on {new Date(selectedReport.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>
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
                  <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge badge-${selectedReport.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Violation Flag</span>
                  <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '14px' }}>
                    {selectedReport.reason}
                  </div>
                </div>
              </div>

              {/* Reported Target Section */}
              <div className="detail-section">
                <div className="detail-section-title">
                  {getEntityIcon(selectedReport.reported_type)}
                  <span>Reported {selectedReport.reported_type.toUpperCase()}</span>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
                  {selectedReport.reported_type === 'article' && (
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                        {selectedReport.entity_details?.title || `Article #${selectedReport.reported_id}`}
                      </div>
                      {selectedReport.entity_details?.subtitle && (
                        <p style={{ margin: '0 0 10px 0', color: '#64748B', fontSize: '14px' }}>
                          {selectedReport.entity_details.subtitle}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                        <span>Author: {selectedReport.entity_details?.author_name || 'Author'}</span>
                        <Link to={`/article/${selectedReport.reported_id}`} target="_blank" style={{ color: '#0F766E', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          View Article in New Tab <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {selectedReport.reported_type === 'comment' && (
                    <div>
                      <div style={{ fontStyle: 'italic', fontSize: '14px', color: '#1E293B', marginBottom: '10px', background: '#F1F5F9', padding: '10px', borderRadius: '6px' }}>
                        "{selectedReport.entity_details?.snippet || 'Comment content'}"
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                        <span>Commenter: {selectedReport.entity_details?.author_name || 'User'}</span>
                        {selectedReport.entity_details?.article_id && (
                          <Link to={`/article/${selectedReport.entity_details.article_id}`} target="_blank" style={{ color: '#0F766E', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            Go to Article <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedReport.reported_type === 'user' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <img
                          src={selectedReport.entity_details?.avatar || 'https://via.placeholder.com/48'}
                          alt=""
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{selectedReport.entity_details?.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Role: {selectedReport.entity_details?.role}</div>
                        </div>
                      </div>
                      <Link to={`/profile/${selectedReport.reported_id}`} target="_blank" style={{ color: '#0F766E', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '13px' }}>
                        View User Profile <ExternalLink size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Reporter's Submission */}
              <div className="detail-section" style={{ marginTop: '20px' }}>
                <div className="detail-section-title">
                  <User size={15} />
                  <span>Reporter Details & Claim</span>
                </div>
                <div style={{ background: '#FAF8F5', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginTop: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <img
                      src={selectedReport.reporter_avatar || 'https://via.placeholder.com/24'}
                      alt=""
                      style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                    />
                    <strong style={{ color: '#1E293B' }}>{selectedReport.reporter_name}</strong>
                    <span style={{ color: '#64748B', fontSize: '12px' }}>({selectedReport.reporter_role})</span>
                  </div>
                  <div>
                    <strong>Report Note:</strong>{' '}
                    <span style={{ color: '#334155' }}>
                      {selectedReport.description ? `"${selectedReport.description}"` : 'No additional text provided.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI MODERATION PLACEHOLDER SECTION (Figma design element) */}
              <div className="ai-placeholder-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={18} color="#2563EB" />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>
                      AI Moderation Assessment
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    Phase 3 Integration Placeholder
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Risk Score</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                      {selectedReport.risk_score !== null && selectedReport.risk_score !== undefined
                        ? `${selectedReport.risk_score}%`
                        : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Risk Level</div>
                    <div style={{ marginTop: '4px' }}>
                      {selectedReport.risk_level ? (
                        <span className={`risk-pill risk-${selectedReport.risk_level.toLowerCase()}`}>
                          {selectedReport.risk_level}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
                  <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '2px' }}>
                    AI Automated Result: {selectedReport.ai_result || 'Pending AI Moderation Module'}
                  </div>
                  <div>
                    {selectedReport.ai_reason || 'This placeholder is prepared for future AI Content Moderation & Smart Approval modules.'}
                  </div>
                </div>

                {/* Optional test toggler to simulate AI placeholder metrics */}
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSimulateAi(!simulateAi)}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', cursor: 'pointer', padding: 0, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={13} />
                    {simulateAi ? 'Hide AI Simulation Fields' : 'Simulate / Set AI Placeholder Values (Testing)'}
                  </button>

                  {simulateAi && (
                    <div style={{ marginTop: '10px', background: '#EFF6FF', padding: '12px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 600 }}>Risk Score (0-100)</label>
                          <input
                            type="number"
                            className="input-field"
                            style={{ margin: '2px 0 0 0', padding: '6px 8px' }}
                            value={simRiskScore}
                            onChange={(e) => setSimRiskScore(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 600 }}>Risk Level</label>
                          <select
                            className="select-field"
                            style={{ margin: '2px 0 0 0', padding: '6px 8px' }}
                            value={simRiskLevel}
                            onChange={(e) => setSimRiskLevel(e.target.value)}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>AI Result</label>
                        <select
                          className="select-field"
                          style={{ margin: '2px 0 0 0', padding: '6px 8px' }}
                          value={simAiResult}
                          onChange={(e) => setSimAiResult(e.target.value)}
                        >
                          <option value="Clean">Clean</option>
                          <option value="Needs Review">Needs Review</option>
                          <option value="Flagged">Flagged</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>AI Reason Explanation</label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ margin: '2px 0 0 0', padding: '6px 8px' }}
                          value={simAiReason}
                          onChange={(e) => setSimAiReason(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Action Form */}
              <form onSubmit={handleStatusUpdate} style={{ marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Take Moderation Action</h4>

                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  Update Status
                </label>
                <select
                  className="select-field"
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved (Take down / reprimand / verify)</option>
                  <option value="Rejected">Rejected (Dismiss report as unfounded)</option>
                </select>

                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  Moderator Note / Explanation
                </label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="Explain rationale for this decision. This note will be visible to the reporter..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{ minHeight: '80px', marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedReport(null)}
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
                    {submittingAction ? 'Updating...' : 'Save Decision & Update Status'}
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
