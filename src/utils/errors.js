class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(details) {
    super(400, 'VALIDATION_ERROR', 'Données invalides', details);
  }
}

class AuthError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = 'Non authentifié') {
    super(401, code, message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Accès interdit') {
    super(403, 'FORBIDDEN', message);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable') {
    super(404, 'NOT_FOUND', message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit') {
    super(409, 'CONFLICT', message);
  }
}

module.exports = {
  AppError, ValidationError, AuthError, ForbiddenError, NotFoundError, ConflictError,
};
