const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/payment.routes');
const errorHandler = require('./middlewares/error.middleware');
require('dotenv').config({ path: '../../.env' });

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/payments', paymentRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
