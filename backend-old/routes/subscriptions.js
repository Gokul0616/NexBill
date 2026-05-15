const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT s.*, c.name as customer_name, p.name as plan_name, p.price
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { customer_id, plan_id, status, start_date, next_billing_date } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO subscriptions (customer_id, plan_id, status, start_date, next_billing_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_id, plan_id, status || 'active', start_date, next_billing_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
