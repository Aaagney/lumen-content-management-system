const db = require('../config/db');

// Get all articles with search & category filter
exports.getAllArticles = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT
        a.id,
        a.title,
        a.category,
        a.read_time,
        a.views,
        a.likes,
        a.status,
        a.image_url,
        a.author_id,
        a.created_at,
        u.fullname AS author_name,
        NULL AS author_avatar
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE 1 = 1
    `;

    const params = [];

    if (category && category !== 'All') {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (
        a.title LIKE ?
        OR a.category LIKE ?
      )`;

      params.push(
        `%${search}%`,
        `%${search}%`
      );
    }

    query += ` ORDER BY a.created_at DESC`;

    const [articles] = await db.execute(query, params);

    res.json(articles);
  } catch (error) {
    console.error('GET ARTICLES ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const [articles] = await db.execute(
      `
      SELECT
        a.id,
        a.title,
        a.category,
        a.read_time,
        a.views,
        a.likes,
        a.status,
        a.image_url,
        a.author_id,
        a.created_at,
        u.fullname AS author_name,
        NULL AS author_avatar,
        u.bio AS author_bio
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
      `,
      [req.params.id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    res.json(articles[0]);
  } catch (error) {
    console.error('GET ARTICLE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// Create new article
exports.createArticle = async (req, res) => {
  try {
    const title = req.body.title || 'Untitled';
    const category = req.body.category || 'Science';
    const read_time = req.body.read_time || '5 min';
    const image_url = req.body.image_url || '';
    const author_id = parseInt(req.body.author_id) || 1;
    const status = req.body.status || 'Draft';

    const [result] = await db.execute(
      `
      INSERT INTO articles
        (title, category, read_time, image_url, author_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        category,
        read_time,
        image_url,
        author_id,
        status
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('CREATE ARTICLE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// Update existing article
exports.updateArticle = async (req, res) => {
  try {
    const articleId = req.params.id;

    const title = req.body.title || 'Untitled';
    const category = req.body.category || 'Science';
    const read_time = req.body.read_time || '5 min';
    const image_url = req.body.image_url || '';
    const author_id = parseInt(req.body.author_id) || 1;
    const status = req.body.status || 'Draft';

    const [result] = await db.execute(
      `
      UPDATE articles
      SET
        title = ?,
        category = ?,
        read_time = ?,
        image_url = ?,
        author_id = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        category,
        read_time,
        image_url,
        author_id,
        status,
        articleId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    res.json({
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('UPDATE ARTICLE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM articles WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get articles by author ID
exports.getArticlesByAuthor = async (req, res) => {
  try {
    const [articles] = await db.execute(
      `
      SELECT
        a.*,
        u.fullname AS author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.author_id = ?
      ORDER BY a.created_at DESC
      `,
      [req.params.authorId]
    );

    res.json(articles);
  } catch (error) {
    console.error('GET AUTHOR ARTICLES ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};