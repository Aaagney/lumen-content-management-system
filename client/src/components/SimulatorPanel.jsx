import { useState } from 'react';
import Badge from './Badge.jsx';
import { spamApi } from '../services/api.js';

const PRESETS = [
  {
    label: 'Normal post (expect LOW)',
    userId: 'demo-user-1',
    userName: 'Demo User',
    contentType: 'post',
    text: 'Just finished reading a great book on marine biology, highly recommend it.'
  },
  {
    label: 'Promotional + shortened link (expect HIGH)',
    userId: 'demo-user-2',
    userName: 'Demo Spammer',
    contentType: 'comment',
    text: 'Buy now! Limited offer! Click here for free money http://bit.ly/xyz123'
  },
  {
    label: 'Multiple suspicious links (expect HIGH)',
    userId: 'demo-user-3',
    userName: 'Link Farmer',
    contentType: 'post',
    text: 'Check these out http://192.168.10.5/promo http://bit.ly/abc http://tinyurl.com/def'
  },
  {
    label: 'Duplicate content (submit twice, expect FLAG on 2nd)',
    userId: 'demo-user-4',
    userName: 'Repeat Poster',
    contentType: 'post',
    text: 'Check out my amazing product deal today, dont miss out'
  }
];

export default function SimulatorPanel({ onAnalyzed, notify }) {
  const [userId, setUserId] = useState('demo-user-1');
  const [userName, setUserName] = useState('Demo User');
  const [contentType, setContentType] = useState('post');
  const [text, setText] = useState('Just finished reading a great book on marine biology, highly recommend it.');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState(null);

  function applyPreset(preset) {
    setUserId(preset.userId);
    setUserName(preset.userName);
    setContentType(preset.contentType);
    setText(preset.text);
    setResult(null);
    setResultError(null);
  }

  async function handleSubmit() {
    setBusy(true);
    setResult(null);
    setResultError(null);
    try {
      const submit = contentType === 'comment' ? spamApi.submitComment : spamApi.submitPost;
      const data = await submit({ userId, userName, text });
      setResult(data);
      notify?.('Content analyzed', 'success');
      onAnalyzed?.();
    } catch (err) {
      if (err?.response?.status === 403) {
        setResult(err.response.data);
        notify?.(err.response.data.error, 'error');
      } else {
        setResultError('Request failed. Is the backend running on port 5050?');
        notify?.('Request failed', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  const detection = result?.detection;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Test the Detector</h2>
        <div className="filters-bar">
          {PRESETS.map((p) => (
            <button key={p.label} className="btn sm" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="simulator-grid">
        <div>
          <div className="form-row">
            <label>User ID</label>
            <input className="input" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div className="form-row">
            <label>User Name</label>
            <input className="input" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Content Type</label>
            <select className="select" value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option value="post">Post</option>
              <option value="comment">Comment</option>
            </select>
          </div>
          <div className="form-row">
            <label>Content Text</label>
            <textarea className="input" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <button className="btn primary" disabled={busy || !userId || !text} onClick={handleSubmit}>
            {busy ? 'Analyzing…' : 'Submit for Analysis'}
          </button>
        </div>

        <div>
          <div className="form-row">
            <label>Result</label>
          </div>
          {!result && !resultError && (
            <div className="result-box">
              <div className="cell-sub">Submit content on the left to see the live risk assessment here.</div>
            </div>
          )}
          {resultError && <div className="error-banner">{resultError}</div>}
          {result?.error && !detection && (
            <div className="result-box">
              <div className="error-banner" style={{ marginBottom: 10 }}>{result.error}</div>
              {result.restriction && (
                <div className="cell-sub">
                  Restriction active until {new Date(result.restriction.endTime).toLocaleString()}
                </div>
              )}
            </div>
          )}
          {detection && (
            <div className="result-box">
              <div className="modal-grid" style={{ marginBottom: 12 }}>
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
                  <div className="kv-label">Content Status</div>
                  <div className="kv-value">{result.content?.status || detection.status}</div>
                </div>
              </div>
              {detection.reasons?.length > 0 && (
                <>
                  <div className="kv-label" style={{ marginBottom: 6 }}>Reasons</div>
                  <ul className="reason-list">
                    {detection.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </>
              )}
              {detection.reasons?.length === 0 && (
                <div className="cell-sub">No risk signals detected — content looked clean.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
