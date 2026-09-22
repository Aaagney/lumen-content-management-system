const db = require('./config/db');

async function migrate() {
  console.log('Running database migrations...');
  try {
    // 1. Create comments table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Checked/Created table: comments');

    // Insert sample comment if empty
    const [existingComments] = await db.query('SELECT id FROM comments LIMIT 1');
    if (existingComments.length === 0) {
      await db.query(`
        INSERT INTO comments (article_id, user_id, content) 
        VALUES (1, 4, 'This is an incredible breakdown of CRISPR technology!')
      `);
      console.log('Inserted sample comment');
    }

    // 2. Create reports table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporter_id INT NOT NULL,
        reported_type ENUM('article', 'comment', 'user') NOT NULL,
        reported_id INT NOT NULL,
        reason VARCHAR(100) NOT NULL,
        description TEXT,
        status ENUM('Pending', 'Under Review', 'Resolved', 'Rejected') DEFAULT 'Pending',
        admin_note TEXT,
        risk_score DECIMAL(5,2) DEFAULT NULL,
        risk_level VARCHAR(20) DEFAULT NULL,
        ai_result VARCHAR(50) DEFAULT NULL,
        ai_reason TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Checked/Created table: reports');

    // 3. Create appeals table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS appeals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        appellant_id INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Pending', 'Under Review', 'Approved', 'Rejected') DEFAULT 'Pending',
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (appellant_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Checked/Created table: appeals');

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
