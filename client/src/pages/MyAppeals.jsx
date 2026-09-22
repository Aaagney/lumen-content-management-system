import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale, Clock, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchAppeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/appeals');
      setAppeals(res.data);
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Could not load your appeals. Please check that you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const filteredAppeals = appeals.filter((a) => {
    if (filterStatus === 'All') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="container" style={{ maxWidth: '860px', marginTop: '32px', marginBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>My Appeals</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
            Review status updates and decisions on moderation appeals you have submitted.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchAppeals}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-container">
        {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
            {status === 'All' && ` (${appeals.length})`}
            {status !== 'All' && ` (${appeals.filter((a) => a.status === status).length})`}
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
          <div>Loading your appeals...</div>
        </div>
      ) : filteredAppeals.length === 0 ? (
        <div className="empty-state-card">
          <Scale size={36} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No appeals found</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {filterStatus === 'All'
              ? "You haven't filed any moderation appeals yet."
              : `You have no appeals currently marked as "${filterStatus}".`}
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/my-reports" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              View My Reports to Appeal
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAppeals.map((appeal) => (
            <div key={appeal.id} className="report-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>Appeal #{appeal.id}</span>
                  <span style={{ color: '#666', fontSize: '13px' }}>on Report #{appeal.report_id}</span>
                  <span className={`badge badge-${appeal.status.toLowerCase().replace(' ', '-')}`}>
                    {appeal.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888' }}>
                  <Clock size={13} />
                  <span>{new Date(appeal.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Appeal Details */}
              <div style={{ margin: '14px 0 10px 0' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Grounds for Appeal:</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                  {appeal.reason}
                </div>
                {appeal.description && (
                  <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
                    {appeal.description}
                  </p>
                )}
              </div>

              {/* Reference to original report */}
              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
                <strong>Linked Report:</strong> {appeal.reported_type?.toUpperCase()} #{appeal.reported_id} • Original Flag: {appeal.report_reason}
              </div>

              {/* Admin Note / Response */}
              {appeal.admin_note && (
                <div className={`admin-note-callout ${appeal.status === 'Approved' ? 'callout-success' : appeal.status === 'Rejected' ? 'callout-error' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {appeal.status === 'Approved' ? <CheckCircle2 size={14} color="#059669" /> : appeal.status === 'Rejected' ? <XCircle size={14} color="#DC2626" /> : null}
                    <span>Administrator Resolution</span>
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    "{appeal.admin_note}"
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
