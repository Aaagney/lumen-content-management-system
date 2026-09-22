import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flag, Clock, MessageSquare, User, FileText, Scale, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppealModal from '../components/AppealModal';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedReportForAppeal, setSelectedReportForAppeal] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Could not load your reports. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  const getEntityIcon = (type) => {
    if (type === 'article') return <FileText size={16} />;
    if (type === 'comment') return <MessageSquare size={16} />;
    if (type === 'user') return <User size={16} />;
    return <Flag size={16} />;
  };

  return (
    <div className="container" style={{ maxWidth: '860px', marginTop: '32px', marginBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>My Submitted Reports</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
            Track the status and moderation outcomes of content you've flagged.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchReports}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-container">
        {['All', 'Pending', 'Under Review', 'Resolved', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
            {status === 'All' && ` (${reports.length})`}
            {status !== 'All' && ` (${reports.filter((r) => r.status === status).length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert-banner alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '12px' }} />
          <div>Loading your reports...</div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state-card">
          <Flag size={36} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No reports found</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {filterStatus === 'All'
              ? "You haven't submitted any reports yet."
              : `You have no reports currently marked as "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="entity-badge">
                    {getEntityIcon(report.reported_type)}
                    <span style={{ textTransform: 'capitalize' }}>{report.reported_type}</span>
                  </span>
                  <span className={`badge badge-${report.status.toLowerCase().replace(' ', '-')}`}>
                    {report.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888' }}>
                  <Clock size={13} />
                  <span>{new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Target Entity Snippet */}
              <div style={{ margin: '14px 0 10px 0' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Reported Item:</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                  {report.entity_details?.title && (
                    <Link to={`/article/${report.reported_id}`} style={{ color: '#0F766E', textDecoration: 'none' }}>
                      "{report.entity_details.title}"
                    </Link>
                  )}
                  {report.entity_details?.snippet && (
                    <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: '#334155' }}>
                      "{report.entity_details.snippet}"
                    </span>
                  )}
                  {report.entity_details?.name && (
                    <Link to={`/profile/${report.reported_id}`} style={{ color: '#0F766E', textDecoration: 'none' }}>
                      @{report.entity_details.name} ({report.entity_details.role})
                    </Link>
                  )}
                  {!report.entity_details && (
                    <span style={{ color: '#888' }}>#{report.reported_id} ({report.reported_type})</span>
                  )}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', margin: '10px 0' }}>
                <div><strong style={{ color: '#1E293B' }}>Reason:</strong> {report.reason}</div>
                {report.description && (
                  <div style={{ marginTop: '6px', color: '#475569' }}>
                    <strong style={{ color: '#1E293B' }}>Your Note:</strong> "{report.description}"
                  </div>
                )}
              </div>

              {/* Admin Note Box */}
              {report.admin_note && (
                <div className="admin-note-callout">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: '#1E3A2B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <span>Editorial Moderator Response</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#1A1A1A' }}>
                    "{report.admin_note}"
                  </div>
                </div>
              )}

              {/* Appeal Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedReportForAppeal(report)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <Scale size={14} /> Appeal Decision
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReportForAppeal && (
        <AppealModal
          isOpen={!!selectedReportForAppeal}
          onClose={() => setSelectedReportForAppeal(null)}
          report={selectedReportForAppeal}
          onSuccess={fetchReports}
        />
      )}
    </div>
  );
}
