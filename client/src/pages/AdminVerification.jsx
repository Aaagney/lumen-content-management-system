import React, { useEffect, useState } from 'react';
import http from '../api/http';

const ACTIONS = [
  { status: 'Approved', label: 'Approve', className: 'btn-primary' },
  { status: 'Changes Requested', label: 'Request Changes', className: 'btn-secondary' },
  { status: 'Rejected', label: 'Reject', className: 'btn-secondary', danger: true },
];

export default function AdminVerification() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});
  const [actingId, setActingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchPending = () => {
    setLoading(true);
    setError('');
    http.get('/api/admin/articles/pending')
      .then(res => setArticles(res.data))
      .catch(err => setError(err.response?.data?.message || 'Could not load pending articles.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (articleId, status) => {
    setActingId(articleId);
    setFeedback('');
    setError('');
    try {
      await http.put(`/api/admin/articles/${articleId}/status`, {
        status,
        admin_note: notes[articleId] || undefined,
      });
      setFeedback(`Article ${status.toLowerCase()}.`);
      fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update article status.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="container">
      <h1>Admin Verification</h1>
      <p style={{ color: '#666' }}>Review articles submitted for publication.</p>

      {feedback && <p style={{ color: '#03543F', background: '#DEF7EC', padding: '10px 14px', borderRadius: '6px' }}>{feedback}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading && <p style={{ color: '#888' }}>Loading pending articles...</p>}

      {!loading && articles.length === 0 && !error && (
        <p style={{ color: '#888' }}>No articles are currently pending review.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {articles.map(art => {
          const expanded = expandedId === art.id;
          return (
            <div key={art.id} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-pending-review">{art.status}</span>
                  <h3 style={{ margin: '8px 0 0 0' }}>{art.title}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                    by {art.author_name} · {art.category_name} · {art.read_time} min read
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={() => setExpandedId(expanded ? null : art.id)}>
                  {expanded ? 'Hide' : 'Review'}
                </button>
              </div>

              {expanded && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  {art.subtitle && <p style={{ color: '#555', fontStyle: 'italic' }}>{art.subtitle}</p>}
                  <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#333', whiteSpace: 'pre-line', maxHeight: '260px', overflowY: 'auto' }}>
                    {art.content}
                  </div>

                  <label style={{ marginTop: '16px', display: 'block' }}>Admin note (optional)</label>
                  <textarea
                    className="textarea-field"
                    style={{ minHeight: '80px' }}
                    placeholder="Feedback for the author..."
                    value={notes[art.id] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [art.id]: e.target.value }))}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {ACTIONS.map(action => (
                      <button
                        key={action.status}
                        className={`btn ${action.className}`}
                        style={action.danger ? { color: 'crimson' } : undefined}
                        disabled={actingId === art.id}
                        onClick={() => handleAction(art.id, action.status)}
                      >
                        {actingId === art.id ? 'Saving...' : action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
