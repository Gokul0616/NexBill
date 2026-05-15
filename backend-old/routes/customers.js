const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new customer
router.post('/', async (req, res) => {
  const { name, email, phone, gst_number } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO customers (name, email, phone, gst_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, gst_number]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
