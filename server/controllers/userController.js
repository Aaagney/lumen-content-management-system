const db = require('../config/db'); 

// Fetch public user details
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Using 'name' and 'avatar' to match your MySQL Workbench schema
    const [users] = await db.execute(
      'SELECT id, name, role, avatar, bio, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Fetch articles authored by the user
exports.getUserArticles = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [articles] = await db.execute(
      'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(articles);
  } catch (error) {
    console.error("GET USER ARTICLES ERROR:", error.message);
    res.status(500).json({ error: 'Failed to fetch user articles' });
  }
};