const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 5004;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing',
});

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_123',
});

app.post('/api/payments/create-order', async (req, res) => {
  const { invoice_id, amount } = req.body;
  if (!invoice_id || !amount) return res.status(400).json({ error: 'invoice_id and amount are required' });

  try {
    const options = {
      amount: parseInt(amount) * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: `receipt_inv_${invoice_id}`
    };
    
    const order = await razorpayInstance.orders.create(options);

    const { rows } = await pool.query(
      `INSERT INTO payment.transactions (invoice_id, razorpay_order_id, amount) VALUES ($1, $2, $3) RETURNING *`,
      [invoice_id, order.id, amount]
    );

    res.status(201).json({ order, transaction: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const paymentId = req.body.payload.payment.entity.id;
    const orderId = req.body.payload.payment.entity.order_id;
    
    try {
      await pool.query(
        `UPDATE payment.transactions SET status = 'captured', razorpay_payment_id = $1 WHERE razorpay_order_id = $2`,
        [paymentId, orderId]
      );
      
      console.log(`Payment captured for order ${orderId}`);
      res.status(200).json({ status: 'ok' });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'DB Error' });
    }
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
