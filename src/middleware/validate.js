const { ValidationError } = require('../utils/errors');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError(details);
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
