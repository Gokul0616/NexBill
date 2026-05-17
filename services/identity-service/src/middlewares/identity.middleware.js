const identityMiddleware = (req, res, next) => {
  const userPayload = req.headers['x-user-payload'];
  
  if (userPayload) {
    try {
      req.user = JSON.parse(userPayload);
    } catch (err) {
      console.error('Failed to parse user payload header', err);
    }
  }
  
  next();
};

module.exports = identityMiddleware;
