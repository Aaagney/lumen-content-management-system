// Notification service
//
// Centralized, reusable notification creator. The Article and Comment
// controllers (createComment) and the Admin Verification controller
// (updateArticleStatus) import and call this instead of writing their own
// INSERT statements, so there is exactly one place that writes to the
// notifications table.
//
// Usage from another module's controller:
//
//   const { createNotification } = require('../services/notificationService');
//
//   await createNotification({
//     recipient: article.author_id,
//     type: 'article_approved',
//     title: 'Your article was approved',
//     message: `"${article.title}" has been approved and is ready to publish.`,
//     relatedEntityType: 'article',
//     relatedEntityId: article.id,
//     actionUrl: `/article/${article.id}`,
//   });
//
// This reuses the existing shared MySQL pool from config/db.js — it does not
// open a new database connection.

const db = require('../config/db');

// Notification types actually produced by this backend (article status
// changes and new comments). This is documentation/validation only, not a
// hard enum in the DB.
const NOTIFICATION_TYPES = {
  ARTICLE_SUBMITTED: 'article_submitted',
  ARTICLE_APPROVED: 'article_approved',
  ARTICLE_REJECTED: 'article_rejected',
  ARTICLE_PUBLISHED: 'article_published',
  NEW_CONTENT: 'new_content',
  ADMIN_VERIFICATION: 'admin_verification',
  SYSTEM: 'system',
};

/**
 * Create a notification for a user.
 *
 * @param {Object} params
 * @param {number} params.recipient - user id the notification is for (required)
 * @param {string} params.type - one of NOTIFICATION_TYPES (required)
 * @param {string} params.title - short title (required)
 * @param {string} params.message - short body text (required)
 * @param {string} [params.relatedEntityType] - e.g. 'article'
 * @param {number} [params.relatedEntityId] - id of the related row
 * @param {string} [params.actionUrl] - in-app path to link to, e.g. '/article/12'
 * @returns {Promise<Object>} the created notification
 */
async function createNotification({
  recipient,
  type,
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
  actionUrl = null,
}) {
  if (!recipient || !type || !title || !message) {
    throw new Error(
      'createNotification: recipient, type, title, and message are required'
    );
  }

  const [result] = await db.execute(
    `INSERT INTO notifications
      (recipient_id, type, title, message, related_entity_type, related_entity_id, action_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recipient, type, title, message, relatedEntityType, relatedEntityId, actionUrl]
  );

  return {
    id: result.insertId,
    recipient_id: recipient,
    type,
    title,
    message,
    related_entity_type: relatedEntityType,
    related_entity_id: relatedEntityId,
    action_url: actionUrl,
    is_read: false,
  };
}

module.exports = { createNotification, NOTIFICATION_TYPES };
