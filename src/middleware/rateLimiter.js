const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Trop de requêtes. Réessayez plus tard.' },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 9999,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  },
});

module.exports = { limiter, authLimiter };
