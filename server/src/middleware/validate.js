const { BadRequestError } = require('../utils/errors');

function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { validate };
