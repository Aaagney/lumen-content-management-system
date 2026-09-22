import { useCallback, useEffect, useState } from 'react';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import Toast from '../components/Toast.jsx';
import DetectionDetailModal from '../components/DetectionDetailModal.jsx';
import SimulatorPanel from '../components/SimulatorPanel.jsx';
import { spamApi } from '../services/api.js';
import { timeAgo, truncate } from '../utils/format.js';

const PAGE_SIZE = 8;

export default function SpamAbusePage() {
  const [stats, setStats] = useState(null);
  const [detections, setDetections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [contentType, setContentType] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState(null);

  function notify(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const loadStats = useCallback(async () => {
    try {
      const data = await spamApi.getStats();
      setStats(data);
    } catch (err) {
      // stats failing shouldn't block the table
    }
  }, []);

  const loadDetections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (search) params.search = search;
      if (riskLevel) params.riskLevel = riskLevel;
      if (contentType) params.contentType = contentType;
      if (status) params.status = status;
      if (dateFrom) params.from = dateFrom;

      const data = await spamApi.getDetections(params);
      setDetections(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load detections. Is the backend server running on port 5050?');
    } finally {
      setLoading(false);
    }
  }, [page, search, riskLevel, contentType, status, dateFrom]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadDetections();
  }, [loadDetections]);

  function refreshAll() {
    loadStats();
    loadDetections();
  }

  function resetFiltersPage(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Spam & Abuse Detection</h1>
          <div className="topbar-sub">Automated content risk analysis and moderation</div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Total Detections" value={stats?.totalDetections ?? '—'} />
        <StatCard label="Spam Posts" value={stats?.spamPosts ?? '—'} tone="orange" />
        <StatCard label="Spam Comments" value={stats?.spamComments ?? '—'} tone="orange" />
        <StatCard label="Suspicious Links" value={stats?.suspiciousLinks ?? '—'} tone="red" />
        <StatCard label="Restricted Users" value={stats?.restrictedUsers ?? '—'} tone="red" />
      </div>

      <SimulatorPanel onAnalyzed={refreshAll} notify={notify} />

      <div className="panel">
        <div className="panel-header">
          <h2>Detections</h2>
          <div className="filters-bar">
            <input
              className="input search"
              placeholder="Search user or content…"
              value={search}
              onChange={(e) => resetFiltersPage(setSearch)(e.target.value)}
            />
            <select className="select" value={riskLevel} onChange={(e) => resetFiltersPage(setRiskLevel)(e.target.value)}>
              <option value="">All Risk Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select className="select" value={contentType} onChange={(e) => resetFiltersPage(setContentType)(e.target.value)}>
              <option value="">All Types</option>
              <option value="post">Post</option>
              <option value="comment">Comment</option>
            </select>
            <select className="select" value={status} onChange={(e) => resetFiltersPage(setStatus)(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="ALLOWED">Allowed</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="WARNED">Warned</option>
            </select>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => resetFiltersPage(setDateFrom)(e.target.value)}
            />
          </div>
        </div>

        {loading && <div className="loading-state">Loading detections…</div>}

        {!loading && detections.length === 0 && !error && (
          <div className="empty-state">No detections match your filters.</div>
        )}

        {!loading && detections.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Content</th>
                  <th>Type</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Reason</th>
                  <th>Action</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detections.map((d) => (
                  <tr key={d.id} onClick={() => setSelectedId(d.id)}>
                    <td>
                      <div className="cell-user">{d.userName}</div>
                      <div className="cell-sub">{d.userId}</div>
                    </td>
                    <td className="cell-content" title={d.text}>{truncate(d.text, 50)}</td>
                    <td>{d.contentType}</td>
                    <td>{d.riskScore}</td>
                    <td><Badge value={d.riskLevel} /></td>
                    <td className="cell-content" title={d.reasons?.join('; ')}>
                      {truncate(d.reasons?.[0] || '—', 40)}
                      {d.reasons?.length > 1 && ` +${d.reasons.length - 1}`}
                    </td>
                    <td><Badge value={d.action} /></td>
                    <td className="cell-sub">{timeAgo(d.createdAt)}</td>
                    <td><Badge value={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
            <button className="btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button className="btn sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {selectedId && (
        <DetectionDetailModal
          detectionId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={refreshAll}
          notify={notify}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
