const express = require('express');
const billingRoutes = require('./routes/billing.routes');
const errorHandler = require('./middlewares/error.middleware');
require('dotenv').config({ path: '../../.env' });

const app = express();

app.use(express.json());

// Routes
app.use('/api/invoices', billingRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
