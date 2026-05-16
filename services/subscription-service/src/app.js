const express = require('express');
const planRoutes = require('./routes/plan.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const errorHandler = require('./middlewares/error.middleware');
require('dotenv').config({ path: '../../.env' });

const app = express();

app.use(express.json());

// Routes
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
