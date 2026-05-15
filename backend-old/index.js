const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const customerRoutes = require('./routes/customers');
const planRoutes = require('./routes/plans');
const subscriptionRoutes = require('./routes/subscriptions');
const invoiceRoutes = require('./routes/invoices');

app.use('/api/customers', customerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
