require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const msmeRoutes = require('./routes/msme.routes');
const verificationRoutes = require('./routes/verification.routes');
const complianceRoutes = require('./routes/compliance.routes');
const supplierTrustRoutes = require('./routes/supplierTrust.routes');
const trustDistributionRoutes = require('./routes/trustDistribution.routes');
const errorHandler = require('./middleware/errorHandler');
const trustLifecycleBackfillService = require('./services/trustLifecycleBackfill.service');

const app = express();

// ─── SECURITY HEADERS (HELMET) ───────────────────────────────────────────────
// Configures Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options,
// Referrer-Policy, X-XSS-Protection, and removes X-Powered-By.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding trust badges
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Strict origin whitelist — only the configured CLIENT_URL is allowed.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman, health probes)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-request-id', 'x-correlation-id'],
  exposedHeaders: ['x-request-id', 'x-correlation-id', 'x-ratelimit-remaining'],
  maxAge: 600, // Preflight cache: 10 minutes
}));

// ─── REQUEST PARSING ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── REQUEST LOGGING ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── HEALTH, READINESS & LIVENESS PROBES ──────────────────────────────────────
const healthRoutes = require('./api/v1/routes/health.routes');
app.use('/health', healthRoutes);

// Legacy health endpoint preserved for backwards compatibility
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VerifyChain API is running' });
});

// ─── APPLICATION ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/msme', msmeRoutes);
app.use('/api/msme', verificationRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/msme/compliance', complianceRoutes);
app.use('/api/supplier-trust', supplierTrustRoutes);
app.use('/api/trust-distribution', trustDistributionRoutes);

// Public API Platform v1 Router (RESTful, Versioned, OpenApi Spec & Swagger UI)
const apiV1Router = require('./api/v1');
app.use('/api/v1', apiV1Router);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── CENTRALIZED ERROR HANDLER ────────────────────────────────────────────────
app.use(errorHandler);

// ─── STARTUP INITIALIZATION ───────────────────────────────────────────────────
const AuditPublisher = require('./audit/AuditPublisher');
AuditPublisher.publishSystem({
  action: 'SYSTEM_STARTUP',
  status: 'SUCCESS',
  details: { environment: process.env.NODE_ENV || 'development', version: 'v1.0.0' },
}).catch(() => {});

// Idempotent Provider Registry Initializer
const { ProviderRegistryInitializer } = require('./connectorPlatform');
ProviderRegistryInitializer.initialize().catch((err) => {
  console.error('[App] Startup Provider Registry initialization notice:', err.message);
});

// Idempotent Trust Lifecycle Backfill
trustLifecycleBackfillService.runBackfill().catch((err) => {
  console.error('[App] Startup trust lifecycle backfill notice:', err.message);
});

// Initialize Outbound Webhook Event Dispatcher
const { WebhookEventDispatcher } = require('./webhookPlatform');
WebhookEventDispatcher.initialize();

// ─── PROCESS-LEVEL SAFETY ─────────────────────────────────────────────────────
// Prevent unhandled promise rejections and uncaught exceptions from crashing the process.
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  // In production, allow the process manager (PM2/K8s) to restart cleanly.
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
let server;

function gracefulShutdown(signal) {
  console.log(`[Process] ${signal} received. Shutting down gracefully...`);
  AuditPublisher.publishSystem({
    action: 'SYSTEM_SHUTDOWN',
    status: 'SUCCESS',
    details: { signal },
  }).catch(() => {});
  if (server) {
    server.close(() => {
      console.log('[Process] HTTP server closed.');
      process.exit(0);
    });
    // Force exit after 10 seconds if connections aren't draining
    setTimeout(() => {
      console.error('[Process] Forceful shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── SERVER START ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`VerifyChain API running on port ${PORT}`);
    console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health      : http://localhost:${PORT}/health/liveness`);
    console.log(`  API v1      : http://localhost:${PORT}/api/v1`);
  });
}

module.exports = app;
