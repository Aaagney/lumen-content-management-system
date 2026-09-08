import React, { useEffect, useState } from 'react';
import http from '../api/http';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [articles, setArticles] = useState([]);
  const [articlesError, setArticlesError] = useState('');
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchUserArticles = () => {
    if (!user) return;
    setArticlesError('');
    // This request carries the auth token, so — per the backend's
    // visibility rules — it returns this user's articles of every status,
    // not just Published ones.
    http.get(`/api/articles/user/${user.id}`)
      .then(res => setArticles(res.data))
      .catch(() => setArticlesError('Could not load your articles.'));
  };

  useEffect(() => {
    fetchUserArticles();
    setFullname(user?.fullname || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      http.delete(`/api/articles/${id}`)
        .then(() => fetchUserArticles())
        .catch(() => alert('Failed to delete article.'));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      await updateProfile({ fullname, bio, avatar });
      setSaveSuccess('Profile updated.');
      setEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null; // route is protected; this is just a safety net

  return (
    <div className="container">
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <img
          src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.fullname}
          alt={user.fullname}
          style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          {!editing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>{user.fullname}</h2>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit profile</button>
              </div>
              <p style={{ color: '#666', margin: '4px 0 0 0' }}>{user.email} · <span style={{ textTransform: 'capitalize' }}>{user.role}</span></p>
              {user.bio && <p style={{ color: '#444', margin: '8px 0 0 0' }}>{user.bio}</p>}
            </>
          ) : (
            <form onSubmit={handleSaveProfile}>
              <label>Full name</label>
              <input className="input-field" value={fullname} onChange={(e) => setFullname(e.target.value)} required />

              <label>Avatar URL</label>
              <input className="input-field" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />

              <label>Bio</label>
              <textarea className="textarea-field" style={{ minHeight: '80px' }} value={bio} onChange={(e) => setBio(e.target.value)} />

              {saveError && <p style={{ color: 'crimson', fontSize: '14px' }}>{saveError}</p>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
          {saveSuccess && !editing && <p style={{ color: '#03543F', fontSize: '13px', marginTop: '8px' }}>{saveSuccess}</p>}
        </div>
      </div>

      <h2 style={{ marginTop: '32px' }}>My Articles</h2>
      {articlesError && <p style={{ color: 'crimson' }}>{articlesError}</p>}
      {!articlesError && articles.length === 0 && (
        <p style={{ color: '#888' }}>You haven't written any articles yet.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {articles.map(art => (
          <div key={art.id} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${art.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {art.status}
                </span>
                <span style={{ fontSize: '13px', color: '#888' }}>{art.category_name}</span>
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px' }}>{art.title}</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => navigate(`/write?edit=${art.id}`)}>
                <Edit2 size={16} />
              </button>
              <button className="btn btn-secondary" style={{ color: 'crimson' }} onClick={() => handleDelete(art.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
