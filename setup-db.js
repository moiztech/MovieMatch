const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');

  console.log('Creating database and tables...');
  await conn.query(schema);
  console.log('Inserting sample data...');
  await conn.query(seed);
  await conn.end();
  console.log('Done! Database moviematch is ready.');
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
