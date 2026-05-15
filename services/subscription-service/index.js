const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 5002;
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5001';

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing',
});

app.get('/api/plans', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subscription.plans ORDER BY price ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const { rows: subs } = await pool.query(`
      SELECT s.*, p.name as plan_name, p.price
      FROM subscription.subscriptions s
      JOIN subscription.plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
    `);
    
    // Fetch customer details via HTTP from Identity Service
    const subsWithCustomers = await Promise.all(subs.map(async (s) => {
      try {
        const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${s.customer_id}`);
        return { ...s, customer_name: custRes.data.name };
      } catch(e) {
        return { ...s, customer_name: 'Unknown' };
      }
    }));

    res.json(subsWithCustomers);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subscriptions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT s.*, p.name as plan_name, p.price
      FROM subscription.subscriptions s
      JOIN subscription.plans p ON s.plan_id = p.id
      WHERE s.id = $1
    `, [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
    
    const sub = rows[0];
    try {
      const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${sub.customer_id}`);
      sub.customer_name = custRes.data.name;
    } catch(e) {
      sub.customer_name = 'Unknown';
    }

    res.json(sub);
  } catch (err) {
    console.error(`Error fetching subscription ${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  const { customer_id, plan_id } = req.body;
  if (!customer_id || !plan_id) return res.status(400).json({ error: 'customer_id and plan_id are required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO subscription.subscriptions (customer_id, plan_id, status, start_date, next_billing_date)
       VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
       RETURNING *`,
      [customer_id, plan_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating subscription:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE subscription.subscriptions SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error cancelling subscription ${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Subscription Service running on port ${PORT}`);
});
