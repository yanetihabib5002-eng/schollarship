const { ForbiddenError } = require('../utils/errors');

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ForbiddenError('Authentification requise');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Accès réservé aux rôles : ${roles.join(', ')}`);
    }
    next();
  };
}

module.exports = { requireRole };
