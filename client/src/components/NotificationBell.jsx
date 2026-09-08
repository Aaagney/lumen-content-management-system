import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import http from '../api/http';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);

  const fetchUnreadCount = () => {
    http.get('/api/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});
  };

  const fetchNotifications = () => {
    setLoading(true);
    setError('');
    http.get('/api/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const markAsRead = (id) => {
    http.patch(`/api/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        fetchUnreadCount();
      })
      .catch(() => setError('Could not update notification.'));
  };

  const markAllAsRead = () => {
    http.patch('/api/notifications/read-all')
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      })
      .catch(() => setError('Could not update notifications.'));
  };

  const deleteNotification = (id) => {
    http.delete(`/api/notifications/${id}`)
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        fetchUnreadCount();
      })
      .catch(() => setError('Could not delete notification.'));
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleOpen}
        className="btn btn-secondary"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '8px' }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#DC2626', color: 'white',
            borderRadius: '999px', fontSize: '11px', minWidth: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', width: '340px', maxHeight: '420px',
          overflowY: 'auto', background: 'white', border: '1px solid var(--border-color)',
          borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ fontSize: '14px' }}>Notifications</strong>
            <button
              onClick={markAllAsRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--brand-green)' }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>

          {loading && <p style={{ padding: '14px', fontSize: '13px', color: '#888' }}>Loading...</p>}
          {!loading && error && <p style={{ padding: '14px', fontSize: '13px', color: 'crimson' }}>{error}</p>}
          {!loading && !error && notifications.length === 0 && (
            <p style={{ padding: '14px', fontSize: '13px', color: '#888' }}>You're all caught up.</p>
          )}

          {!loading && notifications.map(n => (
            <div key={n.id} style={{
              padding: '12px 14px', borderBottom: '1px solid #F1F1F1',
              background: n.is_read ? 'white' : '#F0FDF4'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <strong style={{ fontSize: '13px' }}>{n.title}</strong>
                <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>{timeAgo(n.created_at)}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#555', margin: '4px 0 8px 0' }}>{n.message}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> Mark read
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'crimson', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
