require('dotenv').config({ path: '../../.env' });

module.exports = {
    PORT: process.env.PORT || 7124,
    JWT_SECRET: process.env.JWT_SECRET || 'secret-key-change-me',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
