const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

const app = express();
const PORT = 5000;

app.use(cors());

// Service URLs
const identityUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5001';
const subscriptionUrl = process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:5002';
const billingUrl = process.env.BILLING_SERVICE_URL || 'http://localhost:5003';
const paymentUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004';

// Auth Middleware
const requireAuth = (req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/payments/webhook')) {
    return next(); // Skip auth for login/register and webhooks
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    req.user = decoded; // Attach user payload
    next();
  });
};

app.use(requireAuth);

// Identity Service (Auth & Customers)
app.use(createProxyMiddleware({ pathFilter: '/api/auth', target: identityUrl, changeOrigin: true }));
app.use(createProxyMiddleware({ pathFilter: '/api/customers', target: identityUrl, changeOrigin: true }));

// Subscription Service
app.use(createProxyMiddleware({ pathFilter: '/api/plans', target: subscriptionUrl, changeOrigin: true }));
app.use(createProxyMiddleware({ pathFilter: '/api/subscriptions', target: subscriptionUrl, changeOrigin: true }));

// Billing Service
app.use(createProxyMiddleware({ pathFilter: '/api/invoices', target: billingUrl, changeOrigin: true }));

// Payment Service
app.use(createProxyMiddleware({ pathFilter: '/api/payments', target: paymentUrl, changeOrigin: true }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({ error: 'Gateway Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
