// Notification Module (Aryan Verma)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationApi';
import './notifications.css';

const POLL_INTERVAL_MS = 30000;

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// userId defaults to 1 to match the rest of this prototype (no auth /
// User Management module exists yet). Pass a real userId prop once one
// does -- nothing else in this component needs to change.
export default function NotificationBell({ userId = 1 }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef(null);

  const fetchUnreadCount = useCallback(() => {
    getUnreadCount(userId)
      .then((data) => setUnreadCount(data.count))
      .catch((err) => console.error('Failed to fetch unread count:', err));
  }, [userId]);

  const fetchRecent = useCallback(() => {
    getNotifications(userId)
      .then((data) => setNotifications(data.slice(0, 6)))
      .catch((err) => console.error('Failed to fetch notifications:', err));
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchRecent();
  };

  const handleItemClick = (notif) => {
    if (notif.is_read) return;
    markAsRead(notif.id, userId)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .catch((err) => console.error('Failed to mark notification as read:', err));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId)
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      })
      .catch((err) => console.error('Failed to mark all as read:', err));
  };

  return (
    <div className="notif-bell-wrapper" ref={wrapperRef}>
      <button className="notif-bell-btn" onClick={toggleOpen} aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllAsRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 && (
              <div className="notif-empty">No notifications yet</div>
            )}
            {notifications.map((notif) => {
              const itemBody = (
                <div
                  className={`notif-item ${notif.is_read ? '' : 'notif-item-unread'}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div className="notif-item-title">{notif.title}</div>
                  <div className="notif-item-message">{notif.message}</div>
                  <div className="notif-item-time">{timeAgo(notif.created_at)}</div>
                </div>
              );
              return notif.action_url ? (
                <Link
                  key={notif.id}
                  to={notif.action_url}
                  className="notif-item-link"
                  onClick={() => setOpen(false)}
                >
                  {itemBody}
                </Link>
              ) : (
                <div key={notif.id}>{itemBody}</div>
              );
            })}
          </div>

          <Link to="/notifications" className="notif-view-all" onClick={() => setOpen(false)}>
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
