const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'movieuser',
  password: process.env.DB_PASSWORD || 'movie@123!@',
  database: process.env.DB_NAME || 'moviematch',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
