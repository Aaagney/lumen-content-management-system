const { pool, createDatabaseIfNotExists } = require('./db');

// Helper function to calculate trust level from score (0-100)
function calculateTrustLevel(score) {
  if (score >= 80) return 'Trusted';
  if (score >= 50) return 'Normal';
  return 'Low Trust';
}

async function initializeDatabase() {
  await createDatabaseIfNotExists();

  const connection = await pool.getConnection();
  try {
    console.log('Initializing MySQL tables for User Trust & Reputation module...');

    // 1. Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'Contributor',
        avatar_initials VARCHAR(10) DEFAULT '',
        account_status ENUM('Active', 'Under Review', 'Suspended') DEFAULT 'Active',
        joined_date VARCHAR(50) DEFAULT 'Jan 2026',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create user_reputation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_reputation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        trust_score INT NOT NULL DEFAULT 65,
        trust_level ENUM('Trusted', 'Normal', 'Low Trust') NOT NULL DEFAULT 'Normal',
        positive_contributions INT NOT NULL DEFAULT 0,
        violations INT NOT NULL DEFAULT 0,
        reports_received INT NOT NULL DEFAULT 0,
        last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create reputation_history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reputation_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        points INT NOT NULL,
        reason TEXT NOT NULL,
        previous_score INT NOT NULL,
        new_score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if initial users exist
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('Seeding initial users and reputation data...');

      const initialUsers = [
        {
          name: 'Priya Mehta',
          email: 'priya.mehta@example.com',
          role: 'Senior Writer',
          avatar_initials: 'PM',
          account_status: 'Active',
          joined_date: 'March 2024',
          trust_score: 92,
          positive_contributions: 14,
          violations: 0,
          reports_received: 0,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'New account registered with verified email', prev: 0, current: 65, date: '2026-03-01 10:00:00' },
            { action: 'Approved Quality Content', points: 10, reason: 'High-rating article "What the Ocean Is Trying to Tell Us" published', prev: 65, current: 75, date: '2026-04-12 14:30:00' },
            { action: 'Positive Contribution', points: 10, reason: 'Verified community peer review completed', prev: 75, current: 85, date: '2026-06-20 09:15:00' },
            { action: 'Approved Quality Content', points: 7, reason: 'Featured editorial article approved', prev: 85, current: 92, date: '2026-08-05 16:45:00' }
          ]
        },
        {
          name: 'Thomas Okeke',
          email: 'thomas.okeke@techcorp.io',
          role: 'Technical Contributor',
          avatar_initials: 'TO',
          account_status: 'Active',
          joined_date: 'June 2024',
          trust_score: 74,
          positive_contributions: 6,
          violations: 1,
          reports_received: 1,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Account onboarding completed', prev: 0, current: 65, date: '2026-06-05 11:20:00' },
            { action: 'Approved Quality Content', points: 10, reason: 'Technical deep-dive on mechanical computing approved', prev: 65, current: 75, date: '2026-07-10 13:00:00' },
            { action: 'Confirmed Report Penalty', points: -6, reason: 'Minor unverified citation reported by community', prev: 75, current: 69, date: '2026-08-02 18:30:00' },
            { action: 'Positive Contribution', points: 5, reason: 'Addressed citation revisions promptly', prev: 69, current: 74, date: '2026-08-15 12:10:00' }
          ]
        },
        {
          name: 'Elena Rostova',
          email: 'elena.rostova@editorial.org',
          role: 'Lead Editor',
          avatar_initials: 'ER',
          account_status: 'Active',
          joined_date: 'January 2024',
          trust_score: 96,
          positive_contributions: 28,
          violations: 0,
          reports_received: 0,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Account initialization', prev: 0, current: 65, date: '2026-01-15 09:00:00' },
            { action: 'Positive Contribution', points: 15, reason: 'Completed 15 peer editorial reviews', prev: 65, current: 80, date: '2026-03-22 14:00:00' },
            { action: 'Approved Quality Content', points: 10, reason: 'Award-winning investigative piece approved', prev: 80, current: 90, date: '2026-05-18 11:45:00' },
            { action: 'Positive Contribution', points: 6, reason: 'Continuous flawless publishing record', prev: 90, current: 96, date: '2026-07-30 17:20:00' }
          ]
        },
        {
          name: 'Marcus Vance',
          email: 'marcus.vance@newsnet.com',
          role: 'Community Member',
          avatar_initials: 'MV',
          account_status: 'Under Review',
          joined_date: 'August 2024',
          trust_score: 42,
          positive_contributions: 2,
          violations: 3,
          reports_received: 4,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Standard sign-up', prev: 0, current: 65, date: '2026-08-01 10:30:00' },
            { action: 'Confirmed Violation', points: -15, reason: 'Unattributed content submission detected', prev: 65, current: 50, date: '2026-08-12 15:40:00' },
            { action: 'Confirmed User Report', points: -10, reason: 'Flagged for promotional affiliate links in comment section', prev: 50, current: 40, date: '2026-08-25 09:10:00' },
            { action: 'Positive Contribution', points: 5, reason: 'Community guidelines refresher quiz passed', prev: 40, current: 45, date: '2026-09-02 14:00:00' },
            { action: 'Minor Violation', points: -3, reason: 'Repetitive duplicate posting attempt', prev: 45, current: 42, date: '2026-09-10 11:15:00' }
          ]
        },
        {
          name: 'Chloe Bennett',
          email: 'chloe.b@creativehive.net',
          role: 'Contributor',
          avatar_initials: 'CB',
          account_status: 'Active',
          joined_date: 'May 2024',
          trust_score: 68,
          positive_contributions: 5,
          violations: 0,
          reports_received: 0,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Verified creator account', prev: 0, current: 65, date: '2026-05-10 10:00:00' },
            { action: 'Positive Contribution', points: 3, reason: 'First article draft successfully approved', prev: 65, current: 68, date: '2026-06-18 16:30:00' }
          ]
        },
        {
          name: 'Daniel Kim',
          email: 'dkim.research@academy.edu',
          role: 'Research Contributor',
          avatar_initials: 'DK',
          account_status: 'Active',
          joined_date: 'February 2024',
          trust_score: 88,
          positive_contributions: 11,
          violations: 0,
          reports_received: 0,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Institutional onboarding', prev: 0, current: 65, date: '2026-02-14 11:00:00' },
            { action: 'Approved Quality Content', points: 12, reason: 'Published academic synthesis paper', prev: 65, current: 77, date: '2026-04-09 14:15:00' },
            { action: 'Positive Contribution', points: 11, reason: 'High community citation index', prev: 77, current: 88, date: '2026-07-21 16:40:00' }
          ]
        },
        {
          name: 'Spammy Bot / Bad Actor',
          email: 'promo999@botnetwork.xyz',
          role: 'Member',
          avatar_initials: 'SB',
          account_status: 'Suspended',
          joined_date: 'September 2024',
          trust_score: 15,
          positive_contributions: 0,
          violations: 4,
          reports_received: 6,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Account registered', prev: 0, current: 65, date: '2026-09-01 03:00:00' },
            { action: 'Spam & Abuse Violation', points: -25, reason: 'Automated mass-posting of crypto scam links', prev: 65, current: 40, date: '2026-09-01 04:15:00' },
            { action: 'Confirmed User Report', points: -15, reason: 'Multiple community abuse reports confirmed', prev: 40, current: 25, date: '2026-09-02 08:30:00' },
            { action: 'Confirmed Violation', points: -10, reason: 'Banned terms detected in bio profile', prev: 25, current: 15, date: '2026-09-03 10:00:00' }
          ]
        },
        {
          name: 'Sophia Martinez',
          email: 'sophia.m@culturemag.org',
          role: 'Contributor',
          avatar_initials: 'SM',
          account_status: 'Active',
          joined_date: 'July 2024',
          trust_score: 82,
          positive_contributions: 8,
          violations: 0,
          reports_received: 0,
          history: [
            { action: 'Initial Registration', points: 65, reason: 'Writer onboarding', prev: 0, current: 65, date: '2026-07-01 10:00:00' },
            { action: 'Approved Quality Content', points: 10, reason: 'Cultural essay approved by editors', prev: 65, current: 75, date: '2026-07-28 15:00:00' },
            { action: 'Positive Contribution', points: 7, reason: 'Featured by community readers', prev: 75, current: 82, date: '2026-08-30 18:00:00' }
          ]
        }
      ];

      for (const u of initialUsers) {
        // Insert user
        const [userResult] = await connection.query(
          'INSERT INTO users (name, email, role, avatar_initials, account_status, joined_date) VALUES (?, ?, ?, ?, ?, ?)',
          [u.name, u.email, u.role, u.avatar_initials, u.account_status, u.joined_date]
        );
        const userId = userResult.insertId;

        const trustLevel = calculateTrustLevel(u.trust_score);

        // Insert user_reputation
        await connection.query(
          `INSERT INTO user_reputation 
            (user_id, trust_score, trust_level, positive_contributions, violations, reports_received) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, u.trust_score, trustLevel, u.positive_contributions, u.violations, u.reports_received]
        );

        // Insert history logs
        for (const h of u.history) {
          await connection.query(
            `INSERT INTO reputation_history 
              (user_id, action, points, reason, previous_score, new_score, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, h.action, h.points, h.reason, h.prev, h.current, h.date || new Date()]
          );
        }
      }

      console.log('Initial seed data inserted successfully!');
    } else {
      console.log('Database already initialized with users.');
    }
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  initializeDatabase,
  calculateTrustLevel
};
