const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

const app = express();
const PORT = 5001;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing',
});

// Automatic Database Initialization
const fs = require('fs');
const path = require('path');
async function initDB() {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('Database schema initialized/verified');
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}
initDB();

app.get('/api/customers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM identity.customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM identity.customers WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error fetching customer ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, email, phone, gst_number } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO identity.customers (name, email, phone, gst_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, gst_number]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: err.message });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, company, business_type, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO identity.users (email, password_hash, name, company, business_type, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, name',
      [email, hashedPassword, name, company, business_type, phone]
    );

    const token = jwt.sign(
      {
        userId: rows[0].id,
        role: rows[0].role,
        name: rows[0].name,
        email: rows[0].email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({ user: rows[0], token });
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'users_email_key') {
      return res.status(400).json({ error: 'Email is already registered. Please sign in instead.' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM identity.users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, rows[0].password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      {
        userId: rows[0].id,
        role: rows[0].role,
        name: rows[0].name,
        email: rows[0].email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, role: rows[0].role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Identity Service running on port ${PORT}`);
});
