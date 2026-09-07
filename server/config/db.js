// Centralized MySQL connection pool.
// Every controller/service in the project imports this single module —
// there must be no other place in the codebase that opens a DB connection.

const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
  } else {
    console.log(`Connected to MySQL database "${process.env.DB_NAME}".`);
    connection.release();
  }
});

// Exported as the promise-wrapper so every controller can use async/await.
module.exports = db.promise();
