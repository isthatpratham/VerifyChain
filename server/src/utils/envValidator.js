/**
 * envValidator.js
 * Production environment configuration validator.
 * Validates presence and integrity of critical runtime environment variables at startup.
 * Never prints secret values to stdout/stderr.
 */

function validateEnv() {
  const isTest = process.env.NODE_ENV === 'test';
  const missing = [];
  const warnings = [];

  // Required in all non-test environments
  if (!process.env.DATABASE_URL && !isTest) {
    missing.push('DATABASE_URL');
  }

  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      missing.push('JWT_SECRET');
    } else {
      warnings.push('JWT_SECRET is unset; using local development default. Set a 32+ char secret in production.');
    }
  } else if (process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
    warnings.push('JWT_SECRET is shorter than 32 characters in production mode.');
  }

  if (warnings.length > 0) {
    warnings.forEach((warn) => console.warn(`[Config Warning] ${warn}`));
  }

  if (missing.length > 0) {
    const errorMsg = `[Config Error] Missing required environment variable(s): ${missing.join(', ')}`;
    console.error(errorMsg);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

module.exports = {
  validateEnv,
};
