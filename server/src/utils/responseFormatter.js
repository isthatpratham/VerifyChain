const formatResponse = (data, message = null) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return response;
};

const formatError = (error, details = null) => {
  const response = { success: false, error };
  if (details) response.details = details;
  return response;
};

module.exports = {
  formatResponse,
  formatError,
};
