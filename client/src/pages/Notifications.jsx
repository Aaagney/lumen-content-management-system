// Notification Module (Aryan Verma)
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, CheckCheck, Bell } from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationApi';
import '../components/notifications.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// userId defaults to 1 to match the rest of this prototype (no auth /
// User Management module exists yet). App.jsx passes the demo-role-derived
// userId down as a prop.
export default function Notifications({ userId = 1 }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);
    getNotifications(userId)
      .then((data) => setNotifications(data))
      .catch(() => setError('Could not load notifications. Please try again.'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleItemClick = (notif) => {
    if (notif.is_read) return;
    markAsRead(notif.id, userId)
      .then(() =>
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        )
      )
      .catch(() => alert('Failed to mark notification as read.'));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId)
      .then(() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      )
      .catch(() => alert('Failed to mark all notifications as read.'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notification?')) return;
    deleteNotification(id, userId)
      .then(() => setNotifications((prev) => prev.filter((n) => n.id !== id)))
      .catch(() => alert('Failed to delete notification.'));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container">
      <div className="notif-page-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading && <div className="notif-state">Loading notifications...</div>}

      {!loading && error && (
        <div className="notif-state notif-state-error">{error}</div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="notif-state">
          <Bell size={32} />
          <p>You're all caught up — no notifications yet.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notif-page-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-page-item ${notif.is_read ? '' : 'notif-item-unread'}`}
            >
              <div className="notif-page-item-main" onClick={() => handleItemClick(notif)}>
                <div className="notif-item-title">{notif.title}</div>
                <div className="notif-item-message">{notif.message}</div>
                <div className="notif-item-time">{formatDate(notif.created_at)}</div>
                {notif.action_url && (
                  <Link to={notif.action_url} className="notif-page-action">
                    View
                  </Link>
                )}
              </div>
              <button
                className="btn btn-secondary notif-delete-btn"
                onClick={() => handleDelete(notif.id)}
                aria-label="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
