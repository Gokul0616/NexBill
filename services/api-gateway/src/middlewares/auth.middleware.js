const jwt = require('jsonwebtoken');
const { identityUrl } = require('../config/services');

const requireAuth = (req, res, next) => {
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/payments/webhook', '/uploads'];
  const isPublic = publicPaths.some(p => req.path.startsWith(p));

  if (req.method === 'OPTIONS' || isPublic) {
    return next();
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    
    // Verify that the user still exists in the database and evaluate block states
    try {
      const response = await fetch(`${identityUrl}/api/auth/verification-status`, {
        headers: {
          'X-User-Payload': JSON.stringify(decoded)
        }
      });
      if (response.status === 401) {
        return res.status(401).json({ error: 'Unauthorized: User record no longer exists' });
      }
      
      const statusData = await response.json();
      
      // Centrally enforce User Block: Allow only GET requests (viewing data), block mutations
      if (statusData && (statusData.is_blocked === true || statusData.is_blocked === 'true')) {
        if (req.method !== 'GET' && req.method !== 'OPTIONS') {
          return res.status(403).json({
            error: 'Forbidden: Your account has been temporarily suspended by an administrator. Mutative operations are disabled.'
          });
        }
      }
    } catch (fetchErr) {
      console.error('Failed to verify user existence in gateway:', fetchErr.message);
    }

    req.user = decoded; // Attach user payload
    next();
  });
};

module.exports = requireAuth;
