const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { validateEnv } = require('../src/utils/envValidator');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const { hashPassword, comparePassword } = require('../src/utils/password');
const errorHandler = require('../src/middleware/errorHandler');

describe('Phase 13 Security & Backend Hardening Verification Suite', () => {
  describe('Environment Validation Guard (13.2.6 & 13.3.8)', () => {
    test('validateEnv should pass when mandatory variables are populated', () => {
      assert.doesNotThrow(() => {
        validateEnv();
      });
    });

    test('validateEnv should throw in production when critical variables are missing', () => {
      const originalJwtSecret = process.env.JWT_SECRET;
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;
        assert.throws(
          () => {
            validateEnv();
          },
          {
            name: 'Error',
            message: /JWT_SECRET/,
          }
        );
      } finally {
        process.env.JWT_SECRET = originalJwtSecret;
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

  });

  describe('Authentication Cryptography & Token Tampering (13.3.1)', () => {
    test('Password hashing should generate bcrypt salted hashes and verify correctly', async () => {
      const password = 'StrongPassword#2026';
      const hash = await hashPassword(password);
      assert.notEqual(hash, password);
      assert.ok(hash.startsWith('$2'), 'Bcrypt hash prefix check');

      const isMatch = await comparePassword(password, hash);
      assert.equal(isMatch, true);

      const isWrongMatch = await comparePassword('WrongPassword', hash);
      assert.equal(isWrongMatch, false);
    });

    test('JWT Token Generation and Signature Verification', () => {
      const payload = { id: 'usr-12345', email: 'auditor@verifychain.io', role: 'ADMIN' };
      const token = generateToken(payload);
      assert.ok(typeof token === 'string');

      const decoded = verifyToken(token);
      assert.equal(decoded.id, payload.id);
      assert.equal(decoded.email, payload.email);
      assert.equal(decoded.role, payload.role);
    });

    test('JWT Token Verification should reject tampered payloads or signatures', () => {
      const token = generateToken({ id: 'usr-555', role: 'USER' });
      const tamperedToken = `${token}spoofed`;
      assert.throws(() => {
        verifyToken(tamperedToken);
      });
    });
  });

  describe('Centralized Error Handling Sanitization (13.2.1)', () => {
    test('Should format bad request errors with structured code and details', () => {
      const req = {};
      let responseBody = null;
      let responseStatus = null;
      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (body) => {
              responseBody = body;
            },
          };
        },
      };

      const err = new Error('Invalid input supplied');
      err.statusCode = 400;
      err.code = 'VALIDATION_FAILED';
      err.details = [{ field: 'gstin', msg: 'GSTIN format is invalid' }];

      errorHandler(err, req, res, () => {});

      assert.equal(responseStatus, 400);
      assert.equal(responseBody.success, false);
      assert.equal(responseBody.error, 'Invalid input supplied');
      assert.equal(responseBody.code, 'VALIDATION_FAILED');
      assert.deepEqual(responseBody.details, [{ field: 'gstin', msg: 'GSTIN format is invalid' }]);
    });

    test('Should sanitize 500 errors in production environment', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const req = {};
        let responseBody = null;
        let responseStatus = null;
        const res = {
          status: (code) => {
            responseStatus = code;
            return {
              json: (body) => {
                responseBody = body;
              },
            };
          },
        };

        const sensitiveErr = new Error('Prisma database connection pool timed out at postgresql://user:secret@db:5432');
        sensitiveErr.statusCode = 500;

        errorHandler(sensitiveErr, req, res, () => {});

        assert.equal(responseStatus, 500);
        assert.equal(responseBody.success, false);
        assert.equal(responseBody.error, 'Internal server error');
        assert.equal(responseBody.code, 'INTERNAL_SERVER_ERROR');
        assert.equal(responseBody.details, undefined);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});
