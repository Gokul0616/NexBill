require('dotenv').config({ path: '../../.env' });
const razorpayInstance = require('./razorpay');

module.exports = {
    PORT: process.env.PORT || 7127,
    NODE_ENV: process.env.NODE_ENV || 'development',
    razorpay: razorpayInstance
};
