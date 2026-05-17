const app = require('./app');
const db = require('@nexbill/db');
const config = require('./config');

async function startServer() {
    await db.init();
    app.listen(config.PORT, '0.0.0.0', () => {
        console.log(`Billing Service running on port ${config.PORT} (0.0.0.0)`);
    });
}

startServer();
