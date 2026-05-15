const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.name as customer_name 
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { subscription_id, customer_id, amount, status, due_date } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO invoices (subscription_id, customer_id, amount, status, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [subscription_id, customer_id, amount, status || 'pending', due_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
