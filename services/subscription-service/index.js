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
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Subscription Service running on port ${PORT}`);
});
