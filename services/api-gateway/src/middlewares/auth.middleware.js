const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  if (req.method === 'OPTIONS' || req.path.startsWith('/api/auth') || req.path.startsWith('/api/payments/webhook')) {
    return next(); // Skip auth for preflights, login/register and webhooks
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    req.user = decoded; // Attach user payload
    next();
  });
};

module.exports = requireAuth;
