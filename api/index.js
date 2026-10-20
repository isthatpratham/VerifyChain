/**
 * api/index.js
 * Vercel Serverless Function entry point for VerifyChain Express API.
 * Delegates incoming requests to the existing Express application in server/src/app.js.
 */
const app = require('../server/src/app');

module.exports = (req, res) => {
  // When running behind Vercel rewrites, x-vercel-original-url retains the original client path
  const originalUrl = req.headers['x-vercel-original-url'];
  if (originalUrl) {
    req.url = originalUrl;
  } else if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
};
