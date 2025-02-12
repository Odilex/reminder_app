import { validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for response
    const formattedErrors = errors.array().reduce((acc, error) => {
      if (!acc[error.path]) {
        acc[error.path] = [];
      }
      acc[error.path].push(error.msg);
      return acc;
    }, {});

    res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
};

// Common validation rules
export const commonValidations = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    trim: true,
    escape: true
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    },
    matches: {
      options: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
      errorMessage: 'Password must contain at least one letter and one number'
    }
  },
  displayName: {
    trim: true,
    escape: true,
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Display name must be between 2 and 50 characters'
    }
  },
  mongoId: {
    isMongoId: true,
    errorMessage: 'Invalid ID format'
  },
  date: {
    isISO8601: true,
    toDate: true,
    errorMessage: 'Invalid date format'
  },
  time: {
    matches: {
      options: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/,
      errorMessage: 'Invalid time format (use HH:MM AM/PM)'
    }
  },
  category: {
    isIn: {
      options: [['Work', 'Personal', 'Shopping', 'Health']],
      errorMessage: 'Invalid category'
    }
  },
  priority: {
    isIn: {
      options: [['low', 'medium', 'high']],
      errorMessage: 'Invalid priority level'
    }
  }
};

// Sanitization middleware
export const sanitize = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
}; 