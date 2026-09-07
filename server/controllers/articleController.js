const db = require('../config/db');

const ALLOWED_STATUSES = [
  'Draft',
  'Pending Review',
  'Approved',
  'Published',
  'Rejected',
  'Changes Requested',
];

// Rough reading-time estimate (words / 200wpm), used when the client
// doesn't provide one. Matches the INT read_time column in the canonical schema.
function estimateReadTime(content) {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// GET /api/articles?category=&search=
// Public: lists Published articles, with optional category/search filters.
exports.getAllArticles = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT a.*, u.fullname as author_name, u.avatar as author_avatar, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'Published'
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (a.title LIKE ? OR a.subtitle LIKE ? OR a.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [articles] = await db.execute(query, params);
    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/articles/:id  (public route, optionalAuth)
// Published articles are visible to everyone. An unpublished article
// (Draft, Pending Review, Approved, Rejected, Changes Requested) is only
// visible to its own author or to an admin.
exports.getArticleById = async (req, res) => {
  try {
    const [articles] = await db.execute(
      `SELECT a.*, u.fullname as author_name, u.avatar as author_avatar, u.bio as author_bio, c.name as category_name
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const article = articles[0];

    if (article.status !== 'Published') {
      const user = req.user;
      const isOwner = user && Number(user.id) === Number(article.author_id);
      const isAdmin = user && user.role === 'admin';

      if (!isOwner && !isAdmin) {
        // Respond as if the article doesn't exist, so the endpoint doesn't
        // leak the existence of other users' unpublished content.
        return res.status(404).json({ message: 'Article not found' });
      }
    }

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/articles/user/:authorId  (public route, optionalAuth)
// Anonymous visitors and other users only see that author's Published
// articles. The author themself (or an admin) additionally sees their
// unpublished ones (Draft, Pending Review, etc.).
exports.getArticlesByAuthor = async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const user = req.user;
    const isOwnerOrAdmin = user && (Number(user.id) === Number(authorId) || user.role === 'admin');

    let query = `SELECT a.*, c.name as category_name FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.author_id = ?`;
    const params = [authorId];

    if (!isOwnerOrAdmin) {
      query += ` AND a.status = 'Published'`;
    }

    query += ` ORDER BY a.created_at DESC`;

    const [articles] = await db.execute(query, params);
    res.json(articles);
  } catch (error) {
    console.error('Get articles by author error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/articles  (authenticateToken)
// SECURITY: author_id always comes from req.user.id, never from the request body.
exports.createArticle = async (req, res) => {
  try {
    const title = req.body.title || 'Untitled';
    const subtitle = req.body.subtitle || null;
    const content = req.body.content || '';
    const category_id = req.body.category_id ? parseInt(req.body.category_id) : null;
    const cover_image = req.body.cover_image || null;
    const author_id = req.user.id;
    const read_time = req.body.read_time ? parseInt(req.body.read_time) : estimateReadTime(content);

    // Authors submit as Draft or Pending Review; nothing else may be set
    // directly on creation (e.g. a client cannot self-publish or self-approve).
    const requestedStatus = req.body.status;
    const status = ['Draft', 'Pending Review'].includes(requestedStatus) ? requestedStatus : 'Draft';

    const [result] = await db.execute(
      `INSERT INTO articles (title, subtitle, content, category_id, author_id, cover_image, status, read_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, content, category_id, author_id, cover_image, status, read_time]
    );

    res.status(201).json({ id: result.insertId, message: 'Article created successfully' });
  } catch (error) {
    console.error('Create article error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/articles/:id  (authenticateToken)
// Only the article's own author, or an admin, may edit it.
// SECURITY: author_id/ownership is never taken from the request body.
exports.updateArticle = async (req, res) => {
  try {
    const articleId = req.params.id;

    const [existingRows] = await db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const existing = existingRows[0];

    const isOwner = Number(existing.author_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to edit this article' });
    }

    const title = req.body.title ?? existing.title;
    const subtitle = req.body.subtitle ?? existing.subtitle;
    const content = req.body.content ?? existing.content;
    const category_id = req.body.category_id !== undefined ? parseInt(req.body.category_id) : existing.category_id;
    const cover_image = req.body.cover_image ?? existing.cover_image;
    const read_time = req.body.read_time !== undefined ? parseInt(req.body.read_time) : existing.read_time;

    // A regular author cannot promote their own article's status through this
    // endpoint (e.g. straight to Published/Approved) — that goes through the
    // dedicated admin verification endpoint. They may only move it between
    // Draft and Pending Review (submitting it for review).
    let status = existing.status;
    if (req.body.status) {
      if (isAdmin && ALLOWED_STATUSES.includes(req.body.status)) {
        status = req.body.status;
      } else if (isOwner && ['Draft', 'Pending Review'].includes(req.body.status)) {
        status = req.body.status;
      }
    }

    const [result] = await db.execute(
      `UPDATE articles
       SET title = ?, subtitle = ?, content = ?, category_id = ?, cover_image = ?, status = ?, read_time = ?
       WHERE id = ?`,
      [title, subtitle, content, category_id, cover_image, status, read_time, articleId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Update article error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/articles/:id  (authenticateToken)
// Only the article's own author, or an admin, may delete it.
exports.deleteArticle = async (req, res) => {
  try {
    const [existingRows] = await db.execute('SELECT author_id FROM articles WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const isOwner = Number(existingRows[0].author_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to delete this article' });
    }

    await db.execute('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
