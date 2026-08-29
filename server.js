const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint: GET /api/articles (supports optional ?category=...)
app.get('/api/articles', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT id, title, description, category, author, image, reading_time, views, likes, published_date FROM articles';
    let params = [];

    if (category && category.toLowerCase() !== 'all') {
      query += ' WHERE LOWER(category) = ?';
      params.push(category.toLowerCase());
    }

    // Sort by id descending so newest articles show first
    query += ' ORDER BY id DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API Endpoint: GET /api/articles/search (supports ?q=... and optional &category=...)
app.get('/api/articles/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q) {
      // If no query, redirect/fallback to normal get articles
      return res.redirect(`/api/articles${category ? `?category=${category}` : ''}`);
    }

    let query = 'SELECT id, title, description, category, author, image, reading_time, views, likes, published_date FROM articles WHERE (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(content) LIKE ? OR LOWER(author) LIKE ?)';
    const searchVal = `%${q.toLowerCase()}%`;
    let params = [searchVal, searchVal, searchVal, searchVal];

    if (category && category.toLowerCase() !== 'all') {
      query += ' AND LOWER(category) = ?';
      params.push(category.toLowerCase());
    }

    query += ' ORDER BY id DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API Endpoint: GET /api/articles/:id
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    await db.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
    
    // Fetch article details
    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching article detail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fallback route: serve index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Lumen CMS Server running on http://localhost:${PORT}`);
});
