const { pool } = require('../config/db');
const { calculateTrustLevel } = require('../config/initDb');

// 1. Get all users with reputation summary & filters
exports.getUsers = async (req, res) => {
  try {
    const { search, trust_level, status } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar_initials,
        u.account_status,
        u.joined_date,
        u.created_at,
        r.trust_score,
        r.trust_level,
        r.positive_contributions,
        r.violations,
        r.reports_received,
        r.last_activity_date
      FROM users u
      LEFT JOIN user_reputation r ON u.id = r.user_id
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.role) LIKE ?)`;
      params.push(term, term, term);
    }

    if (trust_level && trust_level !== 'all') {
      query += ` AND r.trust_level = ?`;
      params.push(trust_level);
    }

    if (status && status !== 'all') {
      query += ` AND u.account_status = ?`;
      params.push(status);
    }

    // Default sorting: low trust first if viewing violations, or by trust_score desc
    query += ` ORDER BY r.trust_score DESC, u.id ASC`;

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

// 2. Get single user details by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar_initials,
        u.account_status,
        u.joined_date,
        u.created_at,
        r.trust_score,
        r.trust_level,
        r.positive_contributions,
        r.violations,
        r.reports_received,
        r.last_activity_date
      FROM users u
      LEFT JOIN user_reputation r ON u.id = r.user_id
      WHERE u.id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user detail:', error);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
};

// 3. Get reputation history for a user
exports.getUserHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        user_id,
        action,
        points,
        reason,
        previous_score,
        new_score,
        created_at
      FROM reputation_history
      WHERE user_id = ?
      ORDER BY id DESC
    `;

    const [history] = await pool.query(query, [id]);
    res.json(history);
  } catch (error) {
    console.error('Error fetching user reputation history:', error);
    res.status(500).json({ error: 'Failed to retrieve reputation history' });
  }
};

// 4. Update a user's reputation (Record Reputation Action)
exports.updateReputation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { action, points, reason, actionCategory } = req.body;

    if (!action || points === undefined || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: action, points, and reason are mandatory.' 
      });
    }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum)) {
      return res.status(400).json({ error: 'Points must be a valid number' });
    }

    await connection.beginTransaction();

    // Fetch current user reputation
    const [repRows] = await connection.query(
      'SELECT * FROM user_reputation WHERE user_id = ? FOR UPDATE',
      [id]
    );

    if (repRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'User reputation record not found' });
    }

    const currentRep = repRows[0];
    const previousScore = currentRep.trust_score;
    
    // Calculate new score clamped between 0 and 100
    const newScore = Math.max(0, Math.min(100, previousScore + pointsNum));
    const newTrustLevel = calculateTrustLevel(newScore);

    // Determine category counters to increment
    let positiveInc = 0;
    let violationInc = 0;
    let reportInc = 0;

    const lowerAction = action.toLowerCase();
    const lowerCat = (actionCategory || '').toLowerCase();

    if (pointsNum > 0 || lowerCat === 'positive' || lowerAction.includes('positive') || lowerAction.includes('approved') || lowerAction.includes('quality')) {
      positiveInc = 1;
    } else if (lowerCat === 'violation' || lowerAction.includes('violation') || lowerAction.includes('spam') || lowerAction.includes('abuse')) {
      violationInc = 1;
    } else if (lowerCat === 'report' || lowerAction.includes('report')) {
      reportInc = 1;
    }

    // Update user_reputation table
    await connection.query(
      `UPDATE user_reputation 
       SET 
         trust_score = ?, 
         trust_level = ?, 
         positive_contributions = positive_contributions + ?, 
         violations = violations + ?, 
         reports_received = reports_received + ?,
         last_activity_date = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [newScore, newTrustLevel, positiveInc, violationInc, reportInc, id]
    );

    // Insert into reputation_history
    const [histResult] = await connection.query(
      `INSERT INTO reputation_history 
        (user_id, action, points, reason, previous_score, new_score, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, action, pointsNum, reason, previousScore, newScore]
    );

    // Check if account status should automatically be reviewed or suggested
    if (newScore < 30) {
      // Optional flag for admin attention
      await connection.query(
        `UPDATE users SET account_status = CASE WHEN account_status = 'Active' THEN 'Under Review' ELSE account_status END WHERE id = ?`,
        [id]
      );
    }

    await connection.commit();

    // Fetch updated user & reputation record
    const [updatedUser] = await connection.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar_initials,
        u.account_status,
        u.joined_date,
        r.trust_score,
        r.trust_level,
        r.positive_contributions,
        r.violations,
        r.reports_received,
        r.last_activity_date
      FROM users u
      LEFT JOIN user_reputation r ON u.id = r.user_id
      WHERE u.id = ?`,
      [id]
    );

    res.json({
      message: 'Reputation action recorded successfully',
      user: updatedUser[0],
      historyEntry: {
        id: histResult.insertId,
        user_id: id,
        action,
        points: pointsNum,
        reason,
        previous_score: previousScore,
        new_score: newScore,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating reputation:', error);
    res.status(500).json({ error: 'Failed to update reputation' });
  } finally {
    connection.release();
  }
};

// 5. Update user account status (Active, Under Review, Suspended)
exports.updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_status } = req.body;

    const validStatuses = ['Active', 'Under Review', 'Suspended'];
    if (!validStatuses.includes(account_status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    await pool.query('UPDATE users SET account_status = ? WHERE id = ?', [account_status, id]);

    res.json({ message: 'Account status updated successfully', account_status });
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ error: 'Failed to update account status' });
  }
};

// 6. Get overall dashboard reputation statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsersRows] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [trustedRows] = await pool.query('SELECT COUNT(*) as count FROM user_reputation WHERE trust_level = "Trusted"');
    const [normalRows] = await pool.query('SELECT COUNT(*) as count FROM user_reputation WHERE trust_level = "Normal"');
    const [lowTrustRows] = await pool.query('SELECT COUNT(*) as count FROM user_reputation WHERE trust_level = "Low Trust"');
    const [violationsRows] = await pool.query('SELECT SUM(violations) as total_violations FROM user_reputation');
    const [reportsRows] = await pool.query('SELECT SUM(reports_received) as total_reports FROM user_reputation');
    const [avgScoreRows] = await pool.query('SELECT AVG(trust_score) as avg_score FROM user_reputation');

    res.json({
      total_users: totalUsersRows[0].total || 0,
      trusted_users: trustedRows[0].count || 0,
      normal_users: normalRows[0].count || 0,
      low_trust_users: lowTrustRows[0].count || 0,
      total_violations: parseInt(violationsRows[0].total_violations || 0, 10),
      total_reports: parseInt(reportsRows[0].total_reports || 0, 10),
      average_trust_score: Math.round(avgScoreRows[0].avg_score || 0)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

// 7. Reset / re-seed database helper (optional)
exports.resetDatabase = async (req, res) => {
  try {
    const { initializeDatabase } = require('../config/initDb');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
    await pool.query('DROP TABLE IF EXISTS reputation_history;');
    await pool.query('DROP TABLE IF EXISTS user_reputation;');
    await pool.query('DROP TABLE IF EXISTS users;');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');

    await initializeDatabase();
    res.json({ message: 'Database reset and re-seeded successfully' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
};
