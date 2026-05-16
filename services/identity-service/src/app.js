const express = require('express');
const customerRoutes = require('./routes/customer.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middlewares/error.middleware');
require('dotenv').config({ path: '../../.env' });

const app = express();

app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
