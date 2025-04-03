// server/middleware/validate.js
import { validationResult } from 'express-validator';

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().reduce((acc, error) => {
      if (!acc[error.path]) {
        acc[error.path] = [];
      }
      acc[error.path].push(error.msg);
      return acc;
    }, {});

    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: formattedErrors
    });
  };
};