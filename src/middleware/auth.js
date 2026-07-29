const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AuthError } = require('../utils/errors');

const tokenBlacklist = new Set();

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthError('NO_TOKEN', 'Token d\'authentification requis');
  }

  const token = header.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    throw new AuthError('TOKEN_REVOKED', 'Ce token a été révoqué');
  }

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.user = {
      id: payload.sub,
      role: payload.role,
      teacherId: payload.teacherId || null,
      email: payload.email || null,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('TOKEN_EXPIRED', 'Token expiré');
    }
    throw new AuthError('INVALID_TOKEN', 'Token invalide');
  }
}

function revokeToken(token) {
  tokenBlacklist.add(token);
}

module.exports = { authenticate, revokeToken };
