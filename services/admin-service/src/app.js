const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin.routes');
const authMiddleware = require('./middlewares/auth.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(authMiddleware);

// Routes
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
