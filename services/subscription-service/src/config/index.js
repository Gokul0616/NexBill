require('dotenv').config({ path: '../../.env' });

module.exports = {
    PORT: process.env.PORT || 7125,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
