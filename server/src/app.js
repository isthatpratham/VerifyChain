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

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

// Public Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'VerifyChain API is running',
  });
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
trustLifecycleBackfillService.runBackfill().catch((err) => {
  console.error('[App] Startup trust lifecycle backfill notice:', err.message);
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`VerifyChain API running on port ${PORT}`);
  });
}

module.exports = app;
