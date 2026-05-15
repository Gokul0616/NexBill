const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 5003;
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5001';

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing',
});

app.get('/api/invoices', async (req, res) => {
  try {
    const { rows: invoices } = await pool.query('SELECT * FROM billing.invoices ORDER BY created_at DESC');
    
    // Fetch customer details via HTTP from Identity Service
    const invoicesWithCustomers = await Promise.all(invoices.map(async (i) => {
      try {
        const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${i.customer_id}`);
        return { ...i, customer_name: custRes.data.name };
      } catch(e) {
        return { ...i, customer_name: 'Unknown' };
      }
    }));

    res.json(invoicesWithCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Billing Service running on port ${PORT}`);
});
