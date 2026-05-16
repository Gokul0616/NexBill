const app = require('./app');
const db = require('@nexbill/db');

const PORT = process.env.PORT || 7125;

async function startServer() {
    await db.init();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Subscription Service running on port ${PORT} (0.0.0.0)`);
    });
}

startServer();
