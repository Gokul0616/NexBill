const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function initDb() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('Database tables created successfully.');
  } catch (err) {
    console.error('Error creating database tables:', err);
  } finally {
    pool.end();
  }
}

initDb();
