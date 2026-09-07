const db = require('../config/db');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

// GET /api/comments/article/:articleId
exports.getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;

    const [articles] = await db.execute('SELECT id FROM articles WHERE id = ?', [articleId]);
    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const [comments] = await db.execute(
      `SELECT
        comments.id,
        comments.article_id,
        comments.user_id,
        comments.parent_id,
        comments.content,
        comments.likes_count,
        comments.created_at,
        comments.updated_at,
        users.fullname AS user_name,
        users.avatar AS user_avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.article_id = ?
      ORDER BY comments.created_at ASC`,
      [articleId]
    );

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error.message);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// POST /api/comments  (authenticateToken)
exports.createComment = async (req, res) => {
  try {
    const { article_id, content, parent_id } = req.body;
    // SECURITY: the comment author is always the authenticated user —
    // never trust a user_id supplied in the request body.
    const userId = req.user.id;

    if (!article_id || !content || !content.trim()) {
      return res.status(400).json({ message: 'article_id and content are required' });
    }

    const [articles] = await db.execute('SELECT id, author_id, title FROM articles WHERE id = ?', [article_id]);
    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const article = articles[0];

    let parentId = null;
    if (parent_id) {
      const [parents] = await db.execute(
        'SELECT id, article_id FROM comments WHERE id = ?',
        [parent_id]
      );
      if (parents.length === 0) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      if (Number(parents[0].article_id) !== Number(article_id)) {
        return res.status(400).json({ message: 'Parent comment does not belong to this article' });
      }
      parentId = parent_id;
    }

    const [result] = await db.execute(
      `INSERT INTO comments (article_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)`,
      [article_id, userId, parentId, content.trim()]
    );

    const [newComment] = await db.execute(
      `SELECT
        comments.id,
        comments.article_id,
        comments.user_id,
        comments.parent_id,
        comments.content,
        comments.likes_count,
        comments.created_at,
        comments.updated_at,
        users.fullname AS user_name,
        users.avatar AS user_avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?`,
      [result.insertId]
    );

    // Notify the article's author that someone commented, unless they
    // commented on their own article.
    if (Number(article.author_id) !== Number(userId)) {
      try {
        await createNotification({
          recipient: article.author_id,
          type: NOTIFICATION_TYPES.NEW_CONTENT,
          title: 'New comment on your article',
          message: `${newComment[0].user_name} commented on "${article.title}"`,
          relatedEntityType: 'article',
          relatedEntityId: article.id,
          actionUrl: `/article/${article.id}`,
        });
      } catch (notifyErr) {
        console.error('Notification error (comment):', notifyErr.message);
      }
    }

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Create comment error:', error.message);
    res.status(500).json({ message: 'Failed to create comment' });
  }
};
