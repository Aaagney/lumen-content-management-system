const db = require('../config/db');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

const ALLOWED_STATUSES = [
  'Draft',
  'Pending Review',
  'Approved',
  'Published',
  'Rejected',
  'Changes Requested',
];

const STATUS_NOTIFICATION_TYPE = {
  'Approved': NOTIFICATION_TYPES.ARTICLE_APPROVED,
  'Rejected': NOTIFICATION_TYPES.ARTICLE_REJECTED,
  'Published': NOTIFICATION_TYPES.ARTICLE_PUBLISHED,
  'Changes Requested': NOTIFICATION_TYPES.ADMIN_VERIFICATION,
};

// GET /api/admin/articles/pending  (authenticateToken + requireAdmin)
// Convenience endpoint so an admin can see the review queue.
exports.getPendingArticles = async (req, res) => {
  try {
    const [articles] = await db.execute(
      `SELECT a.*, u.fullname as author_name, c.name as category_name
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.status = 'Pending Review'
       ORDER BY a.created_at ASC`
    );
    res.json(articles);
  } catch (error) {
    console.error('Get pending articles error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/articles/:id/status  (authenticateToken + requireAdmin)
// The single, secure entry point for the article verification workflow.
// The admin's identity comes from req.user (JWT) — never from the body.
exports.updateArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: requestedStatus, admin_note } = req.body;
    const status = requestedStatus === 'Approved' ? 'Published' : requestedStatus;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const [rows] = await db.execute('SELECT * FROM articles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const article = rows[0];

    await db.execute(
      'UPDATE articles SET status = ?, admin_note = ? WHERE id = ?',
      [status, admin_note || null, id]
    );

    // Let the author know their article was reviewed.
    const notificationType = STATUS_NOTIFICATION_TYPE[status] || NOTIFICATION_TYPES.ADMIN_VERIFICATION;
    try {
      await createNotification({
        recipient: article.author_id,
        type: notificationType,
        title: `Your article was ${status.toLowerCase()}`,
        message: admin_note
          ? `"${article.title}" was marked "${status}". Note from the reviewer: ${admin_note}`
          : `"${article.title}" was marked "${status}".`,
        relatedEntityType: 'article',
        relatedEntityId: article.id,
        actionUrl: `/article/${article.id}`,
      });
    } catch (notifyErr) {
      console.error('Notification error (status change):', notifyErr.message);
    }

    res.json({ message: `Article status updated to "${status}"` });
  } catch (error) {
    console.error('Update article status error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
