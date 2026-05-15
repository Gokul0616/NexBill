const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plans ORDER BY price ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, price, billing_cycle, features } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO plans (name, price, billing_cycle, features) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, billing_cycle, features]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
