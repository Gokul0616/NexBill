const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: '../../.env' });

const requireAuth = require('./middlewares/auth.middleware');
const errorHandler = require('./middlewares/error.middleware');
const { identityUrl, subscriptionUrl, billingUrl, paymentUrl, adminUrl } = require('./config/services');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(requireAuth);

const proxyOptions = {
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // Propagate user identity to downstream services
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Payload', JSON.stringify(req.user));
      }
      
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] ${req.method} ${req.originalUrl}:`, err.message);
    }
  }
};

// Proxy definitions - Mounting on root and using pathFilter to preserve full /api/... path
app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/uploads', 
  target: identityUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/auth', 
  target: identityUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/customers', 
  target: identityUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/plans', 
  target: subscriptionUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/subscriptions', 
  target: subscriptionUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/invoices', 
  target: billingUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/payments', 
  target: paymentUrl 
}));

app.use(createProxyMiddleware({ 
  ...proxyOptions, 
  pathFilter: '/api/admin', 
  target: adminUrl 
}));

app.use(errorHandler);

module.exports = app;
