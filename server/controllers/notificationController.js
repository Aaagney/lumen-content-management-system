const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

// All routes that use this controller are mounted behind authenticateToken
// (see routes/notificationRoutes.js), so req.user is always populated by the
// centralized auth middleware. The recipient of a notification action is
// always req.user.id — never a query/body-supplied user id.

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = FALSE`,
      [userId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Get unread count error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
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
    console.error('Mark as read error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.execute(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?',
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
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
    console.error('Delete notification error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Re-exported so other controllers can do
// require('../controllers/notificationController').createNotification(...)
// though importing directly from services/notificationService.js is preferred.
exports.createNotification = createNotification;
