const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, _next) {
  if (err.isOperational) {
    const body = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      body.error.details = err.details;
    }
    return res.status(err.statusCode).json(body);
  }

  console.error('[UNHANDLED]', err);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token invalide ou expiré' },
    });
  }

  if (err.name === 'SyntaxError' && err.status === 400) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'JSON mal formé' },
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' },
  });
}

module.exports = errorHandler;
