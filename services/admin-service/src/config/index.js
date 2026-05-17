require('dotenv').config({ path: '../../.env' });

module.exports = {
    PORT: process.env.ADMIN_PORT || 7128,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
