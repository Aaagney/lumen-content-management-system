// Notification Module (Aryan Verma)
const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

// -----------------------------------------------------------------------
// IMPORTANT — INTEGRATION NOTE
// This project does not yet have an authentication/JWT middleware or a
// User Management module (that's Aarya's module, not built yet at the time
// this was written). Every other route in the project currently trusts a
// user/author id supplied by the client (see articleController.js,
// WriteArticle.jsx author_id: 1, Profile.jsx /api/articles/user/1, etc.),
// so this module follows the same convention for now to stay consistent
// and working end-to-end.
//
// resolveUserId() is the single place that decides "who is the current
// user". Once real auth middleware exists (e.g. req.user.id from a JWT),
// update ONLY this function to read from req.user.id first — nothing else
// in this file needs to change.
// -----------------------------------------------------------------------
function resolveUserId(req) {
  return (
    (req.user && req.user.id) ||
    req.query.userId ||
    req.body.userId ||
    1 // falls back to the same demo user (id 1) the rest of the app defaults to
  );
}

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = FALSE`,
      [userId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { id } = req.params;

    const [existing] = await db.execute(
      'SELECT recipient_id FROM notifications WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (Number(existing[0].recipient_id) !== Number(userId)) {
      return res.status(403).json({ message: 'Not authorized to modify this notification' });
    }

    await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    await db.execute(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?',
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { id } = req.params;

    const [existing] = await db.execute(
      'SELECT recipient_id FROM notifications WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (Number(existing[0].recipient_id) !== Number(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await db.execute('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Not a route — re-exported so other controllers can optionally do
// require('../controllers/notificationController').createNotification(...)
// though importing directly from services/notificationService.js is preferred.
exports.createNotification = createNotification;
