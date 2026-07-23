const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  const response = { error: message };
  if (err.details) {
    response.details = err.details;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
