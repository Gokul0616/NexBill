const app = require('./app');

const PORT = process.env.PORT || 7123;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT} (0.0.0.0)`);
});
