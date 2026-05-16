const errorHandler = (err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({ error: 'Gateway Error' });
};

module.exports = errorHandler;
