const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Roles a person is allowed to pick for themselves during public registration.
// 'admin' is intentionally excluded — admin accounts must be created/promoted
// through a trusted process (e.g. directly in the database, or by an existing
// admin), never through the public /register endpoint.
const PUBLIC_ROLES = ['reader', 'author'];

function publicUser(user) {
  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    bio: user.bio || null,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    // SECURITY: role is deliberately NOT taken from an unrestricted body value.
    // Anyone hitting this endpoint can only become a reader or an author.
    let { role } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'fullname, email and password are required' });
    }

    if (!role || !PUBLIC_ROLES.includes(role)) {
      role = 'reader';
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)`,
      [fullname, email, hashedPassword, role]
    );

    const user = {
      id: result.insertId,
      fullname,
      email,
      role,
      avatar: null,
      bio: null,
    };

    const token = signToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/auth/me  (authenticateToken)
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: publicUser(users[0]) });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/auth/profile  (authenticateToken)
exports.updateProfile = async (req, res) => {
  try {
    const { fullname, bio, avatar } = req.body;

    if (!fullname) {
      return res.status(400).json({ message: 'Fullname is required' });
    }

    // Identity always comes from the JWT (req.user.id), never from the body.
    await db.execute(
      'UPDATE users SET fullname = ?, bio = ?, avatar = ? WHERE id = ?',
      [fullname, bio || null, avatar || null, req.user.id]
    );

    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);

    res.json({
      message: 'Profile updated successfully',
      user: publicUser(users[0]),
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
