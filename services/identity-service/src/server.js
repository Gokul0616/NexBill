const app = require('./app');
const db = require('@nexbill/db');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function initDB() {
    await db.init();
    if (db.mode !== 'postgres') {
        console.log('Skipping schema initialization for non-Postgres database');
        return;
    }
    try {
        const schemaPath = path.join(__dirname, '../../schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await db.query(schema);
            console.log('Database schema initialized/verified');
        }
    } catch (err) {
        console.error('Database initialization error:', err.message);
    }
}

async function startServer() {
    await initDB();
    app.listen(config.PORT, '0.0.0.0', () => {
        console.log(`Identity Service running on port ${config.PORT} (0.0.0.0)`);
    });
}

startServer();
