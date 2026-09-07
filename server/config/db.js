const mysql = require('mysql2/promise');

// Database pool configuration
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cms_chat_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Database Connection
db.getConnection()
  .then(connection => {
    console.log('[MySQL] Database connected successfully to cms_chat_db.');
    connection.release();
  })
  .catch(err => {
    console.error('[MySQL] Database connection error:', err.message);
  });

module.exports = db;