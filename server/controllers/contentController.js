const db = require('../config/db');

// GET /api/content/stats
exports.getContentStats = async (req, res) => {
  try {
    const [totalRows] = await db.query('SELECT COUNT(*) AS total FROM contents');
    const [publishedRows] = await db.query("SELECT COUNT(*) AS published FROM contents WHERE status = 'Published'");
    const [draftRows] = await db.query("SELECT COUNT(*) AS draft FROM contents WHERE status = 'Draft'");
    const [categoriesRows] = await db.query('SELECT COUNT(DISTINCT category) AS categories FROM contents');

    res.status(200).json({
      success: true,
      data: {
        total: totalRows[0].total,
        published: publishedRows[0].published,
        draft: draftRows[0].draft,
        categories: categoriesRows[0].categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics: ' + error.message
    });
  }
};

// GET /api/content
exports.getAllContent = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = 'SELECT * FROM contents WHERE 1=1';
    const queryParams = [];

    if (search && search.trim() !== '') {
      sql += ' AND (title LIKE ? OR description LIKE ? OR author LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category && category.trim() !== '' && category !== 'All') {
      sql += ' AND category = ?';
      queryParams.push(category.trim());
    }

    if (status && status.trim() !== '' && status !== 'All') {
      sql += ' AND status = ?';
      queryParams.push(status.trim());
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.query(sql, queryParams);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content list: ' + error.message
    });
  }
};

// GET /api/content/search
exports.searchContent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      const [allRows] = await db.query('SELECT * FROM contents ORDER BY created_at DESC');
      return res.status(200).json({ success: true, data: allRows });
    }

    const searchTerm = `%${q.trim()}%`;
    const sql = 'SELECT * FROM contents WHERE title LIKE ? OR description LIKE ? OR author LIKE ? OR category LIKE ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search query failed: ' + error.message
    });
  }
};

// GET /api/content/:id
exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM contents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content item: ' + error.message
    });
  }
};

// POST /api/content
exports.createContent = async (req, res) => {
  try {
    const { title, description, category, author, status, image_url, read_time } = req.body;

    if (!title || !description || !category || !author) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Title, Description, Category, Author).'
      });
    }

    const itemStatus = status || 'Draft';
    const imageUrl = image_url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop';
    const readTime = read_time || '5 min read';

    const sql = 'INSERT INTO contents (title, description, category, author, status, image_url, read_time, views_count, likes_count) VALUES (?, ?, ?, ?, ?, ?, ?, 1200, 85)';
    const [result] = await db.query(sql, [title, description, category, author, itemStatus, imageUrl, readTime]);

    res.status(201).json({
      success: true,
      message: 'Content created successfully!',
      data: {
        id: result.insertId,
        title,
        description,
        category,
        author,
        status: itemStatus,
        image_url: imageUrl,
        read_time: readTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create content: ' + error.message
    });
  }
};

// PUT /api/content/:id
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, author, status, image_url, read_time } = req.body;

    if (!title || !description || !category || !author) {
      return res.status(400).json({
        success: false,
        message: 'All core fields are required for updating.'
      });
    }

    const [existing] = await db.query('SELECT * FROM contents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    const imageUrl = image_url || existing[0].image_url;
    const readTime = read_time || existing[0].read_time;

    const sql = 'UPDATE contents SET title = ?, description = ?, category = ?, author = ?, status = ?, image_url = ?, read_time = ? WHERE id = ?';
    await db.query(sql, [title, description, category, author, status || 'Draft', imageUrl, readTime, id]);

    res.status(200).json({
      success: true,
      message: 'Content updated successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update content: ' + error.message
    });
  }
};

// DELETE /api/content/:id
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM contents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    await db.query('DELETE FROM contents WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete content: ' + error.message
    });
  }
};