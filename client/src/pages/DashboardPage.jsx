import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="topbar-sub">Welcome back, Admin. Here's what's happening today.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Spam & Abuse Detection Module</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          This standalone build focuses on the <strong>Spam & Abuse Detection</strong> module —
          a self-contained backend + admin UI for detecting spam, duplicate content, suspicious
          links, and unusual account activity, with automatic risk scoring and moderation actions.
        </p>
        <Link to="/spam-abuse" className="btn primary" style={{ marginTop: 10, display: 'inline-flex' }}>
          Open Spam & Abuse Detection →
        </Link>
      </div>
    </div>
  );
}
