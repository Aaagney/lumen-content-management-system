import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import http from '../api/http';

export default function WriteArticle() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(!!editId);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (editId) {
      http.get(`/api/articles/${editId}`)
        .then(res => {
          setTitle(res.data.title);
          setSubtitle(res.data.subtitle || '');
          setCategoryId(res.data.category_id || 1);
          setContent(res.data.content);
          setCoverImage(res.data.cover_image || '');
          setStatus(res.data.status);
        })
        .catch(err => {
          console.error("Failed to fetch article:", err);
          setLoadError(err.response?.data?.message || 'Could not load the article for editing.');
        })
        .finally(() => setLoadingArticle(false));
    }
  }, [editId]);

  const handleSubmit = (nextStatus) => {
    // Parse categoryId as an integer to prevent MySQL type errors.
    // Note: the backend always determines the author from the logged-in
    // user's JWT (req.user.id) — it no longer accepts an author_id here,
    // so this request requires a stored auth token (see api/http.js and
    // the /write route's ProtectedRoute wrapper in App.jsx).
    const payload = {
      title,
      subtitle,
      category_id: parseInt(categoryId),
      content,
      cover_image: coverImage,
      status: nextStatus
    };

    setSaving(true);
    setSaveError('');

    const request = editId
      ? http.put(`/api/articles/${editId}`, payload)
      : http.post('/api/articles', payload);

    request
      .then(() => navigate('/profile'))
      .catch(error => {
        console.error('Server failed to save article:', error);
        setSaveError(error.response?.data?.message || 'Failed to save article.');
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <h1>{editId ? 'Edit Article' : 'New Article'}</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Draft your post and submit for review once ready.</p>

      {loadingArticle && <p style={{ color: '#888' }}>Loading article...</p>}
      {loadError && <p style={{ color: 'crimson' }}>{loadError}</p>}

      {!loadingArticle && !loadError && (
        <>
          {status && (
            <span className={`badge badge-${status.toLowerCase().replace(/\s+/g, '-')}`} style={{ marginBottom: '16px' }}>
              {status}
            </span>
          )}

          <label>Title</label>
          <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter article title..." />

          <label>Subtitle / Excerpt</label>
          <input type="text" className="input-field" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Short summary..." />

          <label>Category</label>
          <select className="select-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value={1}>Science</option>
            <option value={2}>Technology</option>
            <option value={3}>Environment</option>
            <option value={4}>Health</option>
            <option value={5}>History</option>
          </select>

          <label>Cover Image URL</label>
          <input type="text" className="input-field" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />

          <label>Content</label>
          <textarea className="textarea-field" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your full story here..."></textarea>

          {saveError && <p style={{ color: 'crimson', fontSize: '14px' }}>{saveError}</p>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn btn-secondary" disabled={saving} onClick={() => handleSubmit('Draft')}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button className="btn btn-primary" disabled={saving} onClick={() => handleSubmit('Pending Review')}>
              {saving ? 'Saving...' : 'Submit for Review'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}