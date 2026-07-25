/**
 * predictiveIntelligence.routes.js
 * REST API Routes for Phase 9.5 Predictive Intelligence & Forecasting (/api/v1/predictive-intelligence).
 */

const express = require('express');
const { PredictiveIntelligence } = require('../../../predictiveIntelligence');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Generate Comprehensive Predictive Forecast
 * POST /api/v1/predictive-intelligence/forecast
 */
router.post('/forecast', requireScope('ai.forecasting.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const forecast = await PredictiveIntelligence.getForecast(msmeId);
    return sendSuccess(res, { statusCode: 200, data: forecast });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'FORECAST_GENERATE_ERROR', message: 'Failed to generate forecast.', details: err.message });
  }
});

/**
 * Get Trend Analysis
 * GET /api/v1/predictive-intelligence/trends
 */
router.get('/trends', requireScope('ai.predictions.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const metricName = req.query.metricName || 'TRUST_SCORE';
    const trend = await PredictiveIntelligence.getTrends(msmeId, metricName);
    return sendSuccess(res, { statusCode: 200, data: trend });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'TREND_FETCH_ERROR', message: 'Failed to fetch trends.', details: err.message });
  }
});

/**
 * Get Early Warning Alerts
 * GET /api/v1/predictive-intelligence/early-warnings
 */
router.get('/early-warnings', requireScope('ai.alerts.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const warnings = await PredictiveIntelligence.getEarlyWarnings(msmeId);
    return sendSuccess(res, { statusCode: 200, data: warnings });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WARNINGS_FETCH_ERROR', message: 'Failed to fetch early warnings.', details: err.message });
  }
});

/**
 * Run What-If Scenario Simulation
 * POST /api/v1/predictive-intelligence/simulate
 */
router.post('/simulate', requireScope('ai.scenarios.run'), async (req, res) => {
  try {
    const { scenarioType, params } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;

    const simulation = await PredictiveIntelligence.runScenarioSimulation({
      scenarioType: scenarioType || 'GST_DELAY',
      params: params || {},
      msmeId,
    });

    return sendSuccess(res, { statusCode: 200, data: simulation });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'SIMULATION_ERROR', message: 'Failed to execute scenario simulation.', details: err.message });
  }
});

/**
 * Submit Feedback Rating
 * POST /api/v1/predictive-intelligence/feedback
 */
router.post('/feedback', requireScope('ai.predictions.manage'), async (req, res) => {
  try {
    const { predictionId, isAccurate, notes } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;

    const feedback = await PredictiveIntelligence.submitFeedback({ msmeId, predictionId, isAccurate, notes });
    return sendSuccess(res, { statusCode: 200, data: feedback });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'FEEDBACK_SUBMIT_ERROR', message: 'Failed to submit feedback.', details: err.message });
  }
});

module.exports = router;
