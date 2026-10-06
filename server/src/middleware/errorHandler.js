const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error with context while safeguarding sensitive information
  console.error(`[Error] ${err.name || 'Error'} (${statusCode}): ${err.message}`);

  // In production/general 500s, do not expose raw unhandled exceptions or database internals
  const message =
    statusCode === 500 && isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error';

  const response = {
    success: false,
    error: message,
    code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
  };

  if (err.details) {
    response.details = err.details;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;

