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

const { validateEnv } = require('./utils/envValidator');
const prisma = require('./utils/prismaClient');

// Run startup environment validation
validateEnv();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

// Track startup backfill state
let backfillState = { status: 'INITIALIZING', completedAt: null, error: null };

// Public Liveness Probe Endpoint (fast process heartbeat)
app.get(['/api/health', '/api/health/live'], (req, res) => {
  res.json({
    success: true,
    status: 'UP',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Public Readiness Probe Endpoint (verifies active database connection and subsystem readiness)
app.get('/api/health/ready', async (req, res) => {
  try {
    // Actively probe database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const isReady = backfillState.status !== 'FAILED';
    const statusCode = isReady ? 200 : 503;

    return res.status(statusCode).json({
      success: isReady,
      status: isReady ? 'READY' : 'DEGRADED',
      checks: {
        database: 'CONNECTED',
        startupBackfill: backfillState.status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (dbError) {
    return res.status(503).json({
      success: false,
      status: 'NOT_READY',
      checks: {
        database: 'DISCONNECTED',
        startupBackfill: backfillState.status,
      },
      error: 'Database connection check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Auth Routes (Public: POST /register, POST /login; Protected: GET /me)
app.use('/api/auth', authRoutes);

// MSME Profile Routes (Protected: POST /profile, GET /profile, PATCH /profile)
app.use('/api/msme', msmeRoutes);

// Verification Routes (Protected: POST /verify/gstin, POST /verify/pan, POST /verify/udyam, GET /verification/status)
app.use('/api/msme', verificationRoutes);

// Compliance Data Foundation Routes (Protected: CRUD on /api/compliance and /api/msme/compliance)
app.use('/api/compliance', complianceRoutes);
app.use('/api/msme/compliance', complianceRoutes);

// Supplier Trust Platform Foundation Routes (Public & Protected)
app.use('/api/supplier-trust', supplierTrustRoutes);

// Trust Distribution Architecture Foundation Routes (Protected)
app.use('/api/trust-distribution', trustDistributionRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Trigger Idempotent Enterprise Trust Lifecycle Startup Backfill
trustLifecycleBackfillService
  .runBackfill()
  .then((result) => {
    if (result && result.success) {
      backfillState = { status: 'READY', completedAt: new Date().toISOString(), error: null };
    } else {
      backfillState = { status: 'DEGRADED', completedAt: new Date().toISOString(), error: result?.error || null };
    }
  })
  .catch((err) => {
    console.error('[App] Startup trust lifecycle backfill notice:', err.message);
    backfillState = { status: 'FAILED', completedAt: new Date().toISOString(), error: err.message };
  });

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`VerifyChain API running on port ${PORT}`);
  });
}

module.exports = app;
