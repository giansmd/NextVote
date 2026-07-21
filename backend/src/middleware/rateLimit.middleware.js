// Simple in-memory rate limiting for demonstration.
// In a real production app, use 'express-rate-limit' or similar with Redis.
const rateLimitCache = new Map();

function rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip;
    const currentTime = Date.now();
    
    if (!rateLimitCache.has(ip)) {
      rateLimitCache.set(ip, { count: 1, startTime: currentTime });
      return next();
    }

    const clientData = rateLimitCache.get(ip);
    if (currentTime - clientData.startTime < windowMs) {
      if (clientData.count >= limit) {
        return res.status(429).json({ error: 'Demasiadas solicitudes. Por favor intente más tarde.' });
      }
      clientData.count++;
      rateLimitCache.set(ip, clientData);
    } else {
      rateLimitCache.set(ip, { count: 1, startTime: currentTime });
    }
    
    next();
  };
}

module.exports = { rateLimiter };