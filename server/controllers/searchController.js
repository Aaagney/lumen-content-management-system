const db = require('../config/db');

exports.searchAuthors = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const keyword = `%${search}%`;

    const [results] = await db.query(
      `SELECT id, name, role, avatar, bio
       FROM users
       WHERE role = 'author'
       AND (name LIKE ? OR bio LIKE ?)
       ORDER BY name ASC`,
      [keyword, keyword]
    );

    res.json(results);
  } catch (err) {
    console.error('Author search error:', err);
    res.status(500).json({ error: 'Failed to search authors' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const keyword = `%${search}%`;

    const [results] = await db.query(
      `SELECT id, name, role, avatar, bio
       FROM users
       WHERE name LIKE ? OR bio LIKE ?
       ORDER BY name ASC`,
      [keyword, keyword]
    );

    res.json(results);
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
};