const db = require('../config/db');

// Get all published articles with search & category filter
exports.getAllArticles = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT a.*, u.name as author_name, u.avatar as author_avatar, c.name as category_name 
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
    res.status(500).json({ error: error.message });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT a.*, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio, c.name as category_name 
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(articles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new article
exports.createArticle = async (req, res) => {
  try {
    // Force numbers to integers and prevent 'undefined' crashes in MySQL
    const title = req.body.title || 'Untitled';
    const subtitle = req.body.subtitle || '';
    const content = req.body.content || '';
    const category_id = parseInt(req.body.category_id) || 1;
    const author_id = parseInt(req.body.author_id) || 1;
    const cover_image = req.body.cover_image || '';
    const status = req.body.status || 'Draft';

    const [result] = await db.execute(
      `INSERT INTO articles (title, subtitle, content, category_id, author_id, cover_image, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, content, category_id, author_id, cover_image, status]
    );
    res.status(201).json({ id: result.insertId, message: 'Article created successfully' });
  } catch (error) {
    // This will print the EXACT reason to your backend terminal
    console.error("DATABASE ERROR:", error.message); 
    res.status(500).json({ error: error.message });
  }
};

// Update existing article
exports.updateArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    
    // Force numbers to integers and prevent 'undefined' crashes
    const title = req.body.title || 'Untitled';
    const subtitle = req.body.subtitle || '';
    const content = req.body.content || '';
    const category_id = parseInt(req.body.category_id) || 1;
    const author_id = parseInt(req.body.author_id) || 1;
    const cover_image = req.body.cover_image || '';
    const status = req.body.status || 'Draft';

    const [result] = await db.execute(
      `UPDATE articles 
       SET title = ?, subtitle = ?, content = ?, category_id = ?, author_id = ?, cover_image = ?, status = ? 
       WHERE id = ?`,
      [title, subtitle, content, category_id, author_id, cover_image, status, articleId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    // Prints the EXACT reason to your backend terminal
    console.error("DATABASE UPDATE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    await db.execute('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get articles by author ID
exports.getArticlesByAuthor = async (req, res) => {
  try {
    const [articles] = await db.execute(
      `SELECT a.*, c.name as category_name FROM articles a 
       LEFT JOIN categories c ON a.category_id = c.id 
       WHERE a.author_id = ? ORDER BY a.created_at DESC`,
      [req.params.authorId]
    );
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};