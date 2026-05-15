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

app.get('/api/customers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM identity.customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM identity.customers WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO identity.users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
      [email, hashedPassword]
    );

    const token = jwt.sign({ userId: rows[0].id, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user: rows[0], token });
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'users_email_key') {
      return res.status(400).json({ error: 'Email is already registered. Please sign in instead.' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM identity.users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, rows[0].password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: rows[0].id, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: rows[0].role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Identity Service running on port ${PORT}`);
});
