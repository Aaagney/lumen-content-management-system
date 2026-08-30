const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'lumen_secret_key_12345';

app.use(cors());
app.use(express.json());

// In-memory fallback DB loaded with seed data
let useFallbackDb = false;
let fallbackDb = {
  users: [
    {
      id: 1,
      fullname: 'Lena Kaufmann',
      email: 'lena@lumen.com',
      // Password hash for 'password123'
      password: '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K',
      role: 'reader',
      bio: 'Curious reader. Lover of long-form nonfiction.'
    },
    {
      id: 2,
      fullname: 'Priya Mehta',
      email: 'priya@lumen.com',
      password: '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K',
      role: 'author',
      bio: 'Science communicator and molecular biologist. Writing about the invisible world.'
    },
    {
      id: 3,
      fullname: 'Thomas Okeke',
      email: 'thomas@lumen.com',
      password: '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K',
      role: 'author',
      bio: 'Tech journalist and AI policy researcher. Unpacking digital futures.'
    },
    {
      id: 4,
      fullname: 'Amara Silva',
      email: 'amara@lumen.com',
      password: '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K',
      role: 'admin',
      bio: 'Editor-in-chief at Lumen. Overseeing quality and authenticity.'
    }
  ],
  articles: [
    {
      id: 1,
      title: 'How CRISPR Is Rewriting the Story of Human Disease',
      category: 'Science',
      read_time: '7 min',
      views: 4821,
      likes: 284,
      status: 'Published',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
      author_id: 2
    },
    {
      id: 2,
      title: 'What the Ocean Is Trying to Tell Us About Carbon',
      category: 'Environment',
      read_time: '8 min',
      views: 1205,
      likes: 94,
      status: 'Pending Review',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      author_id: 2
    },
    {
      id: 3,
      title: 'The Quantum Computing Race: Hype vs Reality',
      category: 'Technology',
      read_time: '10 min',
      views: 3421,
      likes: 153,
      status: 'Published',
      image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      author_id: 3
    }
  ]
};

let dbConnection = null;

// Connect to MySQL
async function connectDb() {
  try {
    dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('MySQL server connected. Creating database if needed...');
    await dbConnection.query('CREATE DATABASE IF NOT EXISTS `' + process.env.DB_NAME + '`');
    await dbConnection.query('USE `' + process.env.DB_NAME + '`');

    // Create tables
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('reader', 'author', 'admin') DEFAULT 'reader',
        bio TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        status ENUM('Published', 'Pending Review', 'Draft') DEFAULT 'Draft',
        image_url VARCHAR(255) DEFAULT NULL,
        author_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if tables are seeded
    const [rows] = await dbConnection.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('Seeding initial data into MySQL database...');
      // Insert seed users
      for (const u of fallbackDb.users) {
        await dbConnection.query(
          'INSERT INTO users (id, fullname, email, password, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
          [u.id, u.fullname, u.email, u.password, u.role, u.bio]
        );
      }
      // Insert seed articles
      for (const a of fallbackDb.articles) {
        await dbConnection.query(
          'INSERT INTO articles (id, title, category, read_time, views, likes, status, image_url, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [a.id, a.title, a.category, a.read_time, a.views, a.likes, a.status, a.image_url, a.author_id]
        );
      }
    }
    console.log('MySQL Database initialized successfully.');
  } catch (error) {
    console.error('⚠️ MySQL Connection failed:', error.message);
    console.log('⚡ Switching to in-memory fallback database so you can proceed without MySQL database errors.');
    useFallbackDb = true;
  }
}

// Database helper functions
async function query(sql, params) {
  if (useFallbackDb) {
    // In-memory query simulation
    if (sql.includes('SELECT * FROM users WHERE email = ?')) {
      const email = params[0];
      const user = fallbackDb.users.find(u => u.email === email);
      return [user ? [user] : []];
    }
    if (sql.includes('SELECT * FROM users WHERE id = ?')) {
      const id = params[0];
      const user = fallbackDb.users.find(u => u.id === id);
      return [user ? [user] : []];
    }
    if (sql.includes('SELECT * FROM users')) {
      return [fallbackDb.users];
    }
    if (sql.includes('INSERT INTO users')) {
      const id = fallbackDb.users.length + 1;
      const newUser = {
        id,
        fullname: params[0],
        email: params[1],
        password: params[2],
        role: params[3],
        bio: params[4] || '',
        created_at: new Date()
      };
      fallbackDb.users.push(newUser);
      return [{ insertId: id }];
    }
    if (sql.includes('UPDATE users')) {
      // SET fullname = ?, bio = ? WHERE id = ?
      const fullname = params[0];
      const bio = params[1];
      const id = params[2];
      const user = fallbackDb.users.find(u => u.id === id);
      if (user) {
        user.fullname = fullname;
        user.bio = bio;
      }
      return [{ affectedRows: 1 }];
    }
    if (sql.includes('SELECT * FROM articles')) {
      if (sql.includes('WHERE author_id = ?')) {
        const authorId = params[0];
        return [fallbackDb.articles.filter(a => a.author_id === authorId)];
      }
      return [fallbackDb.articles];
    }
    return [[]];
  } else {
    return await dbConnection.query(sql, params);
  }
}

// Middleware for JWT Verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// API Endpoints

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Lumen API. Backend server is active.' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Lumen API endpoints root.' });
});

// 1. POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    if (!fullname || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'reader' && role !== 'author' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role selection. Choose Reader, Author, or Admin' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const [existing] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const bio =
      role === 'reader'
        ? 'Curious reader.'
        : role === 'author'
        ? 'Content creator at Lumen.'
        : 'Admin overseeing content quality on Lumen.';
    const [result] = await query(
      'INSERT INTO users (fullname, email, password, role, bio) VALUES (?, ?, ?, ?, ?)',
      [fullname, email, hashedPassword, role, bio]
    );

    // Generate JWT
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, fullname, email, role, bio }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 3. GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];
    res.json({
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 4. PUT /api/auth/profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { fullname, bio } = req.body;
    if (!fullname) {
      return res.status(400).json({ message: 'Fullname is required' });
    }

    await query('UPDATE users SET fullname = ?, bio = ? WHERE id = ?', [fullname, bio, req.user.id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 5. GET /api/articles
app.get('/api/articles', async (req, res) => {
  try {
    const authorId = req.query.author_id ? parseInt(req.query.author_id) : null;
    let articlesList;
    if (authorId) {
      const [rows] = await query('SELECT * FROM articles WHERE author_id = ?', [authorId]);
      articlesList = rows;
    } else {
      const [rows] = await query('SELECT * FROM articles');
      articlesList = rows;
    }
    res.json({ articles: articlesList });
  } catch (error) {
    console.error('Fetch articles error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 6. GET /api/users (For Navbar role switching)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await query('SELECT id, fullname, email, role, bio FROM users');
    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start Express application
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Lumen Backend running on http://localhost:${PORT}`);
  });
});