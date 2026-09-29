const mysql = require('mysql2/promise');
require('dotenv').config();

// High-concurrency connection pool for 100+ simultaneous students
const pool = mysql.createPool({
  host: process.env.DB_HOST || '193.203.184.149',
  user: process.env.DB_USER || 'u483551267_smart_board',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'u483551267_smart_board',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 30, // Optimized pool size for concurrent live room transactions
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Quick connection test
pool.getConnection()
  .then((conn) => {
    console.log(`✅ [MySQL Pool] Connected to Remote Database '${process.env.DB_NAME}' at ${process.env.DB_HOST}`);
    conn.release();
  })
  .catch((err) => {
    console.error(`❌ [MySQL Pool] Connection failed:`, err.message);
  });

module.exports = pool;
