// Notification Module (Aryan Verma)
// Thin axios wrapper for the notification endpoints, following the same
// plain-axios pattern already used in Profile.jsx / WriteArticle.jsx
// (this project doesn't have a shared API client yet).
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/notifications';

export const getNotifications = (userId) =>
  axios.get(API_BASE, { params: { userId } }).then((res) => res.data);

export const getUnreadCount = (userId) =>
  axios.get(`${API_BASE}/unread-count`, { params: { userId } }).then((res) => res.data);

export const markAsRead = (id, userId) =>
  axios.patch(`${API_BASE}/${id}/read`, { userId });

export const markAllAsRead = (userId) =>
  axios.patch(`${API_BASE}/read-all`, { userId });

export const deleteNotification = (id, userId) =>
  axios.delete(`${API_BASE}/${id}`, { data: { userId } });
