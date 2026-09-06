const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get all comments for an article
router.get('/article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    const [comments] = await db.query(
      `SELECT
        comments.id,
        comments.article_id,
        comments.user_id,
        comments.parent_id,
        comments.content,
        comments.likes_count,
        comments.created_at,
        comments.updated_at,
        users.fullname AS user_name
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.article_id = ?
      ORDER BY comments.created_at ASC`,
      [articleId]
    );

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
});


// Add a comment
router.post('/', async (req, res) => {
  try {
    const { article_id, user_id, content, parent_id } = req.body;

    if (!article_id || !user_id || !content || !content.trim()) {
      return res.status(400).json({
        message: 'article_id, user_id and content are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO comments
        (article_id, user_id, parent_id, content)
       VALUES (?, ?, ?, ?)`,
      [
        article_id,
        user_id,
        parent_id || null,
        content.trim()
      ]
    );

    const [newComment] = await db.query(
      `SELECT
        comments.id,
        comments.article_id,
        comments.user_id,
        comments.parent_id,
        comments.content,
        comments.likes_count,
        comments.created_at,
        comments.updated_at,
        users.fullname AS user_name
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      message: 'Failed to create comment',
      error: error.message
    });
  }
});

module.exports = router;