// const mysql = require('mysql2');
// require('dotenv').config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3307
// });

// db.getConnection((err, connection) => {
//   if (err) {
//     console.error('MySQL Connection Error:', err.message);
//   } else {
//     console.log('Connected to MySQL database on port 3307!');
//     connection.release();
//   }
// });

// module.exports = db;


const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3307
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Connection Error:', err.message);
  } else {
    console.log('Connected to MySQL database on port 3307!');
    connection.release();
  }
});

// Exporting promise wrapper for async/await support in routes
module.exports = db.promise();