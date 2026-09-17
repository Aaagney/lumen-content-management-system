const mysql = require('mysql2/promise');

async function testPort3307() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '',
      connectTimeout: 3000
    });
    console.log('SUCCESS! Connected to MySQL on port 3307 with user root and empty password!');
    const [rows] = await conn.query('SHOW DATABASES');
    console.log('Databases on 3307:', rows.map(r => Object.values(r)[0]));
    
    // Test creating cms3_db database
    await conn.query('CREATE DATABASE IF NOT EXISTS cms3_reputation_db');
    console.log('Database cms3_reputation_db created/verified successfully!');
    await conn.end();
  } catch (err) {
    console.error('Connection failed on 3307:', err);
  }
}

testPort3307();
