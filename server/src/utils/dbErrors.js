class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

class DuplicateError extends AppError {
  constructor(message = 'Duplicate record found', details = null) {
    super(message, 400, 'DUPLICATE_RECORD', details);
  }
}

class ForeignKeyError extends AppError {
  constructor(message = 'Related resource not found', details = null) {
    super(message, 400, 'FOREIGN_KEY_VIOLATION', details);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Database validation error', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

const mapPrismaError = (error) => {
  if (!error) return new AppError('Unknown database error');

  if (error instanceof AppError) return error;

  if (error.code) {
    switch (error.code) {
      case 'P2002': {
        const fields = error.meta?.target || [];
        return new DuplicateError(`Duplicate entry for field(s): ${fields.join(', ')}`, { fields });
      }
      case 'P2003': {
        const field = error.meta?.field_name || 'foreign_key';
        return new ForeignKeyError(`Foreign key constraint failed on ${field}`, { field });
      }
      case 'P2025': {
        return new NotFoundError(error.meta?.cause || 'Record to update/delete does not exist');
      }
      case 'P2000': {
        return new ValidationError('Value provided for column is too long');
      }
      case 'P2001': {
        return new NotFoundError('Record searched for does not exist');
      }
      default:
        return new AppError(`Database error: ${error.message}`, 500, 'DB_ERROR', { code: error.code });
    }
  }

  return new AppError(error.message || 'Internal database error');
};

module.exports = {
  AppError,
  NotFoundError,
  DuplicateError,
  ForeignKeyError,
  ValidationError,
  mapPrismaError,
};
